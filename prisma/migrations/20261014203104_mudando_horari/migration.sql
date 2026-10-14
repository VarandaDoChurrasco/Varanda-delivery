/*
  Warnings:

  - You are about to drop the column `categoriaId` on the `Produto` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[data,periodo]` on the table `Cardapio` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `produtos` to the `CardapioPendente` table without a default value. This is not possible if the table is not empty.
  - Made the column `produtoId` on table `CarrinhoItem` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "PeriodoCardapio" AS ENUM ('ALMOCO', 'NOITE');

-- CreateEnum
CREATE TYPE "TipoProduto" AS ENUM ('QUENTINHA', 'SIMPLES');

-- DropForeignKey
ALTER TABLE "CarrinhoItem" DROP CONSTRAINT "CarrinhoItem_carrinhoId_fkey";

-- DropForeignKey
ALTER TABLE "CarrinhoItem" DROP CONSTRAINT "CarrinhoItem_produtoId_fkey";

-- DropForeignKey
ALTER TABLE "PedidoItem" DROP CONSTRAINT "PedidoItem_pedidoId_fkey";

-- DropForeignKey
ALTER TABLE "Produto" DROP CONSTRAINT "Produto_categoriaId_fkey";

-- DropIndex
DROP INDEX "Cardapio_data_key";

-- AlterTable
ALTER TABLE "Cardapio" ADD COLUMN     "periodo" "PeriodoCardapio" NOT NULL DEFAULT 'ALMOCO';

-- AlterTable
ALTER TABLE "CardapioPendente" ADD COLUMN     "produtos" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "CarrinhoItem" ALTER COLUMN "produtoId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Produto" DROP COLUMN "categoriaId",
ADD COLUMN     "tipo" "TipoProduto" NOT NULL DEFAULT 'SIMPLES';

-- CreateIndex
CREATE UNIQUE INDEX "Cardapio_data_periodo_key" ON "Cardapio"("data", "periodo");

-- CreateIndex
CREATE INDEX "CarrinhoItem_carrinhoId_idx" ON "CarrinhoItem"("carrinhoId");

-- CreateIndex
CREATE INDEX "CarrinhoItem_produtoId_idx" ON "CarrinhoItem"("produtoId");

-- CreateIndex
CREATE INDEX "PedidoItem_pedidoId_idx" ON "PedidoItem"("pedidoId");

-- CreateIndex
CREATE INDEX "PedidoItem_produtoId_idx" ON "PedidoItem"("produtoId");

-- AddForeignKey
ALTER TABLE "CarrinhoItem" ADD CONSTRAINT "CarrinhoItem_carrinhoId_fkey" FOREIGN KEY ("carrinhoId") REFERENCES "Carrinho"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrinhoItem" ADD CONSTRAINT "CarrinhoItem_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;
