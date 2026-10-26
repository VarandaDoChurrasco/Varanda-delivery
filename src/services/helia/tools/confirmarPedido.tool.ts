import { confirmOrderService } from "../../orderService/confirmOrderService.js";
import { EnviarComprovantePedidoService } from "../../printService/enviarComprovantePedidoService.js";

const pedidoService = new confirmOrderService();
const enviarComprovante = new EnviarComprovantePedidoService();

export const confirmarPedidoTool = {
  type: "function" as const,

  function: {
    name: "confirmar_pedido",

    description:
      "Confirma um pedido com status AGUARDANDO_CONFIRMACAO. " +
      "Use SOMENTE depois que o cliente responder afirmativamente " +
      "à pergunta de confirmação do resumo final. " +
      "Nunca confirme sem autorização explícita do cliente.",

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

  console.log(
    `✅ Pedido #${pedido.numero} confirmado. Status: ${pedido.status}`,
    //===================
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
