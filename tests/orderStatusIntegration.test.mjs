import test from 'node:test';
import assert from 'node:assert/strict';

// Explicit dummy URL: importing Prisma must never use a real database credential.
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
const { prisma } = await import('../dist/lib/prisma.js');
const { orderStatusScheduler } = await import('../dist/services/orderService/orderStatusScheduler.js');
const { confirmOrderService } = await import('../dist/services/orderService/confirmOrderService.js');
const { cancelOrderService } = await import('../dist/services/orderService/cancelOrderService.js');
const { entregueOrderService } = await import('../dist/services/orderService/deliveredOrderService.js');
const { SaiuEntregaOrderService } = await import('../dist/services/orderService/outForDeliveryOrderController.js');

const base = { id: 'one', tipo: 'DELIVERY', status: 'PRONTO', confirmadoEm: new Date(0), updatedAt: new Date(1) };

for (const [name, Service, from, to] of [
  ['confirmation', confirmOrderService, 'AGUARDANDO_CONFIRMACAO', 'PRONTO'],
  ['cancellation', cancelOrderService, 'PRONTO', 'CANCELADO'],
  ['manual departure', SaiuEntregaOrderService, 'PRONTO', 'SAIU_PARA_ENTREGA'],
  ['manual completion', entregueOrderService, 'SAIU_PARA_ENTREGA', 'ENTREGUE'],
]) {
  test(`${name} schedules only after successful guarded persistence`, async () => {
    const previous = { ...base, status: from };
    const updated = { ...previous, status: to };
    const events = [];
    prisma.pedido.findUnique = async () => previous;
    prisma.pedido.update = async args => {
      assert.deepEqual(args.where, { id: 'one', status: from, updatedAt: previous.updatedAt });
      assert.equal(args.data.status, to);
      if (name === 'confirmation') assert.ok(args.data.confirmadoEm instanceof Date);
      events.push('saved'); return updated;
    };
    orderStatusScheduler.synchronize = value => { assert.equal(value, updated); events.push('scheduled'); };
    assert.equal(await new Service().execute('one'), updated);
    assert.deepEqual(events, ['saved', 'scheduled']);
    events.length = 0;
    prisma.pedido.update = async () => { throw Error('concurrent change'); };
    await assert.rejects(new Service().execute('one'), /concurrent change/);
    assert.deepEqual(events, []);
  });
}

test('Prisma adapter uses an atomic conditional update and minimal recovery selection', async () => {
  const writes = [];
  prisma.pedido.updateMany = async args => { writes.push(args); return { count: 0 }; };
  await orderStatusScheduler.repository.transition(base, 'SAIU_PARA_ENTREGA');
  assert.deepEqual(writes, [{ where: {
    id: 'one', tipo: 'DELIVERY', status: 'PRONTO', confirmadoEm: base.confirmadoEm, updatedAt: base.updatedAt,
  }, data: { status: 'SAIU_PARA_ENTREGA' } }]);
  let recovery;
  prisma.pedido.findMany = async args => { recovery = args; return []; };
  await orderStatusScheduler.repository.pending();
  assert.deepEqual(recovery.where, {
    tipo: 'DELIVERY', confirmadoEm: { not: null }, status: { in: ['PRONTO', 'SAIU_PARA_ENTREGA'] },
  });
  assert.deepEqual(Object.keys(recovery.select).sort(), ['confirmadoEm','id','status','tipo','updatedAt']);
});
