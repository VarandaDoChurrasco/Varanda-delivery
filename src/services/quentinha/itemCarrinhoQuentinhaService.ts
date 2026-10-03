import { prisma } from "../../lib/prisma.js";

interface CriarEscolhaData {
  carrinhoItemId: string;
  tipo: "PROTEINA" | "ACOMPANHAMENTO" | "SALADA";
  nome: string;
  opcaoId?: string;
}

export class CarrinhoItemEscolhaService {
  async criar(data: CriarEscolhaData) {
    const { carrinhoItemId, tipo, nome, opcaoId } = data;

    const carrinhoItem = await prisma.carrinhoItem.findUnique({
      where: {
        id: carrinhoItemId,
      },
      include: {
        carrinho: true,
      },
    });

    if (carrinhoItem?.carrinho.status !== "ABERTO") {
      throw new Error(
        "Não é possível adicionar escolhas a um carrinho finalizado.",
      );
    }

    if (!carrinhoItem) {
      throw new Error("Item do carrinho não encontrado.");
    }

    const tamanhoQuentinha = await prisma.tamanhoQuentinha.findUnique({
      where: {
        id: carrinhoItem.tamanhoId ?? undefined,
      },
    });

    if (!tamanhoQuentinha) {
      throw new Error("Tamanho da quentinha não encontrado.");
    }
    // VALIDAR QUANTIDADE DE PROTEÍNAS
    // ==========================================

    const escolhaExistente = await prisma.carrinhoItemEscolha.findFirst({
      where: {
        carrinhoItemId,
        tipo,
        opcaoId,
      },
    });

    if (escolhaExistente) {
      throw new Error(`A opção "${nome}" já foi adicionada a esta quentinha.`);
    }

    if (tipo === "PROTEINA") {
      const quantidadeProteinas = await prisma.carrinhoItemEscolha.count({
        where: {
          carrinhoItemId,
          tipo: "PROTEINA",
        },
      });

      if (quantidadeProteinas >= tamanhoQuentinha.maxProteinas) {
        throw new Error(
          `A quentinha ${tamanhoQuentinha.nome} permite no máximo ${tamanhoQuentinha.maxProteinas} proteína(s).`,
        );
      }
    }

    // ==========================================
    // CRIAR ESCOLHA
    // ==========================================

    return await prisma.carrinhoItemEscolha.create({
      data: {
        carrinhoItemId,
        tipo,
        nome,
        opcaoId,
      },
    });
  }

  async listarPorCarrinhoItem(carrinhoItemId: string) {
    return await prisma.carrinhoItemEscolha.findMany({
      where: {
        carrinhoItemId,
      },
      orderBy: {
        tipo: "asc",
      },
    });
  }

  async buscarPorId(id: string) {
    return await prisma.carrinhoItemEscolha.findUnique({
      where: {
        id,
      },
    });
  }

  async excluir(id: string) {
    const escolha = await prisma.carrinhoItemEscolha.findUnique({
      where: {
        id,
      },
      include: {
        carrinhoItem: {
          include: {
            carrinho: true,
          },
        },
      },
    });

    if (!escolha) {
      throw new Error("Escolha não encontrada.");
    }

    if (escolha.carrinhoItem.carrinho.status !== "ABERTO") {
      throw new Error(
        "Não é possível excluir uma escolha de um carrinho finalizado.",
      );
    }

    return await prisma.carrinhoItemEscolha.delete({
      where: {
        id,
      },
    });
  }
}
