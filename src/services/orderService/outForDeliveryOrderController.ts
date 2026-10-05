import { prisma } from "../../lib/prisma.js";
import { StatusPedido, TipoPedido } from "@prisma/client";

class SaiuEntregaOrderService {
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

    if (pedido.tipo !== TipoPedido.DELIVERY) {
      throw new Error("Somente pedidos de entrega podem sair para entrega.");
    }

    if (pedido.status !== StatusPedido.PRONTO) {
      throw new Error(
        `Não é possível iniciar a entrega. Status atual: ${pedido.status}`,
      );
    }

    const pedidoSaiuParaEntrega = await prisma.pedido.update({
      where: {
        id,
      },
      data: {
        status: StatusPedido.SAIU_PARA_ENTREGA,
      },
    });

    return pedidoSaiuParaEntrega;
  }
}

export { SaiuEntregaOrderService };
