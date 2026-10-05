import { prisma } from "../../lib/prisma.js";
import { StatusPedido } from "@prisma/client";

class confirmOrderService {
  async execute(id: string) {
    if (!id) {
      throw new Error("ID do pedido não informado.");
    }

    const pedido = await prisma.pedido.findUnique({
      where: {
        id,
      },
    });

    if (!pedido) {
      throw new Error("Pedido não encontrado.");
    }

    if (pedido.status !== StatusPedido.AGUARDANDO_CONFIRMACAO) {
      throw new Error(
        `Não é possível confirmar o pedido. Status atual: ${pedido.status}`,
      );
    }

    const pedidoConfirmado = await prisma.pedido.update({
      where: {
        id,
      },
      data: {
        status: StatusPedido.PRONTO,
        confirmadoEm: new Date(),
      },
      include: {
        cliente: true,

        bairro: true,
        itens: {
          include: {
            remocoes: true,
            adicionais: true,
            escolhas: true,
          },
        },
        refrigerantes: {
          include: {
            refrigerante: true,
          },
        },
      },
    });

    return pedidoConfirmado;
  }
}

export { confirmOrderService };
