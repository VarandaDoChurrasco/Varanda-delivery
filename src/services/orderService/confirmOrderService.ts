import { orderStatusScheduler } from "./orderStatusScheduler.js";
import { prisma } from "../../lib/prisma.js";
import { emitirNovoPedido } from "../../lib/socket.js";
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
        `Não é possível confirmar o pedido. Status atual: ${pedido.status}`
      );
    }

    const pedidoConfirmado = await prisma.$transaction(async (tx) => {
      const confirmado = await tx.pedido.update({
        where: {
          id,
          status: pedido.status,
          updatedAt: pedido.updatedAt,
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

      await tx.printRequest.upsert({
        where: { pedidoId: confirmado.id },
        update: {},
        create: {
          pedidoId: confirmado.id,
          payload: JSON.parse(JSON.stringify(confirmado)),
        },
      });
      return confirmado;
    });

    // A missed notification is harmless: PENDING requests remain recoverable.
    try {
      emitirNovoPedido(pedidoConfirmado);
    } catch (error) {
      console.error(
        "Falha no aviso de impressão; solicitação persistida",
        error
      );
    }
    orderStatusScheduler.synchronize(pedidoConfirmado);

    return pedidoConfirmado;
  }
}

export { confirmOrderService };
