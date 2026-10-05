import { prisma } from "../../lib/prisma.js";
import { StatusPedido } from "@prisma/client";

class cancelOrderService {
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

    if (
      pedido.status !== StatusPedido.AGUARDANDO_CONFIRMACAO &&
      pedido.status !== StatusPedido.PRONTO
    ) {
      throw new Error(
        `Não é possível cancelar o pedido. Status atual: ${pedido.status}`,
      );
    }

    const pedidoCancelado = await prisma.pedido.update({
      where: {
        id,
      },
      data: {
        status: StatusPedido.CANCELADO,
      },
    });

    return pedidoCancelado;
  }
}

export { cancelOrderService };
