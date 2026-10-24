import test from 'node:test';
import assert from 'node:assert/strict';
import { AutomaticOrderStatusService } from '../dist/services/orderService/automaticOrderStatusService.js';

const minute = 60_000;
const order = (changes = {}) => ({ id: 'one', tipo: 'DELIVERY', status: 'PRONTO',
  confirmadoEm: new Date(0), updatedAt: new Date(0), ...changes });
const flush = async () => { for (let i = 0; i < 60; i++) await Promise.resolve(); };
function fixture(initial = []) {
  let now = 0, next = 0;
  const timers = new Map();
  const rows = new Map(initial.map(p => [p.id, structuredClone(p)]));
  const calls = { pending: 0, get: 0, transitions: [] };
  const failures = { pending: 0, get: 0, transition: 0, afterCommit: 0 };
  let beforeWrite;
  const clock = {
    now: () => now,
    set: (callback, delay) => { const id = ++next; timers.set(id, { at: now + delay, callback }); return id; },
    clear: id => timers.delete(id),
  };
  const repo = {
    pending: async () => {
      calls.pending++;
      if (failures.pending-- > 0) throw Error('temporary');
      return [...rows.values()].filter(p => p.tipo === 'DELIVERY' && p.confirmadoEm &&
        ['PRONTO', 'SAIU_PARA_ENTREGA'].includes(p.status)).map(p => structuredClone(p));
    },
    get: async id => {
      calls.get++;
      if (failures.get-- > 0) throw Error('temporary');
      return structuredClone(rows.get(id) ?? null);
    },
    transition: async (snapshot, status) => {
      if (failures.transition-- > 0) throw Error('temporary');
      beforeWrite?.();
      const current = rows.get(snapshot.id);
      if (current && JSON.stringify(current) === JSON.stringify(snapshot)) {
        rows.set(current.id, { ...current, status, updatedAt: new Date(current.updatedAt.getTime() + 1) });
        calls.transitions.push(status);
      }
      if (failures.afterCommit-- > 0) throw Error('response lost');
    },
  };
  const scheduler = new AutomaticOrderStatusService(repo, clock, () => {});
  const advance = async target => {
    await flush();
    for (;;) {
      const due = [...timers.entries()].filter(([, t]) => t.at <= target).sort((a,b) => a[1].at-b[1].at)[0];
      if (!due) break;
      now = due[1].at; timers.delete(due[0]); due[1].callback(); await flush();
    }
    now = target; await flush();
  };
  return { scheduler, repo, rows, calls, timers, failures, advance,
    setNow: value => { now = value; }, beforeWrite: fn => { beforeWrite = fn; } };
}

test('idle recovery queries once; no timers or database calls over a day', async () => {
  const f = fixture(); f.scheduler.start(); f.scheduler.start(); await f.advance(24*60*minute);
  assert.deepEqual(f.calls, { pending: 1, get: 0, transitions: [] });
  assert.equal(f.timers.size, 0);
});

test('exact 20/60 minute boundaries, then no further queries', async () => {
  const f = fixture([order()]); f.scheduler.synchronize(order());
  await f.advance(20*minute-1); assert.equal(f.calls.get, 0);
  await f.advance(20*minute); assert.equal(f.rows.get('one').status, 'SAIU_PARA_ENTREGA');
  await f.advance(60*minute-1); assert.equal(f.rows.get('one').status, 'SAIU_PARA_ENTREGA');
  await f.advance(60*minute); assert.equal(f.rows.get('one').status, 'ENTREGUE');
  const reads = f.calls.get; await f.advance(24*60*minute);
  assert.equal(f.calls.get, reads); assert.equal(f.timers.size, 0);
});

test('only DELIVERY with confirmation and eligible status is scheduled', async () => {
  const f = fixture();
  for (const changes of [{ tipo: 'RETIRADA' }, { confirmadoEm: null }, { status: 'CANCELADO' },
    { status: 'ENTREGUE' }, { status: 'AGUARDANDO_CONFIRMACAO' }]) f.scheduler.synchronize(order(changes));
  await f.advance(100*minute); assert.equal(f.calls.get, 0); assert.equal(f.timers.size, 0);
});

test('cancel and manual completion remove timers', async () => {
  for (const status of ['CANCELADO', 'ENTREGUE']) {
    const f = fixture([order()]); f.scheduler.synchronize(order());
    f.rows.get('one').status = status; f.scheduler.synchronize(f.rows.get('one'));
    await f.advance(100*minute); assert.equal(f.calls.get, 0); assert.equal(f.rows.get('one').status, status);
  }
});

test('manual departure at minute 5 preserves delivery deadline at minute 60', async () => {
  const f = fixture([order()]); f.scheduler.synchronize(order()); await f.advance(5*minute);
  f.rows.get('one').status = 'SAIU_PARA_ENTREGA'; f.scheduler.synchronize(f.rows.get('one'));
  await f.advance(60*minute-1); assert.equal(f.calls.get, 0);
  await f.advance(60*minute); assert.equal(f.rows.get('one').status, 'ENTREGUE');
});

test('restart reconstructs future deadlines from persisted confirmation', async () => {
  const f = fixture([order()]); f.setNow(10*minute); f.scheduler.start(); await f.advance(20*minute-1);
  assert.equal(f.rows.get('one').status, 'PRONTO'); await f.advance(20*minute);
  assert.equal(f.rows.get('one').status, 'SAIU_PARA_ENTREGA');
});

test('recovery executes both overdue transitions in sequence', async () => {
  const f = fixture([order()]); f.setNow(90*minute); f.scheduler.start(); await f.advance(90*minute);
  assert.deepEqual(f.calls.transitions, ['SAIU_PARA_ENTREGA', 'ENTREGUE']); assert.equal(f.timers.size, 0);
});

test('recovery completes overdue departures and ignores deleted records', async () => {
  const f = fixture([order({ status: 'SAIU_PARA_ENTREGA' })]);
  f.setNow(90*minute); f.scheduler.start(); await f.advance(90*minute);
  assert.deepEqual(f.calls.transitions, ['ENTREGUE']);
  f.scheduler.synchronize(order({ id: 'deleted' })); await f.advance(90*minute);
  assert.equal(f.timers.size, 0);
});

test('recovery retries progressively, then stops querying once idle', async () => {
  const f = fixture(); f.failures.pending = 3; f.scheduler.start(); await flush();
  assert.equal(f.calls.pending, 1); await f.advance(4999); assert.equal(f.calls.pending, 1);
  await f.advance(5000); assert.equal(f.calls.pending, 2);
  await f.advance(15000); assert.equal(f.calls.pending, 3);
  await f.advance(35000); assert.equal(f.calls.pending, 4);
  await f.advance(24*60*minute); assert.equal(f.calls.pending, 4); assert.equal(f.timers.size, 0);
});

for (const failure of ['get', 'transition', 'afterCommit']) {
  test(`temporary ${failure} failure preserves task and recovers`, async () => {
    const f = fixture([order()]); f.failures[failure] = 1; f.scheduler.synchronize(order());
    await f.advance(20*minute); await f.advance(20*minute+5000);
    assert.equal(f.rows.get('one').status, 'SAIU_PARA_ENTREGA');
    await f.advance(60*minute); assert.equal(f.rows.get('one').status, 'ENTREGUE');
    assert.deepEqual(f.calls.transitions, ['SAIU_PARA_ENTREGA', 'ENTREGUE']);
  });
}

test('concurrent manual change between read and write is preserved', async () => {
  const f = fixture([order()]); f.scheduler.synchronize(order());
  f.beforeWrite(() => { f.rows.get('one').status = 'CANCELADO'; });
  await f.advance(20*minute); assert.equal(f.rows.get('one').status, 'CANCELADO');
  assert.deepEqual(f.calls.transitions, []); assert.equal(f.timers.size, 0);
});

test('manual cancellation during retry clears the failed task', async () => {
  const f = fixture([order()]); f.failures.get = 1; f.scheduler.synchronize(order());
  await f.advance(20*minute); f.rows.get('one').status = 'CANCELADO';
  f.scheduler.synchronize(f.rows.get('one')); const reads = f.calls.get;
  await f.advance(90*minute); assert.equal(f.calls.get, reads); assert.equal(f.timers.size, 0);
});

test('recovery does not resurrect a cancellation committed during its read', async () => {
  const f = fixture([order()]); let resolve;
  f.repo.pending = () => new Promise(r => { resolve = r; });
  f.scheduler.start(); f.rows.get('one').status = 'CANCELADO'; f.scheduler.synchronize(f.rows.get('one'));
  f.repo.pending = async () => [];
  resolve([order()]); await f.advance(100*minute);
  assert.equal(f.timers.size, 0); assert.deepEqual(f.calls.transitions, []);
});

test('stop clears timers and ignores in-flight recovery', async () => {
  const f = fixture([order()]); let resolve;
  f.repo.pending = () => new Promise(r => { resolve = r; }); f.scheduler.start(); f.scheduler.stop();
  resolve([order()]); await f.advance(100*minute); assert.equal(f.timers.size, 0); assert.equal(f.calls.get, 0);
});

test('real scheduler replacement after shutdown recovers persisted pending order', async () => {
  const f = fixture([order()]); f.scheduler.synchronize(order()); await f.advance(10*minute);
  f.scheduler.stop(); f.setNow(70*minute);
  const replacementClock = {
    now: () => 70*minute,
    set: callback => { f.timers.set('replacement', { callback }); return 'replacement'; },
    clear: id => f.timers.delete(id),
  };
  const replacement = new AutomaticOrderStatusService(f.repo, replacementClock, () => {});
  replacement.start(); await flush();
  const due = f.timers.get('replacement'); f.timers.delete('replacement'); due.callback(); await flush();
  assert.equal(f.rows.get('one').status, 'ENTREGUE'); assert.equal(f.timers.size, 0); replacement.stop();
});

test('retry delay is capped at five minutes without losing the task', async () => {
  const f = fixture([order()]); f.failures.get = 100; f.scheduler.synchronize(order());
  await f.advance(20*minute);
  for (let attempt = 0; attempt < 9; attempt++) {
    const timer = [...f.timers.values()][0];
    const expected = Math.min(5000 * 2**attempt, 300000);
    const previousTime = attempt === 0 ? 20*minute : f.lastTime;
    assert.equal(timer.at - previousTime, expected);
    f.lastTime = timer.at; await f.advance(timer.at);
  }
  f.failures.get = 0; await f.advance([...f.timers.values()][0].at);
  assert.equal(f.rows.get('one').status, 'SAIU_PARA_ENTREGA'); f.scheduler.stop();
});

test('cancellation during an in-flight read cannot resurrect its timer', async () => {
  const f = fixture([order()]); f.scheduler.synchronize(order()); let resolve;
  f.repo.get = () => new Promise(r => { resolve = r; });
  await f.advance(20*minute); f.rows.get('one').status = 'CANCELADO';
  f.scheduler.synchronize(f.rows.get('one')); resolve(order()); await flush();
  assert.equal(f.timers.size, 0); assert.deepEqual(f.calls.transitions, []);
});
