-- CreateEnum
CREATE TYPE "TipoOpcaoQuentinha" AS ENUM ('ACOMPANHAMENTO', 'PROTEINA', 'SALADA');

-- AlterTable
ALTER TABLE "CarrinhoItem" ADD COLUMN     "tamanhoId" TEXT;

-- CreateTable
CREATE TABLE "OpcaoQuentinha" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoOpcaoQuentinha" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpcaoQuentinha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarrinhoItemEscolha" (
    "id" TEXT NOT NULL,
    "tipo" "TipoOpcaoQuentinha" NOT NULL,
    "nome" TEXT NOT NULL,
    "opcaoId" TEXT,
    "carrinhoItemId" TEXT NOT NULL,

    CONSTRAINT "CarrinhoItemEscolha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoItemEscolha" (
    "id" TEXT NOT NULL,
    "tipo" "TipoOpcaoQuentinha" NOT NULL,
    "nome" TEXT NOT NULL,
    "pedidoItemId" TEXT NOT NULL,

    CONSTRAINT "PedidoItemEscolha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardapioOpcaoQuentinha" (
    "id" TEXT NOT NULL,
    "cardapioId" TEXT NOT NULL,
    "opcaoId" TEXT NOT NULL,
    "tipo" "TipoOpcaoQuentinha" NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CardapioOpcaoQuentinha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TamanhoQuentinha" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "maxProteinas" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TamanhoQuentinha_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OpcaoQuentinha_nome_key" ON "OpcaoQuentinha"("nome");

-- CreateIndex
CREATE INDEX "CarrinhoItemEscolha_carrinhoItemId_idx" ON "CarrinhoItemEscolha"("carrinhoItemId");

-- CreateIndex
CREATE INDEX "PedidoItemEscolha_pedidoItemId_idx" ON "PedidoItemEscolha"("pedidoItemId");

-- CreateIndex
CREATE UNIQUE INDEX "CardapioOpcaoQuentinha_cardapioId_opcaoId_key" ON "CardapioOpcaoQuentinha"("cardapioId", "opcaoId");

-- CreateIndex
CREATE UNIQUE INDEX "TamanhoQuentinha_nome_key" ON "TamanhoQuentinha"("nome");

-- AddForeignKey
ALTER TABLE "CarrinhoItemEscolha" ADD CONSTRAINT "CarrinhoItemEscolha_carrinhoItemId_fkey" FOREIGN KEY ("carrinhoItemId") REFERENCES "CarrinhoItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoItemEscolha" ADD CONSTRAINT "PedidoItemEscolha_pedidoItemId_fkey" FOREIGN KEY ("pedidoItemId") REFERENCES "PedidoItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardapioOpcaoQuentinha" ADD CONSTRAINT "CardapioOpcaoQuentinha_cardapioId_fkey" FOREIGN KEY ("cardapioId") REFERENCES "Cardapio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardapioOpcaoQuentinha" ADD CONSTRAINT "CardapioOpcaoQuentinha_opcaoId_fkey" FOREIGN KEY ("opcaoId") REFERENCES "OpcaoQuentinha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
