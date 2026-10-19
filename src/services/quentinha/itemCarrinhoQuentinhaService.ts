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

    if (!opcaoId) {
      throw new Error("O ID da opção é obrigatório.");
    }

    // ==========================================
    // 1. BUSCAR ITEM DO CARRINHO
    // ==========================================

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

    if (carrinhoItem.carrinho.status !== "ABERTO") {
      throw new Error(
        "Não é possível adicionar escolhas a um carrinho finalizado.",
      );
    }

    let maxProteinas: number;
    let nomeItem: string;

    const ehQuentinha = Boolean(carrinhoItem.tamanhoId);

    // ==========================================
    // 2. IDENTIFICAR QUENTINHA OU JANTINHA
    // ==========================================

    if (carrinhoItem.tamanhoId) {
      // QUENTINHAS DO ALMOÇO

      const tamanho = await prisma.tamanhoQuentinha.findUnique({
        where: {
          id: carrinhoItem.tamanhoId,
        },
      });

      if (!tamanho) {
        throw new Error("Tamanho da quentinha não encontrado.");
      }

      maxProteinas = tamanho.maxProteinas;
      nomeItem = `Quentinha ${tamanho.nome}`;
    } else if (
      carrinhoItem.produto?.nome === "Jantinha P" ||
      carrinhoItem.produto?.nome === "Jantinha M"
    ) {
      // JANTINHAS DO CARDÁPIO NOTURNO

      nomeItem = carrinhoItem.produto.nome;

      maxProteinas = nomeItem === "Jantinha P" ? 1 : 2;

      if (tipo === "SALADA") {
        throw new Error("O cardápio noturno não possui saladas para Jantinha.");
      }
    } else {
      throw new Error(
        "Este produto não permite escolhas de proteínas ou acompanhamentos.",
      );
    }

    // ==========================================
    // 3. DATA ATUAL NO FUSO DE SÃO PAULO
    // ==========================================

    const partes = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());

    const obterParte = (parteTipo: string) =>
      Number(partes.find((parte) => parte.type === parteTipo)?.value);

    const dataHoje = new Date(
      Date.UTC(obterParte("year"), obterParte("month") - 1, obterParte("day")),
    );

    // ==========================================
    // 4. IDENTIFICAR PERÍODO DO CARDÁPIO
    // ==========================================

    const periodo = ehQuentinha ? "ALMOCO" : "NOITE";

    let cardapioId: string;

    if (periodo === "ALMOCO") {
      // QUENTINHAS NÃO POSSUEM produtoId.
      // BUSCAR DIRETAMENTE O CARDÁPIO DO ALMOÇO.

      const cardapio = await prisma.cardapio.findFirst({
        where: {
          data: dataHoje,
          periodo: "ALMOCO",
          ativo: true,
        },
        select: {
          id: true,
        },
      });

      if (!cardapio) {
        throw new Error("Não existe cardápio do almoço disponível para hoje.");
      }

      cardapioId = cardapio.id;
    } else {
      // JANTINHAS POSSUEM produtoId.
      // VALIDAR SE O PRODUTO ESTÁ NO CARDÁPIO NOTURNO.

      if (!carrinhoItem.produtoId) {
        throw new Error("Produto noturno não identificado.");
      }

      const itemCardapio = await prisma.cardapioItem.findFirst({
        where: {
          produtoId: carrinhoItem.produtoId,
          disponivel: true,
          cardapio: {
            data: dataHoje,
            periodo: "NOITE",
            ativo: true,
          },
        },
        select: {
          cardapioId: true,
        },
      });

      if (!itemCardapio) {
        throw new Error(
          "Produto não encontrado no cardápio noturno disponível.",
        );
      }

      cardapioId = itemCardapio.cardapioId;
    }

    // ==========================================
    // 5. VALIDAR OPÇÃO NO CARDÁPIO CORRETO
    // ==========================================

    const opcaoCardapio = await prisma.cardapioOpcaoQuentinha.findFirst({
      where: {
        cardapioId,
        opcaoId,
        tipo,
        disponivel: true,
      },
      include: {
        opcao: true,
      },
    });

    if (!opcaoCardapio) {
      throw new Error(
        `A opção "${nome}" não está disponível no cardápio de ${periodo === "ALMOCO" ? "almoço" : "noite"} de hoje.`,
      );
    }

    if (!opcaoCardapio.opcao.ativo) {
      throw new Error(`A opção "${nome}" está desativada.`);
    }

    if (!opcaoCardapio.opcao.disponivel) {
      throw new Error(`A opção "${nome}" está indisponível.`);
    }

    if (opcaoCardapio.opcao.nome !== nome) {
      throw new Error("O nome da opção não corresponde ao ID informado.");
    }

    // ==========================================
    // 6. IMPEDIR ESCOLHAS DUPLICADAS
    // ==========================================

    const escolhaExistente = await prisma.carrinhoItemEscolha.findFirst({
      where: {
        carrinhoItemId,
        opcaoId,
      },
    });

    if (escolhaExistente) {
      throw new Error(`A opção "${nome}" já foi adicionada a ${nomeItem}.`);
    }

    // ==========================================
    // 7. VALIDAR LIMITE DE PROTEÍNAS
    // ==========================================

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

    // ==========================================
    // 8. VALIDAR LIMITE DE SALADAS
    // ==========================================

    if (tipo === "SALADA") {
      const quantidadeSaladas = await prisma.carrinhoItemEscolha.count({
        where: {
          carrinhoItemId,
          tipo: "SALADA",
        },
      });

      if (quantidadeSaladas >= 2) {
        throw new Error("A quentinha permite no máximo 2 saladas.");
      }
    }

    // ==========================================
    // 9. SALVAR ESCOLHA
    // ==========================================

    return await prisma.carrinhoItemEscolha.create({
      data: {
        carrinhoItemId,
        tipo,
        nome: opcaoCardapio.opcao.nome,
        opcaoId,
      },
    });
  }

  // ==========================================
  // LISTAR ESCOLHAS
  // ==========================================

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

  // ==========================================
  // BUSCAR ESCOLHA POR ID
  // ==========================================

  async buscarPorId(id: string) {
    return await prisma.carrinhoItemEscolha.findUnique({
      where: {
        id,
      },
    });
  }

  // ==========================================
  // EXCLUIR ESCOLHA
  // ==========================================

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
