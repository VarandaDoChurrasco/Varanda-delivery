import { prisma } from "../../lib/prisma.js";

class GetOrderTodayService {
  async execute() {
    // Obtém a data e a hora atuais no horário de Brasília.
    const agora = new Date();

    const dataBrasilia = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(agora);

    // Converte a data de Brasília em limites UTC.
    const [ano, mes, dia] = dataBrasilia.split("-").map(Number);

    const inicioDoDia = new Date(
      Date.UTC(ano, mes - 1, dia) + 3 * 60 * 60 * 1000,
    );

    const fimDoDia = new Date(
      Date.UTC(ano, mes - 1, dia + 1) + 3 * 60 * 60 * 1000 - 1,
    );

    const pedidos = await prisma.pedido.findMany({
      where: {
        createdAt: {
          gte: inicioDoDia,
          lte: fimDoDia,
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            telefone: true,
          },
        },

        bairro: {
          select: {
            id: true,
            nome: true,
            taxaEntrega: true,
          },
        },

        itens: {
          include: {
            escolhas: true,
            adicionais: true,
            remocoes: true,
          },
        },

        refrigerantes: {
          include: {
            refrigerante: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
      },
    });

    return pedidos;
  }
}

export { GetOrderTodayService };
