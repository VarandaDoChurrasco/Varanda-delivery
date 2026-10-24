import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { EventEmitter } from 'node:events';
import express from 'express';
import { createWhatsAppRouter } from '../dist/routes/whatsapp.js';

const flush = async () => { for (let i = 0; i < 50; ++i) await Promise.resolve(); };
const deferred = () => { let resolve; const promise = new Promise(r => resolve = r); return { promise, resolve }; };

// Executa o serviço compilado com os imports externos substituídos: sem rede,
// banco, Hélia ou acesso à pasta real de autenticação.
async function fixture() {
  const sockets = [], calls = [], auth = [];
  let saving, qrWait;
  const f = {
    makeWASocket: options => {
      const sock = { ev: new EventEmitter(), options, end: async () => { calls.push('end'); } };
      sockets.push(sock); return sock;
    },
    useMultiFileAuthState: async () => {
      const state = { keys: { set: async () => { calls.push('keys'); await saving?.promise; } } };
      auth.push(state);
      return { state, saveCreds: async () => { calls.push('save'); await saving?.promise; calls.push('saved'); } };
    },
    DisconnectReason: { loggedOut: 401 }, downloadMediaMessage() {},
    qrcode: { generate() {} }, QRCode: { toDataURL: async qr => { await qrWait?.promise; return 'data:' + qr; } },
    mkdir: async () => {}, rm: async () => { calls.push('rm'); },
    setWhatsAppSocket: sock => { f.current = sock; },
  };
  let source = await readFile(new URL('../dist/services/whatsapp/whatsapp.service.js', import.meta.url), 'utf8');
  source = source.replace(/^\/\/.*$/gm, '');
  const names = [];
  source = source.replace(/import\s+([\s\S]*?)\s+from\s+['"][^'"]+['"];?/g, (_, bindings) => {
    names.push(...bindings.replace(/[{},]/g, ' ').trim().split(/\s+/));
    return '';
  });
  for (const name of names) if (!(name in f)) f[name] = class {};
  globalThis.__whatsappFixture = f;
  const prelude = `const { ${names.join(', ')} } = globalThis.__whatsappFixture;\n`;
  const { WhatsAppService } = await import('data:text/javascript;base64,' + Buffer.from(prelude + source + `\n// ${Math.random()}`).toString('base64'));
  delete globalThis.__whatsappFixture;
  return { service: new WhatsAppService(), sockets, calls, auth, f,
    blockSave: () => (saving = deferred()), blockQr: () => (qrWait = deferred()) };
}

test('iniciar simultâneo e conectado é idempotente; leitura não reinicia', async () => {
  const { service, sockets, f } = await fixture();
  await Promise.all([service.iniciar(), service.iniciar(), service.iniciar()]);
  assert.equal(sockets.length, 1);
  assert.equal(service.getStatus().status, 'conectando');
  sockets[0].ev.emit('connection.update', { qr: 'one' }); await flush();
  assert.equal(service.getQrCode(), 'data:one');
  sockets[0].ev.emit('connection.update', { connection: 'open' });
  await service.iniciar();
  assert.deepEqual(service.getStatus(), { status: 'conectado', qr: null });
  assert.equal(sockets.length, 1); assert.equal(f.current, sockets[0]);
});

test('reset aguarda saveCreds, bloqueia escritas/eventos antigos e cria uma conexão', async () => {
  const { service, sockets, calls, f, auth, blockSave, blockQr } = await fixture();
  await service.iniciar();
  const old = sockets[0];
  const lateConnection = old.ev.listeners('connection.update')[0];
  const lateCreds = old.ev.listeners('creds.update')[0];
  const qr = blockQr(); old.ev.emit('connection.update', { qr: 'old' });
  const save = blockSave(); old.ev.emit('creds.update'); await flush();
  const reset = service.resetar(); const duplicate = service.resetar();
  assert.equal(reset, duplicate);
  await flush(); assert.ok(calls.includes('end')); assert.ok(!calls.includes('rm'));
  lateCreds(); const staleKeys = auth[0].keys.set({});
  await lateConnection({ connection: 'close' });
  qr.resolve(); await flush(); assert.equal(service.getQrCode(), null);
  save.resolve(); await staleKeys; await reset;
  assert.ok(calls.indexOf('saved') < calls.indexOf('rm'));
  assert.equal(calls.filter(c => c === 'save').length, 1);
  assert.ok(!calls.includes('keys'));
  assert.equal(sockets.length, 2); assert.equal(f.current, sockets[1]);
  sockets[1].ev.emit('connection.update', { qr: 'new' }); await flush();
  assert.equal(service.getQrCode(), 'data:new');
});

test('close reconecta uma vez; logout fica desconectado até iniciar', async () => {
  const { service, sockets } = await fixture(); await service.iniciar();
  const late = sockets[0].ev.listeners('connection.update')[0];
  await late({ connection: 'close' }); await late({ connection: 'close' }); await flush();
  assert.equal(sockets.length, 2);
  sockets[1].ev.emit('connection.update', { connection: 'close', lastDisconnect: { error: { output: { statusCode: 401 } } } });
  await flush(); assert.equal(sockets.length, 2);
  assert.equal(service.getStatus().status, 'desconectado');
  await service.iniciar(); assert.equal(sockets.length, 3);
});

test('rotas POST falham fechadas; GET apenas consulta; token autoriza controles', async () => {
  const previous = process.env.WHATSAPP_ADMIN_TOKEN;
  let starts = 0, resets = 0;
  const app = express();
  app.use('/whatsapp', createWhatsAppRouter({ getStatus: () => ({ status: 'desconectado', qr: null }),
    iniciar: async () => { starts++; }, resetar: async () => { resets++; } }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}/whatsapp`;
  try {
    delete process.env.WHATSAPP_ADMIN_TOKEN;
    assert.equal((await fetch(url + '/iniciar', { method: 'POST' })).status, 503);
    process.env.WHATSAPP_ADMIN_TOKEN = 'test-secret';
    assert.equal((await fetch(url + '/resetar', { method: 'POST' })).status, 401);
    assert.equal((await fetch(url + '/iniciar')).status, 404);
    assert.equal((await fetch(url + '/qr')).status, 200);
    assert.equal((await fetch(url + '/status')).status, 200);
    assert.equal(starts + resets, 0);
    for (const action of ['iniciar', 'resetar']) {
      assert.equal((await fetch(url + '/' + action, { method: 'POST', headers: { Authorization: 'Bearer test-secret' } })).status, 200);
    }
    assert.equal(starts, 1); assert.equal(resets, 1);
  } finally {
    if (previous === undefined) delete process.env.WHATSAPP_ADMIN_TOKEN;
    else process.env.WHATSAPP_ADMIN_TOKEN = previous;
    await new Promise(resolve => server.close(resolve));
  }
});
