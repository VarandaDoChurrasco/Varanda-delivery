# P3005 no Neon: diagnóstico e comandos preparados

Nenhum resolve, deploy, db push ou reset foi executado em produção. Nenhuma
migração existente foi editada. Os scripts desta preparação só consultam produção.

## Diagnóstico comprovado localmente

As 16 migrações anteriores a `20261026120000_print_requests` foram executadas,
em ordem, em PostgreSQL local em memória (PGlite), sem usar o Neon:

| Objeto | Antes de PrintRequest | Depois de PrintRequest |
|---|---:|---:|
| Tabelas | 26 | 27 |
| Colunas | 167 | 176 |
| Enums | 8 | 9 |
| Índices, incluindo PK | 49 | 51 |
| Constraints | 51 | 53 |
| Sequences | 1 | 1 |

A nova migração só cria o enum `PrintRequestStatus`, a tabela `PrintRequest`, sua
PK, sua FK para `Pedido(id)` e o índice de status/data. Não tem UPDATE, DELETE,
DROP ou preenchimento de pedidos antigos.

Os catálogos completos ficam em `expected-before-print.json` e
`expected-after-print.json`, gerados pela auditoria. Colunas incluem tipo, default,
nulabilidade, identidade, geração e collation; enums incluem ordem dos valores;
índices incluem definição e validade; constraints incluem definição e diferimento.
Sequences incluem definição e vínculo de propriedade, sem ler/alterar seu contador.
Views e triggers de usuário também são listadas. Não é uma auditoria de grants,
políticas RLS, funções ou de integridade dos dados de negócio.

O schema Prisma atual, sem os objetos novos de impressão, foi comparado com o
resultado das 16 migrações. A diferença encontrada foi:

- Histórico: `TipoProduto = QUENTINHA, SIMPLES`.
- Schema atual: `TipoProduto = SIMPLES, QUENTINHA, JANTINHA`.

O histórico não registra a inclusão de JANTINHA. Isso NÃO prova quais valores
existem no Neon e NÃO justifica executar as migrações antigas sobre suas tabelas.
A ordem de enum é reportada porque pode afetar comparações/ORDER BY no PostgreSQL;
não será reordenada automaticamente.

A consulta ao Neon desta sessão falhou por DNS (EAI_AGAIN). Portanto, tabelas,
colunas, enums, índices e constraints reais ainda NÃO foram aprovados para baseline.
Ter 26 tabelas, por si só, não prova equivalência estrutural.

O P3005 relatado é compatível com banco preenchido sem `_prisma_migrations`.
Baseline registra o histórico existente sem executar seus SQLs antigos.

## 1. Auditoria somente de leitura no ambiente com acesso ao Neon

Confirmar no painel Neon a branch de produção e o banco `neondb`. Fazer um backup
ou branch de preservação antes das etapas que escrevem metadados. Usar a conexão
direta (hostname sem `-pooler`), sem alterar a URL usada pelo backend em execução.
Não colar a senha no terminal em um comando que ficará no histórico:

```bash
cd /home/binho/VarandasProjeto/varanda-delivery/backend
read -rsp 'URL direta do Neon de produção: ' NEON_DIRECT_URL
printf '\n'
export NEON_DIRECT_URL
export DATABASE_URL="$NEON_DIRECT_URL"
node scripts/audit-prisma-baseline.mjs --live --out /tmp/varanda-prisma-baseline
cat /tmp/varanda-prisma-baseline/comparison.json
cat /tmp/varanda-prisma-baseline/drift.json
```

O script reconstitui o histórico SOMENTE em banco local em memória. No Neon ele
executa uma transação REPEATABLE READ, READ ONLY, com SELECT nos catálogos e ROLLBACK.
Não lê linhas de pedidos/clientes, não gera SQL corretivo automático e não cria
`_prisma_migrations`. Não recebe o endereço de produção como shadow database.

Códigos de saída: 0 = comparação concluída sem diferenças (ou modo local);
1 = falha; 2 = divergências estruturais. Conferir também `status: compared`,
`target: before-print`, `metadata.database: neondb` e `metadata.readOnly: on`.
Uma falha renova comparison.json como `not-compared`, evitando reutilizar aprovação
anterior. Não executar a etapa de baseline se houver erro ou divergência.

Alternativa com psql, usando o mesmo SQL de leitura:

```bash
mkdir -p /tmp/varanda-prisma-baseline
psql "$NEON_DIRECT_URL" -XqAt -v ON_ERROR_STOP=1 \
  -f scripts/prisma-baseline-catalog.sql \
  > /tmp/varanda-prisma-baseline/live.json
node scripts/audit-prisma-baseline.mjs \
  --compare /tmp/varanda-prisma-baseline/live.json \
  --out /tmp/varanda-prisma-baseline
```

Ou executar `scripts/prisma-baseline-catalog.sql` no SQL Editor do Neon e salvar
apenas o JSON da coluna snapshot como live.json. O arquivo contém estrutura, não
credenciais nem linhas de clientes. Um snapshot exportado precisa ser recente.

## 2. Se houver divergências: não marcar as 16 ainda

`drift.json` indica para cada objeto o esperado pelo histórico e o real.

- Coluna/tabela ausente: preparar ALTER/CREATE específico e revisar dependências.
  Colunas NOT NULL sem default em tabelas preenchidas exigem uma estratégia de
  preenchimento revisada; não adicionar cegamente.
- UNIQUE ausente: verificar duplicados com SELECT antes de criar o índice.
- FK ausente: verificar órfãos antes de adicionar/validar a constraint.
- Objetos/colunas extras: preservar. Não executar DROP para eliminar diferenças.
- Tipos/defaults/nulabilidade divergentes: avaliar os dados antes de qualquer ALTER.
- Valores de enum extras: preservar, incluindo JANTINHA. Não recriar enum nem
  converter/remover valores para fazer o catálogo parecer antigo.
- Diferença apenas de ordem de enum ou sintaxe de catálogo entre versões: revisar
  explicitamente; não converter tipos automaticamente.

Correção aditiva proposta, fora de prisma/migrations e NÃO executada:
`scripts/proposals/tipoproduto-jantinha.sql`:

```sql
ALTER TYPE "public"."TipoProduto" ADD VALUE IF NOT EXISTS 'JANTINHA';
```

Usar essa proposta somente se a consulta confirmar o enum e a falta do valor,
e depois de preparar uma migração de reconciliação correspondente. Se JANTINHA já
existe, nenhuma alteração é necessária no valor: falta representar o acréscimo no
histórico local. Essa reconciliação precisa ser revisada antes de qualquer deploy,
para não introduzir uma segunda migração pendente sem intenção.

Se a estrutura real não puder ser representada pelo histórico antigo sem remover
informações, a alternativa é criar um baseline novo que represente a estrutura
real e arquivar o histórico antigo com revisão. Não gerar esse baseline a partir
do schema atual incluindo PrintRequest: isso marcaria como existente uma tabela
que ainda não existe. Nenhum arquivamento foi feito nesta preparação.

Sem o catálogo real não há base para decidir quais correções aplicar. Não executar
o SQL de um diff automaticamente. As etapas abaixo valem APENAS para catálogo que
corresponda às 16 migrações, sem drift. Caso contrário, revisar o baseline primeiro.

## 3. Baseline das 16 (escrita apenas no histórico, a executar pelo operador)

Manter a mesma conexão/branch da auditoria. Guardar manifest.json e não editar as
migrações. O bloco abaixo verifica o relatório e os checksums antes de chamar
resolve. NÃO foi executado nesta sessão.

```bash
(
  set -euo pipefail
  node --input-type=module <<'JS'
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const directory = '/tmp/varanda-prisma-baseline';
const report = JSON.parse(await readFile(`${directory}/comparison.json`, 'utf8'));
if (report.status !== 'compared' || report.target !== 'before-print' || report.differences !== 0 ||
    report.metadata.database !== 'neondb' || report.metadata.readOnly !== 'on' ||
    report.metadata.migrationTable !== null) {
  throw Error('Baseline não autorizado pelo diagnóstico: erro, drift ou histórico já existente.');
}
const manifest = JSON.parse(await readFile(`${directory}/manifest.json`, 'utf8'));
const names = (await readdir('prisma/migrations')).filter(name => /^\d/.test(name)).sort();
if (names.length !== 17 || JSON.stringify(names) !== JSON.stringify(manifest.map(item => item.name))) {
  throw Error('Lista de migrações mudou desde a auditoria');
}
for (const item of manifest) {
  const sql = await readFile(`prisma/migrations/${item.name}/migration.sql`);
  if (createHash('sha256').update(sql).digest('hex') !== item.sha256) throw Error(`Migração alterada: ${item.name}`);
}
const old = (await readFile(`${directory}/old-migrations.txt`, 'utf8')).trim().split('\n');
if (old.length !== 16 || JSON.stringify(old) !== JSON.stringify(names.slice(0, -1))) {
  throw Error('Lista de baseline inválida');
}
console.log('Catálogo sem drift; somente as 16 antigas serão registradas.');
JS
  while IFS= read -r migration; do
    npx prisma migrate resolve --applied "$migration" --config prisma7.config.ts
  done < /tmp/varanda-prisma-baseline/old-migrations.txt
)
```

Resolve cria/preenche `_prisma_migrations`, guardando os checksums. Não executa os
SQLs antigos nem recria as tabelas. Não marcar `20261026120000_print_requests` como
aplicada. Se houver erro durante o laço, parar e conferir o histórico parcialmente
registrado; não apagar `_prisma_migrations` e não repetir comandos indiscriminadamente.

Conferência posterior:

```bash
npx prisma migrate status --config prisma7.config.ts
```

O esperado são 16 registradas e APENAS `20261026120000_print_requests` pendente.
Status pode retornar código diferente de zero porque existe migração pendente;
isso não autoriza ignorar outros erros. Conferir antes de prosseguir.

Consulta somente de leitura no Neon, após o baseline:

```sql
SELECT migration_name, finished_at, rolled_back_at, checksum
FROM public._prisma_migrations
ORDER BY migration_name;
```

## 4. Aplicar somente PrintRequest (etapa separada, pelo operador)

Depois de conferir o passo anterior e de garantir que nenhum arquivo novo foi
acrescentado ao diretório de migrações:

```bash
npx prisma migrate deploy --config prisma7.config.ts
npx prisma migrate status --config prisma7.config.ts
node scripts/audit-prisma-baseline.mjs --live --after-print \
  --out /tmp/varanda-prisma-baseline-after
```

Deploy aplica TODAS as pendentes, não possui seletor para só uma migração. Por isso
a conferência de histórico/diretório é necessária para garantir que somente
PrintRequest será executada. Ela usa CREATE TYPE, CREATE TABLE e CREATE INDEX,
com FK para Pedido. Nenhum pedido antigo é inserido na fila.

Conferir PrintRequest vazia e 17 migrações concluídas. A aplicação antiga não usa a
tabela nova; a versão nova do backend de impressão requer que ela já exista antes
de iniciar. Somente publicar a versão nova após a migração bem-sucedida.

## Referências

- Prisma v7, baselining: https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/baselining
- Prisma v7, reconciliação/hotfixes: https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/patching-and-hotfixing
