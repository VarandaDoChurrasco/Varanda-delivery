import { prisma } from "../../lib/prisma.js";
import { StatusPedido, TipoPedido } from "@prisma/client";

class AutomaticOrderStatusService {
  async execute() {
    const agora = new Date();

    const pedidos = await prisma.pedido.findMany({
      where: {
        tipo: TipoPedido.DELIVERY,
        confirmadoEm: {
          not: null,
        },
        status: {
          in: [StatusPedido.PRONTO, StatusPedido.SAIU_PARA_ENTREGA],
        },
      },
    });

    for (const pedido of pedidos) {
      if (!pedido.confirmadoEm) {
        continue;
      }

      const minutosDesdeConfirmacao =
        (agora.getTime() - pedido.confirmadoEm.getTime()) / 60000;

      if (
        pedido.status === StatusPedido.PRONTO &&
        minutosDesdeConfirmacao >= 20
      ) {
        await prisma.pedido.update({
          where: {
            id: pedido.id,
          },
          data: {
            status: StatusPedido.SAIU_PARA_ENTREGA,
          },
        });

        console.log(
          `🚚 Pedido #${pedido.numero} saiu para entrega automaticamente.`,
        );
      }

      if (
        pedido.status === StatusPedido.SAIU_PARA_ENTREGA &&
        minutosDesdeConfirmacao >= 60
      ) {
        await prisma.pedido.update({
          where: {
            id: pedido.id,
          },
          data: {
            status: StatusPedido.ENTREGUE,
          },
        });

        console.log(`✅ Pedido #${pedido.numero} entregue automaticamente.`);
      }
    }
  }
}

export { AutomaticOrderStatusService };
