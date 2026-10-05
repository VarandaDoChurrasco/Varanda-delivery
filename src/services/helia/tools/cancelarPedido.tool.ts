//import { cancelOrderService } from "../../orderService/cancelOrderService.js";
import { GetOrderService } from "../../orderService/getIdOrderService.js";
import { cancelOrderService } from "../../orderService/cancelOrderService.js";
const cancelarPedidoTool = {
  type: "function",

  function: {
    name: "cancelar_pedido",

    description:
      "Cancela o pedido mais recente do cliente. Só deve ser usada depois que o cliente confirmar explicitamente que deseja cancelar o pedido.",

    parameters: {
      type: "object",

      properties: {},

      required: [],

      additionalProperties: false,
    },
  },
};

async function executarCancelarPedido(
  clienteId: string | { clienteId: string },
) {
  const getOrderService = new GetOrderService();

  const pedido = await getOrderService.execute(clienteId);

  const cancelService = new cancelOrderService();

  const pedidoCancelado = await cancelService.execute(pedido.id);

  return {
    pedidoId: pedidoCancelado.id,
    numero: pedidoCancelado.numero,
    status: pedidoCancelado.status,
  };
}

export { cancelarPedidoTool, executarCancelarPedido };
