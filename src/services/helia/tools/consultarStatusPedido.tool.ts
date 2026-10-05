import { GetOrderService } from "../../orderService/getIdOrderService.js";

const consultarStatusPedidoTool = {
  type: "function",

  function: {
    name: "consultar_status_pedido",

    description:
      "Consulta o pedido mais recente do cliente e informa o número, status e dados principais do pedido. Deve ser usada sempre que o cliente perguntar sobre o andamento ou situação do pedido.",

    parameters: {
      type: "object",

      properties: {},

      required: [],

      additionalProperties: false,
    },
  },
};

async function executarConsultarStatusPedido(clienteId: string) {
  const service = new GetOrderService();

  const pedido = await service.execute(clienteId);

  return {
    pedidoId: pedido.id,
    numero: pedido.numero,
    status: pedido.status,
    tipo: pedido.tipo,
    total: Number(pedido.total),
    createdAt: pedido.createdAt,
  };
}

export { consultarStatusPedidoTool, executarConsultarStatusPedido };
