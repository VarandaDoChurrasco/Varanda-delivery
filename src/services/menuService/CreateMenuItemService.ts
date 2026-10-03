import { prisma } from "../../lib/prisma.js";
import { CardapioItemCreateRequest } from "../../type/type.js";

class createMenuItemService {
  async execulte(dados: CardapioItemCreateRequest) {
    if (!dados || !dados.cardapioId || !dados.produtoId || !dados.preco) {
      throw new Error(
        "Envie todos os dados obrigatórios (cardapioId, produtoId, preco)",
      );
    }
    const cardapio = await prisma.cardapio.findUnique({
      where: {
        id: dados.cardapioId,
      },
    });

    if (!cardapio) {
      throw new Error("Cardápio não encontrado.");
    }

    const produto = await prisma.produto.findUnique({
      where: {
        id: dados.produtoId,
      },
    });

    if (!produto) {
      throw new Error("Produto não encontrado.");
    }

    if (!produto.ativo) {
      throw new Error("Este produto está inativo.");
    }

    const itemExistente = await prisma.cardapioItem.findUnique({
      where: {
        cardapioId_produtoId: {
          cardapioId: dados.cardapioId,
          produtoId: dados.produtoId,
        },
      },
    });

    if (itemExistente) {
      throw new Error("Este produto já está no cardápio.");
    }
    const cardapioItem = await prisma.cardapioItem.create({
      data: {
        cardapioId: dados.cardapioId,
        produtoId: dados.produtoId,
        preco: dados.preco,
        ordem: dados.ordem ?? 0,
      },
    });

    return cardapioItem;
  }
}
export { createMenuItemService };
