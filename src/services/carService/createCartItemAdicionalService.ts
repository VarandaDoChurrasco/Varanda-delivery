import { prisma } from "../../lib/prisma.js";
import { CarrinhoItemAdicionalCreateRequest } from "../../type/type.js";

class createCartItemAdditionalService {
  async execulte(dados: CarrinhoItemAdicionalCreateRequest) {
    if (
      !dados ||
      !dados.carrinhoItemId ||
      !dados.adicionalId ||
      dados.quantidade === undefined
    ) {
      throw new Error(
        "Envie os dados obrigatórios (carrinhoItemId, adicionalId, quantidade)",
      );
    }

    if (dados.quantidade <= 0) {
      throw new Error("A quantidade deve ser maior que zero.");
    }

    // 1. Busca o item do carrinho
    const carrinhoItem = await prisma.carrinhoItem.findUnique({
      where: {
        id: dados.carrinhoItemId,
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

    // 3. Busca o adicional
    const adicional = await prisma.adicional.findUnique({
      where: {
        id: dados.adicionalId,
      },
    });

    if (!adicional) {
      throw new Error("Adicional não encontrado.");
    }

    // 4. Verifica se o adicional está ativo
    if (!adicional.ativo) {
      throw new Error("Este adicional está inativo.");
    }

    // 5. Verifica se o adicional pertence ao produto
    const produtoAdicional = await prisma.produtoAdicional.findUnique({
      where: {
        produtoId_adicionalId: {
          produtoId: carrinhoItem.produtoId,
          adicionalId: dados.adicionalId,
        },
      },
    });

    if (!produtoAdicional) {
      throw new Error("Este adicional não está disponível para este produto.");
    }

    // 6. Verifica se já existe esse adicional no item
    const adicionalExistente = await prisma.carrinhoItemAdicional.findUnique({
      where: {
        carrinhoItemId_adicionalId: {
          carrinhoItemId: dados.carrinhoItemId,
          adicionalId: dados.adicionalId,
        },
      },
    });

    if (adicionalExistente) {
      throw new Error("Este adicional já foi adicionado a este item.");
    }

    // 7. Cria o adicional no carrinho
    const carrinhoItemAdicional = await prisma.carrinhoItemAdicional.create({
      data: {
        carrinhoItemId: dados.carrinhoItemId,
        adicionalId: dados.adicionalId,
        quantidade: dados.quantidade,
        precoUnitario: adicional.preco,
      },
      include: {
        adicional: true,
      },
    });

    return carrinhoItemAdicional;
  }
}

export { createCartItemAdditionalService };
