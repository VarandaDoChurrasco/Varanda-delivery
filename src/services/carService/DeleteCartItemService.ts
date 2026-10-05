import { prisma } from "../../lib/prisma.js";

class DeleteCartItemService {
  async execute(id: string) {
    if (!id || typeof id !== "string") {
      throw new Error("ID do item do carrinho inválido.");
    }

    return await prisma.$transaction(async (tx) => {
      const item = await tx.carrinhoItem.findUnique({
        where: {
          id,
        },
        include: {
          carrinho: true,
        },
      });

      if (!item) {
        throw new Error("Item do carrinho não encontrado.");
      }

      if (item.carrinho.status !== "ABERTO") {
        throw new Error("Este carrinho não está aberto.");
      }

      await tx.carrinhoItemEscolha.deleteMany({
        where: {
          carrinhoItemId: id,
        },
      });

      await tx.carrinhoItemRemocao.deleteMany({
        where: {
          carrinhoItemId: id,
        },
      });

      await tx.carrinhoItemAdicional.deleteMany({
        where: {
          carrinhoItemId: id,
        },
      });

      const deletedItem = await tx.carrinhoItem.delete({
        where: {
          id,
        },
      });

      return deletedItem;
    });
  }
}

export { DeleteCartItemService };
