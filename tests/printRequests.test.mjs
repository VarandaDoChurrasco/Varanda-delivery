import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import express from 'express';
import { httpRequest } from './helpers/httpRequest.mjs';
import { PGlite } from '@electric-sql/pglite';

process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
const { prisma } = await import('../dist/lib/prisma.js');
const { printRequestsRouter } = await import('../dist/routes/printRequests.js');
const { PrintRequestService } = await import('../dist/services/printService/printRequestService.js');
const { confirmOrderService } = await import('../dist/services/orderService/confirmOrderService.js');
const { confirmOrderController } = await import('../dist/controllers/order/confirmOrderController.js');
const { orderStatusScheduler } = await import('../dist/services/orderService/orderStatusScheduler.js');
const { configurarSocket } = await import('../dist/lib/socket.js');

// Real local PostgreSQL engine: execute the shipped migration and the conditional
// updates used by the service. No socket, Neon URL or production data is involved.
const db = new PGlite();
await db.exec('CREATE TABLE "Pedido" ("id" TEXT PRIMARY KEY, "status" TEXT, "confirmadoEm" TIMESTAMP(3), "updatedAt" TIMESTAMP(3) NOT NULL)');
await db.exec(await readFile(new URL('../prisma/migrations/20261026120000_print_requests/migration.sql', import.meta.url), 'utf8'));
const find = async id => (await db.query('SELECT * FROM "PrintRequest" WHERE "pedidoId" = $1', [id])).rows[0] ?? null;
const insert = async (sqlDb, data) => {
  await sqlDb.query('INSERT INTO "PrintRequest" ("pedidoId", "payload", "updatedAt") VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP) ON CONFLICT ("pedidoId") DO NOTHING', [data.pedidoId, JSON.stringify(data.payload)]);
};
prisma.printRequest.findUnique = ({ where }) => find(where.pedidoId);
prisma.printRequest.findMany = async ({ where }) => (await db.query('SELECT * FROM "PrintRequest" WHERE "status"::text = ANY($1::text[]) ORDER BY "createdAt"', [where.status.in])).rows;
prisma.printRequest.upsert = async ({ create }) => { await insert(db, create); return find(create.pedidoId); };
prisma.printRequest.updateMany = async ({ where, data }) => {
  const result = await db.query(`UPDATE "PrintRequest" SET "status" = $1::"PrintRequestStatus",
    "attempt" = "attempt" + $2, "attemptedAt" = COALESCE($3, "attemptedAt"),
    "completedAt" = $4, "confirmedByOperator" = $5, "updatedAt" = CURRENT_TIMESTAMP
    WHERE "pedidoId" = $6 AND "attempt" = $7 AND "status"::text = ANY($8::text[]) RETURNING "pedidoId"`,
    [data.status, data.attempt?.increment ?? 0, data.attemptedAt ?? null, data.completedAt ?? null,
      data.confirmedByOperator, where.pedidoId, where.attempt, where.status.in]);
  return { count: result.rows.length };
};
const service = new PrintRequestService();
const pedido = id => ({ id, numero: 30, tipo: 'RETIRADA', status: 'AGUARDANDO_CONFIRMACAO', updatedAt: new Date(0), itens: [] });
let current, failRequest = false;
const events = [];
prisma.pedido.findUnique = async ({ where }) => current?.id === where.id ? current : null;
prisma.$transaction = async callback => db.transaction(async sqlDb => {
  const tx = {
    pedido: { update: async args => {
      assert.equal(args.where.status, 'AGUARDANDO_CONFIRMACAO');
      const result = await sqlDb.query('UPDATE "Pedido" SET "status" = $1, "confirmadoEm" = $2 WHERE "id" = $3 AND "status" = $4 RETURNING "id"',
        [args.data.status, args.data.confirmadoEm, args.where.id, args.where.status]);
      if (!result.rows.length) throw Error('concurrent confirmation');
      events.push('order');
      return { ...current, ...args.data };
    } },
    printRequest: { upsert: async ({ create }) => {
      if (failRequest) throw Error('request insert failed');
      events.push('request'); await insert(sqlDb, create);
    } },
  };
  const result = await callback(tx);
  events.push('commit');
  return result;
});
orderStatusScheduler.synchronize = () => events.push('schedule');
configurarSocket({ sockets: { sockets: new Map() }, emit: (name, value) => events.push(`${name}:${value.id}`) });
async function seed(id) {
  current = pedido(id);
  await db.query('INSERT INTO "Pedido" ("id", "status", "updatedAt") VALUES ($1, $2, $3)', [id, current.status, current.updatedAt]);
}

test('migration does not backfill historical orders', async () => {
  await seed('historical');
  assert.deepEqual(await service.pending(), []);
  assert.equal(await find('historical'), null);
});

test('confirmation commits request and order before emitting; request failure rolls both back', async () => {
  await seed('helia'); events.length = 0;
  await new confirmOrderService().execute('helia');
  assert.deepEqual(events, ['order', 'request', 'commit', 'novo_pedido:helia', 'schedule']);
  assert.equal((await find('helia')).status, 'PENDING');
  assert.ok((await find('helia')).payload.confirmadoEm);
  await seed('rollback'); failRequest = true; events.length = 0;
  await assert.rejects(new confirmOrderService().execute('rollback'), /request insert failed/);
  failRequest = false;
  assert.equal((await db.query('SELECT "status" FROM "Pedido" WHERE "id" = $1', ['rollback'])).rows[0].status, 'AGUARDANDO_CONFIRMACAO');
  assert.equal(await find('rollback'), null);
  assert.deepEqual(events, ['order']);
});

test('HTTP confirmation uses the same persistent flow without Termux or a second event', async () => {
  await seed('http'); events.length = 0;
  const result = {};
  const response = { status: code => { result.code = code; return response; }, json: body => { result.body = body; } };
  await new confirmOrderController().handle({ params: { id: 'http' } }, response);
  assert.equal(result.code, 200);
  assert.equal((await find('http')).status, 'PENDING');
  assert.equal(events.filter(event => event.startsWith('novo_pedido:')).length, 1);
});

test('atomic start has one winner and no automatic replay of attempted work', async () => {
  const results = await Promise.allSettled([service.action('helia', 'start', 0), service.action('helia', 'start', 0)]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(results.filter(result => result.status === 'rejected' && result.reason.statusCode === 409).length, 1);
  assert.equal((await find('helia')).status, 'ATTEMPTED');
  await assert.rejects(service.action('helia', 'start', 1), error => error.statusCode === 409);
  assert.equal((await service.pending()).find(row => row.pedidoId === 'helia').status, 'ATTEMPTED');
});

test('completed requests survive restart, stay out of recovery and accept repeated completion', async () => {
  await service.action('helia', 'sent', 1);
  await new PrintRequestService().action('helia', 'sent', 1);
  assert.equal((await find('helia')).status, 'SENT');
  assert.equal((await service.pending()).some(row => row.pedidoId === 'helia'), false);
  await assert.rejects(service.action('helia', 'start', 1), error => error.statusCode === 409);
});

test('manual reprint advances version and rejects delayed completion and repeated retry', async () => {
  const retried = await service.action('helia', 'retry', 1);
  assert.equal(retried.status, 'PENDING'); assert.equal(retried.attempt, 2);
  await assert.rejects(service.action('helia', 'sent', 1), error => error.statusCode === 409);
  await assert.rejects(service.action('helia', 'retry', 1), error => error.statusCode === 409);
  const started = await service.action('helia', 'start', 2);
  assert.equal(started.attempt, 3);
  await service.action('helia', 'printed', 3);
  assert.equal((await find('helia')).confirmedByOperator, true);
});

test('historical request requires explicit manual action; input is validated', async () => {
  current = pedido('historical');
  await assert.rejects(service.action('historical', 'inspect'), error => error.statusCode === 404);
  const manual = await service.action('historical', 'manual');
  assert.equal(manual.status, 'PENDING');
  assert.equal((await service.action('historical', 'inspect')).attempt, 0);
  await assert.rejects(service.action('missing', 'start', 0), error => error.statusCode === 404);
  await assert.rejects(service.action('historical', 'start', -1), error => error.statusCode === 400);
  await assert.rejects(service.action('historical', 'anything', 0), error => error.statusCode === 400);
});

test('HTTP endpoints expose only unresolved requests and reject duplicate start', async () => {
  const app = express(); app.use(express.json()); app.use('/print-requests', printRequestsRouter);
  const pending = await httpRequest(app, '/print-requests');
  assert.equal(pending.status, 200);
  assert.equal(pending.json().some(row => row.pedidoId === 'helia'), false);
  const started = await httpRequest(app, '/print-requests/http', { method: 'POST', body: { action: 'start', attempt: 0 } });
  assert.equal(started.status, 200);
  assert.equal(started.json().status, 'ATTEMPTED');
  const duplicate = await httpRequest(app, '/print-requests/http', { method: 'POST', body: { action: 'start', attempt: 0 } });
  assert.equal(duplicate.status, 409);
  const invalid = await httpRequest(app, '/print-requests/http', { method: 'POST', body: { action: 'start' } });
  assert.equal(invalid.status, 400);
});

test.after(async () => { await db.close(); await prisma.$disconnect(); });
