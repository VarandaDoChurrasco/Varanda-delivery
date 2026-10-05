import { prisma } from "../../lib/prisma.js";

class GetOrderService {
  async execute(clienteId: string | { clienteId: string }) {
    const idCliente =
      typeof clienteId === "string" ? clienteId : clienteId.clienteId;

    const pedido = await prisma.pedido.findFirst({
      where: {
        clienteId: idCliente,
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        cliente: true,

        bairro: true,

        itens: {
          include: {
            adicionais: true,
            escolhas: true,
            remocoes: true,
          },
        },

        refrigerantes: true,
      },
    });

    if (!pedido) {
      throw new Error("Este cliente ainda não possui pedidos.");
    }

    return pedido;
  }
}

export { GetOrderService };
