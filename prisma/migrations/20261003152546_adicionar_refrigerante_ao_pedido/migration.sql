-- CreateTable
CREATE TABLE "PedidoRefrigerante" (
    "id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "precoUnitario" DECIMAL(10,2) NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "refrigeranteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PedidoRefrigerante_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PedidoRefrigerante_pedidoId_refrigeranteId_key" ON "PedidoRefrigerante"("pedidoId", "refrigeranteId");

-- AddForeignKey
ALTER TABLE "PedidoRefrigerante" ADD CONSTRAINT "PedidoRefrigerante_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoRefrigerante" ADD CONSTRAINT "PedidoRefrigerante_refrigeranteId_fkey" FOREIGN KEY ("refrigeranteId") REFERENCES "Refrigerante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
