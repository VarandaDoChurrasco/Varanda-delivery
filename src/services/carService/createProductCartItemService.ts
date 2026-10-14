import { prisma } from "../../lib/prisma.js";

interface CriarProdutoCarrinhoData {
  carrinhoId: string;
  produtoId: string;
  quantidade: number;
  observacao?: string;
}

class CreateProductCartItemService {
  async execute(dados: CriarProdutoCarrinhoData) {
    if (
      !dados?.carrinhoId ||
      !dados?.produtoId ||
      dados.quantidade === undefined
    ) {
      throw new Error("Envie carrinhoId, produtoId e quantidade.");
    }

    if (!Number.isInteger(dados.quantidade) || dados.quantidade <= 0) {
      throw new Error(
        "A quantidade deve ser um número inteiro maior que zero.",
      );
    }

    // 1. Valida o carrinho
    const carrinho = await prisma.carrinho.findUnique({
      where: { id: dados.carrinhoId },
    });

    if (!carrinho) {
      throw new Error("Carrinho não encontrado.");
    }

    if (carrinho.status !== "ABERTO") {
      throw new Error("Este carrinho não está aberto.");
    }

    // 2. Obtém data e horário de Brasília
    const partesData = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date());

    const obterParte = (tipo: string) =>
      partesData.find((parte) => parte.type === tipo)?.value ?? "";

    const ano = Number(obterParte("year"));
    const mes = Number(obterParte("month"));
    const dia = Number(obterParte("day"));
    const hora = Number(obterParte("hour"));

    if (hora < 15) {
      throw new Error(
        "Os produtos individuais estão disponíveis somente no cardápio noturno, a partir das 15h.",
      );
    }

    const dataHoje = new Date(Date.UTC(ano, mes - 1, dia));

    // 3. Busca o cardápio noturno de hoje
    const cardapio = await prisma.cardapio.findFirst({
      where: {
        data: dataHoje,
        periodo: "NOITE",
        ativo: true,
      },
    });

    if (!cardapio) {
      throw new Error("Não existe cardápio noturno ativo para hoje.");
    }

    // 4. Confere se o produto pertence ao cardápio atual
    const itemCardapio = await prisma.cardapioItem.findFirst({
      where: {
        cardapioId: cardapio.id,
        produtoId: dados.produtoId,
        disponivel: true,
        produto: {
          tipo: "SIMPLES",
          ativo: true,
          disponivel: true,
        },
      },
      include: {
        produto: true,
      },
    });

    if (!itemCardapio) {
      throw new Error(
        "Produto não encontrado ou indisponível no cardápio noturno de hoje.",
      );
    }

    // 5. Adiciona ao carrinho usando o preço do cardápio
    const carrinhoItem = await prisma.carrinhoItem.create({
      data: {
        carrinhoId: dados.carrinhoId,
        produtoId: itemCardapio.produtoId,
        quantidade: dados.quantidade,
        precoUnitario: itemCardapio.preco,
        observacao: dados.observacao,
      },
      include: {
        escolhas: true,
        adicionais: true,
        remocoes: true,
      },
    });

    return {
      ...carrinhoItem,
      produtoNome: itemCardapio.produto.nome,
    };
  }
}

export { CreateProductCartItemService };
