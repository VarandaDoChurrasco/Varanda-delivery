import { prisma } from "../../lib/prisma.js";
import { RemoveCartRequest } from "../../type/type.js";

class cartRemocaoService {
  async execulte(dados: RemoveCartRequest) {
    if (
      !dados ||
      !dados.carrinhoItemId ||
      !dados.ingrediente ||
      dados.ingrediente.trim() === ""
    ) {
      throw new Error(
        "Envie os dados obrigatórios: carrinhoItemId e ingrediente a ser removido.",
      );
    }

    const { carrinhoItemId, ingrediente } = dados;

    // 1. Busca o item do carrinho
    const carrinhoItem = await prisma.carrinhoItem.findUnique({
      where: {
        id: carrinhoItemId,
      },
      include: {
        carrinho: true,
        produto: true,
      },
    });

    if (!carrinhoItem) {
      throw new Error("Item do carrinho não encontrado.");
    }

    // 2. Verifica se o carrinho ainda está aberto
    if (carrinhoItem.carrinho.status !== "ABERTO") {
      throw new Error("Este carrinho não está aberto.");
    }

    const ingredienteFormatado = ingrediente.trim();

    // 3. Verifica se essa remoção já foi adicionada para este item
    const remocaoExistente = await prisma.carrinhoItemRemocao.findFirst({
      where: {
        carrinhoItemId: carrinhoItemId,
        ingrediente: {
          equals: ingredienteFormatado,
          mode: "insensitive",
        },
      },
    });

    if (remocaoExistente) {
      throw new Error(
        "Este ingrediente já foi marcado para remoção neste item.",
      );
    }

    // 4. Cria a remoção do ingrediente no item do carrinho
    const remocao = await prisma.carrinhoItemRemocao.create({
      data: {
        carrinhoItemId: carrinhoItemId,
        ingrediente: ingredienteFormatado,
      },
      include: {
        carrinhoItem: {
          include: {
            produto: true,
          },
        },
      },
    });

    return remocao;
  }
}

export { cartRemocaoService };
