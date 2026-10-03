import { prisma } from "../../lib/prisma.js";

class GetMenuService {
  async execute() {
    const agora = new Date();

    const inicioDoDia = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate(),
    );

    const fimDoDia = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate() + 1,
    );

    // Busca o cardápio de hoje
    const cardapio = await prisma.cardapio.findFirst({
      where: {
        data: {
          gte: inicioDoDia,
          lt: fimDoDia,
        },
        ativo: true,
      },
      include: {
        cardapioOpcaoQuentinhas: {
          where: {
            disponivel: true,
            opcao: {
              ativo: true,
              disponivel: true,
            },
          },
          include: {
            opcao: true,
          },
          orderBy: {
            ordem: "asc",
          },
        },
      },
    });

    if (!cardapio) {
      throw new Error("Não existe cardápio disponível para hoje.");
    }

    // Busca os tamanhos disponíveis
    const tamanhos = await prisma.tamanhoQuentinha.findMany({
      where: {
        ativo: true,
      },
      orderBy: {
        preco: "asc",
      },
    });

    const acompanhamentos = [];
    const proteinas = [];
    const saladas = [];

    for (const item of cardapio.cardapioOpcaoQuentinhas) {
      const opcao = {
        id: item.opcao.id,
        nome: item.opcao.nome,
      };

      if (item.tipo === "ACOMPANHAMENTO") {
        acompanhamentos.push(opcao);
      }

      if (item.tipo === "PROTEINA") {
        proteinas.push(opcao);
      }

      if (item.tipo === "SALADA") {
        saladas.push(opcao);
      }
    }

    return {
      id: cardapio.id,

      data: cardapio.data.toISOString().split("T")[0],

      tamanhos: tamanhos.map((tamanho) => ({
        id: tamanho.id,
        nome: tamanho.nome,
        preco: Number(tamanho.preco),
        maxProteinas: tamanho.maxProteinas,
      })),

      acompanhamentos,
      proteinas,
      saladas,
    };
  }
}

export { GetMenuService };
