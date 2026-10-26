-- Catalog only: never reads restaurant/customer rows and never writes objects.
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;
SET LOCAL search_path = public;
SET LOCAL statement_timeout = '20s';
SET LOCAL lock_timeout = '3s';
SELECT jsonb_build_object(
  'metadata', jsonb_build_object(
    'database', current_database(), 'schema', current_schema(),
    'readOnly', current_setting('transaction_read_only'),
    'serverVersion', current_setting('server_version'),
    'migrationTable', to_regclass('public._prisma_migrations')::text
  ),
  'catalog', jsonb_build_object(
    'tables', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('name', c.relname, 'kind', c.relkind) ORDER BY c.relname)
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p') AND c.relname <> '_prisma_migrations'
    ), '[]'::jsonb),
    'columns', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'table', c.relname, 'name', a.attname, 'type', format_type(a.atttypid, a.atttypmod),
        'notNull', a.attnotnull, 'default', pg_get_expr(d.adbin, d.adrelid),
        'identity', a.attidentity, 'generated', a.attgenerated,
        'collation', CASE WHEN a.attcollation <> t.typcollation THEN co.collname ELSE NULL END
      ) ORDER BY c.relname, a.attname)
      FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_type t ON t.oid = a.atttypid
      LEFT JOIN pg_attrdef d ON d.adrelid = c.oid AND d.adnum = a.attnum
      LEFT JOIN pg_collation co ON co.oid = a.attcollation
      WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p') AND c.relname <> '_prisma_migrations'
        AND a.attnum > 0 AND NOT a.attisdropped
    ), '[]'::jsonb),
    'enums', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('name', name, 'values', vals) ORDER BY name)
      FROM (
        SELECT t.typname AS name, jsonb_agg(e.enumlabel ORDER BY e.enumsortorder) AS vals
        FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
        JOIN pg_enum e ON e.enumtypid = t.oid
        WHERE n.nspname = 'public' GROUP BY t.typname
      ) e
    ), '[]'::jsonb),
    'indexes', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'table', c.relname, 'name', i.relname, 'definition', pg_get_indexdef(i.oid),
        'valid', x.indisvalid, 'ready', x.indisready
      ) ORDER BY c.relname, i.relname)
      FROM pg_index x JOIN pg_class c ON c.oid = x.indrelid
      JOIN pg_class i ON i.oid = x.indexrelid JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname <> '_prisma_migrations'
    ), '[]'::jsonb),
    'constraints', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'table', c.relname, 'name', k.conname, 'type', k.contype,
        'definition', pg_get_constraintdef(k.oid, true), 'validated', k.convalidated,
        'deferrable', k.condeferrable, 'deferred', k.condeferred
      ) ORDER BY c.relname, k.conname)
      FROM pg_constraint k JOIN pg_class c ON c.oid = k.conrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname <> '_prisma_migrations'
        -- PG18 may expose NOT NULL as constraints; the column audit covers it.
        AND k.contype <> 'n'
    ), '[]'::jsonb),
    'sequences', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'name', c.relname, 'type', format_type(s.seqtypid, NULL),
        'start', s.seqstart::text, 'increment', s.seqincrement::text,
        'min', s.seqmin::text, 'max', s.seqmax::text, 'cache', s.seqcache::text, 'cycle', s.seqcycle,
        'ownedByTable', owner.relname, 'ownedByColumn', a.attname
      ) ORDER BY c.relname)
      FROM pg_sequence s JOIN pg_class c ON c.oid = s.seqrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      LEFT JOIN pg_depend d ON d.classid = 'pg_class'::regclass AND d.objid = c.oid
        AND d.refclassid = 'pg_class'::regclass AND d.deptype IN ('a', 'i')
      LEFT JOIN pg_class owner ON owner.oid = d.refobjid
      LEFT JOIN pg_attribute a ON a.attrelid = d.refobjid AND a.attnum = d.refobjsubid
      WHERE n.nspname = 'public'
    ), '[]'::jsonb),
    'views', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('name', c.relname, 'kind', c.relkind,
        'definition', pg_get_viewdef(c.oid, true)) ORDER BY c.relname)
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind IN ('v', 'm')
    ), '[]'::jsonb),
    'triggers', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('table', c.relname, 'name', t.tgname,
        'definition', pg_get_triggerdef(t.oid, true), 'enabled', t.tgenabled) ORDER BY c.relname, t.tgname)
      FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND NOT t.tgisinternal AND c.relname <> '_prisma_migrations'
    ), '[]'::jsonb)
  )
) AS snapshot;
ROLLBACK;
