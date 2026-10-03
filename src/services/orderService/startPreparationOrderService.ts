import { prisma } from "../../lib/prisma.js";
import { StatusPedido } from "@prisma/client";

class startPreparationOrderService {
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

    if (pedido.status !== StatusPedido.CONFIRMADO) {
      throw new Error(
        `Não é possível iniciar o preparo. Status atual: ${pedido.status}`,
      );
    }

    const pedidoEmPreparo = await prisma.pedido.update({
      where: {
        id,
      },
      data: {
        status: StatusPedido.EM_PREPARO,
      },
    });

    return pedidoEmPreparo;
  }
}

export { startPreparationOrderService };
