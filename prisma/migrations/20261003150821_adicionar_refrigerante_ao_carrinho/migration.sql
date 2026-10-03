-- CreateTable
CREATE TABLE "CarrinhoRefrigerante" (
    "id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "precoUnitario" DECIMAL(10,2) NOT NULL,
    "carrinhoId" TEXT NOT NULL,
    "refrigeranteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarrinhoRefrigerante_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CarrinhoRefrigerante_carrinhoId_refrigeranteId_key" ON "CarrinhoRefrigerante"("carrinhoId", "refrigeranteId");

-- AddForeignKey
ALTER TABLE "CarrinhoRefrigerante" ADD CONSTRAINT "CarrinhoRefrigerante_carrinhoId_fkey" FOREIGN KEY ("carrinhoId") REFERENCES "Carrinho"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrinhoRefrigerante" ADD CONSTRAINT "CarrinhoRefrigerante_refrigeranteId_fkey" FOREIGN KEY ("refrigeranteId") REFERENCES "Refrigerante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
