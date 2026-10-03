-- DropForeignKey
ALTER TABLE "CarrinhoItem" DROP CONSTRAINT "CarrinhoItem_produtoId_fkey";

-- AlterTable
ALTER TABLE "CarrinhoItem" ALTER COLUMN "produtoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CarrinhoItem" ADD CONSTRAINT "CarrinhoItem_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
