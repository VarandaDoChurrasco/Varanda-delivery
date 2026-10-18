import { prisma } from "../../lib/prisma.js";

interface CriarJantinhaData {
  carrinhoId: string;
  produtoId: string;
  quantidade: number;
  observacao?: string;
}

export class CreateJantinhaCartItemService {
  async execute(dados: CriarJantinhaData) {
    const { carrinhoId, produtoId, quantidade, observacao } = dados;

    if (!carrinhoId || !produtoId) {
      throw new Error("Informe o carrinho e a jantinha.");
    }

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      throw new Error("Quantidade inválida.");
    }

    const carrinho = await prisma.carrinho.findUnique({
      where: { id: carrinhoId },
    });

    if (!carrinho || carrinho.status !== "ABERTO") {
      throw new Error("Carrinho não encontrado ou finalizado.");
    }

    const partes = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date());

    const parte = (tipo: string) =>
      partes.find((p) => p.type === tipo)?.value ?? "";

    const ano = Number(parte("year"));
    const mes = Number(parte("month"));
    const dia = Number(parte("day"));
    const hora = Number(parte("hour"));

    if (hora < 15) {
      throw new Error("A jantinha só está disponível a partir das 15h.");
    }

    const dataHoje = new Date(Date.UTC(ano, mes - 1, dia));

    const itemCardapio = await prisma.cardapioItem.findFirst({
      where: {
        produtoId,
        disponivel: true,
        produto: {
          nome: {
            in: ["Jantinha P", "Jantinha M"],
          },
          tipo: "QUENTINHA",
          ativo: true,
          disponivel: true,
        },
        cardapio: {
          data: dataHoje,
          periodo: "NOITE",
          ativo: true,
        },
      },
      include: {
        produto: true,
      },
    });

    if (!itemCardapio) {
      throw new Error("Jantinha não disponível no cardápio noturno de hoje.");
    }

    return await prisma.carrinhoItem.create({
      data: {
        carrinhoId,
        produtoId,
        quantidade,
        precoUnitario: itemCardapio.preco,
        observacao,
      },
      include: {
        escolhas: true,
        adicionais: true,
        remocoes: true,
      },
    });
  }
}
