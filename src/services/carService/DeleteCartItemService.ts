import { prisma } from "../../lib/prisma.js";

class DeleteCartItemService {
  async execute(id: string) {
    if (!id || typeof id !== "string") {
      throw new Error("ID do item do carrinho inválido.");
    }

    return await prisma.$transaction(async (tx) => {
      // Verifica se o item existe
      const item = await tx.carrinhoItem.findUnique({
        where: {
          id,
        },
      });

      if (!item) {
        throw new Error("Item do carrinho não encontrado.");
      }

      // Remove as remoções de ingredientes vinculadas ao item
      await tx.carrinhoItemRemocao.deleteMany({
        where: {
          carrinhoItemId: id,
        },
      });

      // Remove o produto do carrinho
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
