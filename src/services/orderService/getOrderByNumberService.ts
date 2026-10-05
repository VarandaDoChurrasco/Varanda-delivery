import { prisma } from "../../lib/prisma.js";

class GetOrderByNumberService {
  async execute(numero: number) {
    if (!numero || !Number.isInteger(numero)) {
      throw new Error("Número do pedido inválido.");
    }

    const pedido = await prisma.pedido.findUnique({
      where: {
        numero,
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

    if (!pedido) {
      throw new Error(`Pedido #${numero} não encontrado.`);
    }

    return pedido;
  }
}

export { GetOrderByNumberService };
