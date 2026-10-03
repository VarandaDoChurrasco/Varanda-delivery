import { confirmOrderService } from "../../orderService/confirmOrderService.js";

const pedidoService = new confirmOrderService();

export const confirmarPedidoTool = {
  type: "function" as const,

  function: {
    name: "confirmar_pedido",

    description:
      "Confirma um pedido que está com status AGUARDANDO_CONFIRMACAO. Só deve ser usada depois que o cliente tiver confirmado explicitamente o resumo final do pedido.",

    parameters: {
      type: "object",

      properties: {
        pedidoId: {
          type: "string",
          description: "ID do pedido que está aguardando confirmação.",
        },
      },

      required: ["pedidoId"],

      additionalProperties: false,
    },
  },
};

export async function executarConfirmarPedido(args: { pedidoId: string }) {
  if (!args.pedidoId) {
    throw new Error("pedidoId não informado.");
  }

  const pedido = await pedidoService.execute(args.pedidoId);

  return {
    sucesso: true,
    pedidoId: pedido.id,
    numero: pedido.numero,
    status: pedido.status,
    confirmadoEm: pedido.confirmadoEm,
    total: Number(pedido.total),
    formaPagamento: pedido.formaPagamento,
  };
}
