-- No INSERT/backfill: historical orders must not print on deployment.
CREATE TYPE "PrintRequestStatus" AS ENUM ('PENDING', 'ATTEMPTED', 'SENT');
CREATE TABLE "PrintRequest" (
  "pedidoId" TEXT NOT NULL PRIMARY KEY,
  "payload" JSONB NOT NULL,
  "status" "PrintRequestStatus" NOT NULL DEFAULT 'PENDING',
  "attempt" INTEGER NOT NULL DEFAULT 0,
  "attemptedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "confirmedByOperator" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PrintRequest_pedidoId_fkey" FOREIGN KEY ("pedidoId")
    REFERENCES "Pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "PrintRequest_status_createdAt_idx" ON "PrintRequest"("status", "createdAt");
