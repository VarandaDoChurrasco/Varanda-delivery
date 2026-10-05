import { prisma } from "../../lib/prisma.js";

class GetAllOrderService {
  async execute() {
    const pedidos = await prisma.pedido.findMany({
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
      throw new Error("Nenhum pedido ainda.");
    }

    return pedidos;
  }
}

export { GetAllOrderService };
