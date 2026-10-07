import { prisma } from "../../lib/prisma.js";

class GetOrderTodayService {
  async execute() {
    const agora = new Date();

    const inicioDoDia = new Date(agora);
    inicioDoDia.setHours(0, 0, 0, 0);

    const fimDoDia = new Date(agora);
    fimDoDia.setHours(23, 59, 59, 999);

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

    if (pedidos.length === 0) {
      throw new Error("Nenhum pedido hoje.");
    }

    return pedidos;
  }
}

export { GetOrderTodayService };
