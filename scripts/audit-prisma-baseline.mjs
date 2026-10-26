import 'dotenv/config';
import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const flag = name => args.includes(name);
const value = name => args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
const out = resolve(value('--out') ?? '/tmp/varanda-prisma-baseline');
const latest = '20261026120000_print_requests';
const migrationsRoot = resolve(root, 'prisma/migrations');
const names = (await readdir(migrationsRoot)).filter(name => /^\d/.test(name)).sort();
if (names.length !== 17 || names.at(-1) !== latest) throw Error('Histórico diferente dos 17 arquivos auditados. Revise antes de continuar.');
const old = names.slice(0, -1);
const sql = await readFile(resolve(root, 'scripts/prisma-baseline-catalog.sql'), 'utf8');
await mkdir(out, { recursive: true });
const save = (name, content) => writeFile(resolve(out, name), typeof content === 'string' ? content : JSON.stringify(content, null, 2) + '\n');
const digest = text => createHash('sha256').update(text).digest('hex');
const db = new PGlite();
let expected, afterPrint;
const manifest = [];
try {
  for (const name of names) {
    const migration = await readFile(resolve(migrationsRoot, name, 'migration.sql'), 'utf8');
    manifest.push({ name, sha256: digest(migration) });
    if (name === latest) {
      expected = (await db.exec(sql)).flatMap(result => result.rows).find(row => row?.snapshot)?.snapshot;
    }
    // All historical SQL runs ONLY inside this fresh local in-memory database.
    await db.exec(migration);
  }
  afterPrint = (await db.exec(sql)).flatMap(result => result.rows).find(row => row?.snapshot)?.snapshot;
} finally { await db.close(); }
await save('expected-before-print.json', expected);
await save('expected-after-print.json', afterPrint);
await save('manifest.json', manifest);
await save('old-migrations.txt', old.join('\n') + '\n');
await save('catalog-read-only.sql', sql);
await save('comparison.json', { status: 'not-compared' });

// A schema-only Prisma reference for the old state; original schema is untouched.
let schema = await readFile(resolve(root, 'prisma/schema.prisma'), 'utf8');
schema = schema.replace(/^\s*impressao\s+PrintRequest\?\s*$/m, '')
  .replace(/^enum PrintRequestStatus \{[\s\S]*?^\}/m, '')
  .replace(/^model PrintRequest \{[\s\S]*?^\}/m, '');
await save('before-print.prisma', schema);

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
  return value;
}
const key = row => `${row.table ?? ''}/${row.name}`;
function differences(left, right) {
  const result = [];
  for (const category of Object.keys(left)) {
    if (!Array.isArray(right?.[category])) throw Error(`Catálogo incompleto: ${category}`);
    const l = new Map(left[category].map(row => [key(row), row]));
    const r = new Map(right[category].map(row => [key(row), row]));
    for (const [name, wanted] of l) {
      if (!r.has(name)) result.push({ category, object: name, difference: 'missing-in-live', expected: wanted });
      else if (JSON.stringify(stable(wanted)) !== JSON.stringify(stable(r.get(name)))) {
        result.push({ category, object: name, difference: 'different', expected: wanted, actual: r.get(name) });
      }
    }
    for (const [name, actual] of r) if (!l.has(name)) result.push({ category, object: name, difference: 'extra-in-live', actual });
  }
  return result;
}

console.log(`Histórico local: ${old.length} antigas; ${expected.catalog.tables.length} tabelas antes, ${afterPrint.catalog.tables.length} depois de PrintRequest.`);
console.log(`Artefatos: ${out}`);
let live;
if (value('--compare')) {
  live = JSON.parse(await readFile(resolve(value('--compare')), 'utf8'));
} else if (flag('--live')) {
  const connectionString = process.env.NEON_DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) throw Error('Configure NEON_DIRECT_URL ou DATABASE_URL sem colocar a senha no comando.');
  const client = new pg.Client({ connectionString, connectionTimeoutMillis: 8000, statement_timeout: 20000 });
  try {
    await client.connect();
    const results = await client.query(sql);
    live = (Array.isArray(results) ? results : [results]).flatMap(result => result.rows).find(row => row?.snapshot)?.snapshot;
    if (!live) throw Error('Resposta de catálogo ausente');
    await save('live.json', live);
  } catch (error) {
    // Never print a URL, password, connection string or raw driver error.
    console.error(`Neon indisponível; código ${error.code ?? 'UNKNOWN'}. Nenhuma alteração executada.`);
    process.exitCode = 1;
  } finally { await client.end().catch(() => {}); }
}
if (live) {
  if (live.metadata?.schema !== 'public' || live.metadata?.readOnly !== 'on') throw Error('Snapshot inválido: public e transação READ ONLY exigidos.');
  const reference = flag('--after-print') ? afterPrint : expected;
  const drift = differences(reference.catalog, live.catalog);
  await save('drift.json', drift);
  await save('comparison.json', { status: 'compared', target: flag('--after-print') ? 'after-print' : 'before-print', metadata: live.metadata, differences: drift.length, counts: Object.fromEntries(Object.entries(live.catalog).map(([k, v]) => [k, v.length])) });
  console.log(`Diferenças estruturais: ${drift.length}. Consulte drift.json.`);
  if (live.metadata.database !== 'neondb') console.log('ATENÇÃO: o banco consultado não se chama neondb. Confirme o ambiente.');
  if (live.metadata.migrationTable) console.log('ATENÇÃO: já existe _prisma_migrations; conferir o histórico antes de resolve.');
  process.exitCode = drift.length ? 2 : process.exitCode;
}
