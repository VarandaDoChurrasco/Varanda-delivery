# Atualização da recuperação de impressão

## Modelo mínimo

Uma tabela `PrintRequest`, com uma linha por pedido, e dois endpoints:

- `GET /print-requests`: solicitações PENDING e ATTEMPTED, sem filtro de data.
- `POST /print-requests/:pedidoId`: ações `inspect`, `manual`, `start`, `sent`,
  `printed` e `retry`. As quatro últimas exigem o número `attempt` conhecido.

A confirmação da Hélia e a confirmação HTTP usam a mesma transação: atualizam o
pedido e inserem sua solicitação. Depois do commit, emitem `novo_pedido`.
Nenhuma mudança no atendimento, nos cardápios ou na formatação do comprovante.

PENDING pode ser recuperado automaticamente. Antes de chamar a escrita Bluetooth,
o celular muda atomicamente a linha para ATTEMPTED e incrementa `attempt`.
Somente uma resposta de sucesso dessa transição autoriza uma escrita.
Se a chamada falhar ou sua resposta se perder, o celular não escreve.
ATTEMPTED após reinício significa resultado incerto, e exige decisão do operador.
Não existe prazo que libere automaticamente uma tentativa.

SENT significa escrita Bluetooth retornando `true`, ou confirmação explícita do
operador (`confirmedByOperator = true`). Não é confirmação física da impressora.
Uma falha de rede após a escrita faz repetir somente o registro do resultado.
Se o processo morrer antes desse registro, a linha permanece ATTEMPTED: conferir
papel e escolher “Já imprimiu” ou “Autorizar nova tentativa”.

O PostgreSQL é o registro durável, inclusive após reiniciar/reinstalar o celular;
não há dependência de armazenamento local nem novas bibliotecas nativas. Por isso,
a impressão manual e automática precisam de internet para autorizar uma escrita.
Bluetooth continua serializado pela fila existente. O celular sincroniza ao
iniciar, conectar o socket, retornar ao primeiro plano e a cada 30 segundos em
primeiro plano. Isso não promete execução contínua com Android suspenso.

O botão manual consulta primeiro o registro. Pedidos concluídos exigem confirmação
para reimprimir; novas tentativas avançam a versão, rejeitando mensagens antigas.
Somente a ação manual cria solicitações para pedidos históricos. A ação `inspect`
é apenas consulta. A migração não faz INSERT/backfill e `/orderToday` não imprime.

## Ordem de implantação

1. Fechar/forçar parada do VarandaPrint antigo. Não abri-lo novamente contra o
   backend atualizado: ele não participa da proteção persistente.
2. Aplicar a migração aditiva, com DATABASE_URL do ambiente correto configurada:

   ```sh
   cd varanda-delivery/backend
   npm ci
   npx prisma migrate deploy --config prisma7.config.ts
   npm run build
   npm test
   ```

3. Publicar esses arquivos no backend Render usando o procedimento habitual.
   O comando de inicialização continua `npm start`. A nova confirmação requer a
   tabela: aplicar a migração antes de iniciar a versão nova.
4. Atualizar o Android antes de reabrir o aplicativo:

   ```sh
   cd VarandaPrint
   npm ci
   npm test -- --runInBand
   npx tsc --noEmit
   npm run android
   ```

   Para gerar APK de distribuição, com a configuração de assinatura habitual:

   ```sh
   cd VarandaPrint/android
   ./gradlew assembleRelease
   ```

   Saída: `app/build/outputs/apk/release/app-release.apk`. Instalar o APK novo antes
   de voltar a operar. A URL de impressão está em
   `VarandaPrint/src/services/print/printRecovery.ts`.

Nenhum desses comandos foi executado contra produção nesta implementação.
Pedidos #28/#29 e outros anteriores não são recuperados automaticamente.

## Validação com pedido novo

1. Com aplicativo atualizado, internet e Bluetooth ativos, confirmar um pedido
   novo pela Hélia: deve sair uma via e sua linha deve chegar a SENT.
2. Reiniciar o aplicativo: esse pedido não deve imprimir outra vez.
3. Desligar apenas a internet do celular, mantendo Bluetooth. Confirmar outro
   pedido novo por um segundo acesso ao WhatsApp. Reconectar a internet do celular:
   a solicitação PENDING deve ser recuperada e imprimir uma única via.
4. Reiniciar novamente: nenhuma repetição. Não usar o botão de reimpressão nesse
   teste, pois ele representa autorização explícita para uma nova via.
5. Se uma tentativa ficar incerta, conferir o papel antes de escolher qualquer
   ação. A simples reconexão não deve repeti-la.

Consulta de verificação, somente leitura:

```sql
SELECT "pedidoId", "status", "attempt", "attemptedAt", "completedAt",
       "confirmedByOperator"
FROM "PrintRequest"
WHERE "pedidoId" = 'UUID_DO_PEDIDO_NOVO';
```

Os testes automatizados usam transportes simulados e PGlite local, sem Neon.
O teste das rotas usa streams HTTP em memória, sem abrir portas TCP.

## Arquivos da implementação

Backend (`varanda-delivery/backend/`):

- `prisma/schema.prisma`
- `prisma/migrations/20261026120000_print_requests/migration.sql`
- `src/services/orderService/confirmOrderService.ts`
- `src/services/helia/tools/confirmarPedido.tool.ts`
- `src/controllers/order/confirmOrderController.ts`
- `src/services/printService/printRequestService.ts`
- `src/routes/routes.ts`
- `src/routes/printRequests.ts`
- `package.json` e `package-lock.json`
- `tests/orderStatusIntegration.test.mjs`
- `tests/printRequests.test.mjs`
- `tests/whatsappControls.test.mjs` (transporte de teste em memória)
- `tests/helpers/httpRequest.mjs`
- `docs/print-recovery.md`

Aplicativo (`VarandaPrint/`):

- `src/services/socket.ts`
- `src/services/print/queue.ts`
- `src/services/print/printQueue.ts`
- `src/services/print/printRecovery.ts`
- `src/pages/home/home.tsx`
- `__tests__/Home.printQueue.test.tsx`
- `__tests__/printRecovery.test.ts`
- `__tests__/App.test.tsx` (mocks de navegação para rodar a suíte completa)
