import { prisma } from "../../lib/prisma.js";

interface AdicionarRefrigeranteData {
  carrinhoId: string;
  refrigeranteId: string;
  quantidade: number;
}

class AdicionarRefrigeranteCarrinhoService {
  async execute(dados: AdicionarRefrigeranteData) {
    if (
      !dados ||
      !dados.carrinhoId ||
      !dados.refrigeranteId ||
      dados.quantidade === undefined
    ) {
      throw new Error(
        "Envie os dados obrigatórios (carrinhoId, refrigeranteId, quantidade)",
      );
    }

    if (!Number.isInteger(dados.quantidade) || dados.quantidade <= 0) {
      throw new Error(
        "A quantidade deve ser um número inteiro maior que zero.",
      );
    }

    const carrinho = await prisma.carrinho.findUnique({
      where: {
        id: dados.carrinhoId,
      },
    });

    if (!carrinho) {
      throw new Error("Carrinho não encontrado.");
    }

    if (carrinho.status !== "ABERTO") {
      throw new Error("Este carrinho não está aberto.");
    }

    const refrigerante = await prisma.refrigerante.findUnique({
      where: {
        id: dados.refrigeranteId,
      },
    });

    if (!refrigerante) {
      throw new Error("Refrigerante não encontrado.");
    }

    if (!refrigerante.ativo) {
      throw new Error("Este refrigerante não está disponível.");
    }

    const itemExistente = await prisma.carrinhoRefrigerante.findUnique({
      where: {
        carrinhoId_refrigeranteId: {
          carrinhoId: dados.carrinhoId,
          refrigeranteId: dados.refrigeranteId,
        },
      },
    });

    if (itemExistente) {
      return prisma.carrinhoRefrigerante.update({
        where: {
          id: itemExistente.id,
        },
        data: {
          quantidade: itemExistente.quantidade + dados.quantidade,
          precoUnitario: refrigerante.preco,
        },
        include: {
          refrigerante: true,
        },
      });
    }

    return prisma.carrinhoRefrigerante.create({
      data: {
        carrinhoId: dados.carrinhoId,
        refrigeranteId: dados.refrigeranteId,
        quantidade: dados.quantidade,
        precoUnitario: refrigerante.preco,
      },
      include: {
        refrigerante: true,
      },
    });
  }
}

export { AdicionarRefrigeranteCarrinhoService };
