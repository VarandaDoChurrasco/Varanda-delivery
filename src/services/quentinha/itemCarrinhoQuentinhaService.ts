import { prisma } from "../../lib/prisma.js";

interface CriarEscolhaData {
  carrinhoItemId: string;
  tipo: "PROTEINA" | "ACOMPANHAMENTO" | "SALADA";
  nome: string;
  opcaoId?: string;
}

export class CarrinhoItemEscolhaService {
  /*async criar(data: CriarEscolhaData) {
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
  }*/

  async criar(data: CriarEscolhaData) {
    const { carrinhoItemId, tipo, nome, opcaoId } = data;

    if (!opcaoId) {
      throw new Error("O ID da opção é obrigatório.");
    }

    const carrinhoItem = await prisma.carrinhoItem.findUnique({
      where: { id: carrinhoItemId },
      include: {
        carrinho: true,
        produto: true,
      },
    });

    if (!carrinhoItem) {
      throw new Error("Item do carrinho não encontrado.");
    }

    if (carrinhoItem.carrinho.status !== "ABERTO") {
      throw new Error(
        "Não é possível adicionar escolhas a um carrinho finalizado.",
      );
    }

    let maxProteinas: number;
    let nomeItem: string;

    // QUENTINHAS DO ALMOÇO
    if (carrinhoItem.tamanhoId) {
      const tamanho = await prisma.tamanhoQuentinha.findUnique({
        where: { id: carrinhoItem.tamanhoId },
      });

      if (!tamanho) {
        throw new Error("Tamanho da quentinha não encontrado.");
      }

      maxProteinas = tamanho.maxProteinas;
      nomeItem = `Quentinha ${tamanho.nome}`;
    }

    // JANTINHAS DO CARDÁPIO NOTURNO
    else if (
      carrinhoItem.produto?.nome === "Jantinha P" ||
      carrinhoItem.produto?.nome === "Jantinha M"
    ) {
      nomeItem = carrinhoItem.produto.nome;

      maxProteinas = nomeItem === "Jantinha P" ? 1 : 2;

      if (tipo === "SALADA") {
        throw new Error("O cardápio noturno não possui saladas para Jantinha.");
      }
    }

    // OUTROS PRODUTOS
    else {
      throw new Error(
        "Este produto não permite escolhas de proteínas ou acompanhamentos.",
      );
    }

    const partes = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());

    const obterParte = (tipo: string) =>
      Number(partes.find((parte) => parte.type === tipo)?.value);

    const dataHoje = new Date(
      Date.UTC(obterParte("year"), obterParte("month") - 1, obterParte("day")),
    );
    const periodo = carrinhoItem.tamanhoId ? "ALMOCO" : "NOITE";

    const itemCardapio = await prisma.cardapioItem.findFirst({
      where: {
        produtoId: carrinhoItem.produtoId,
        disponivel: true,
        cardapio: {
          data: dataHoje,
          periodo,
          ativo: true,
        },
      },
      select: {
        cardapioId: true,
      },
    });
    /*const periodo = carrinhoItem.tamanhoId ? "ALMOCO" : "NOITE";
    // VALIDAR OPÇÃO NO CARDÁPIO DO ITEM
    const itemCardapio = await prisma.cardapioItem.findFirst({
      where: {
        produtoId: carrinhoItem.produtoId,
        disponivel: true,
        cardapio: {
          ativo: true,
        },
      },
      select: {
        cardapioId: true,
      },
      orderBy: {
        cardapio: {
          data: "desc",
        },
      },
    });*/

    if (!itemCardapio) {
      throw new Error("Produto não encontrado em um cardápio disponível.");
    }

    const opcaoCardapio = await prisma.cardapioOpcaoQuentinha.findFirst({
      where: {
        cardapioId: itemCardapio.cardapioId,
        opcaoId,
        tipo,
        disponivel: true,
      },
      include: {
        opcao: true,
      },
    });

    if (!opcaoCardapio) {
      throw new Error("Esta opção não pertence ao cardápio do item.");
    }

    if (opcaoCardapio.opcao.nome !== nome) {
      throw new Error("O nome da opção não corresponde ao ID informado.");
    }

    // IMPEDIR ESCOLHAS DUPLICADAS
    const escolhaExistente = await prisma.carrinhoItemEscolha.findFirst({
      where: {
        carrinhoItemId,
        opcaoId,
      },
    });

    if (escolhaExistente) {
      throw new Error(`A opção "${nome}" já foi adicionada a ${nomeItem}.`);
    }

    // VALIDAR LIMITE DE PROTEÍNAS
    if (tipo === "PROTEINA") {
      const quantidadeProteinas = await prisma.carrinhoItemEscolha.count({
        where: {
          carrinhoItemId,
          tipo: "PROTEINA",
        },
      });

      if (quantidadeProteinas >= maxProteinas) {
        throw new Error(
          `${nomeItem} permite no máximo ${maxProteinas} proteína(s).`,
        );
      }
    }

    // SALVAR ESCOLHA
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
