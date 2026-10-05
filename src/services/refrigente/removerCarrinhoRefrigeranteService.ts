import { prisma } from "../../lib/prisma.js";

interface RemoverCarrinhoRefrigeranteData {
  carrinhoId: string;
  refrigeranteId: string;
}

class RemoverCarrinhoRefrigeranteService {
  async execute(dados: RemoverCarrinhoRefrigeranteData) {
    if (!dados?.carrinhoId || !dados?.refrigeranteId) {
      throw new Error("Informe o carrinhoId e o refrigeranteId.");
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

    const item = await prisma.carrinhoRefrigerante.findUnique({
      where: {
        carrinhoId_refrigeranteId: {
          carrinhoId: dados.carrinhoId,
          refrigeranteId: dados.refrigeranteId,
        },
      },
      include: {
        refrigerante: true,
      },
    });

    if (!item) {
      throw new Error("Este refrigerante não está no carrinho.");
    }

    await prisma.carrinhoRefrigerante.delete({
      where: {
        id: item.id,
      },
    });

    return {
      sucesso: true,
      carrinhoId: dados.carrinhoId,
      refrigeranteId: dados.refrigeranteId,
      nome: item.refrigerante.nome,
    };
  }
}

export { RemoverCarrinhoRefrigeranteService };
