import { prisma } from "../../lib/prisma.js";
import { StatusPedido, TipoPedido } from "@prisma/client";

class entregueOrderService {
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

    if (pedido.tipo === TipoPedido.DELIVERY) {
      if (pedido.status !== StatusPedido.SAIU_PARA_ENTREGA) {
        throw new Error(
          `Não é possível finalizar a entrega. Status atual: ${pedido.status}`,
        );
      }
    }

    if (pedido.tipo === TipoPedido.RETIRADA) {
      if (pedido.status !== StatusPedido.PRONTO) {
        throw new Error(
          `Não é possível finalizar a retirada. Status atual: ${pedido.status}`,
        );
      }
    }
    const entregue = await prisma.pedido.update({
      where: {
        id,
      },
      data: {
        status: StatusPedido.ENTREGUE,
      },
    });

    return entregue;
  }
}

export { entregueOrderService };
