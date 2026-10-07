import { confirmOrderService } from "../../orderService/confirmOrderService.js";
import { EnviarComprovantePedidoService } from "../../printService/enviarComprovantePedidoService.js";
import { emitirNovoPedido } from "../../../lib/socket.js";

const pedidoService = new confirmOrderService();
const enviarComprovante = new EnviarComprovantePedidoService();

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
  console.log("🔵 CONFIRMAR_PEDIDO: iniciando", args.pedidoId);
  // 1. Confirma o pedido
  const pedido = await pedidoService.execute(args.pedidoId);

  console.log(
    "🟢 CONFIRMAR_PEDIDO: pedido confirmado no banco:",
    pedido.numero,
  );

  console.log("🟡 CONFIRMAR_PEDIDO: chamando emitirNovoPedido...");

  emitirNovoPedido(pedido);

  console.log(
    `✅ Pedido #${pedido.numero} confirmado. Status: ${pedido.status}`,
  );

  // 2. Envia o comprovante para o administrador
  try {
    await enviarComprovante.execute(pedido);

    console.log(
      `📄 Comprovante do pedido #${pedido.numero} enviado ao administrador.`,
    );
  } catch (error) {
    console.error(
      `❌ Erro ao enviar comprovante do pedido #${pedido.numero}:`,
      error,
    );
  }

  // 3. Retorna o resultado para a Hélia
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
