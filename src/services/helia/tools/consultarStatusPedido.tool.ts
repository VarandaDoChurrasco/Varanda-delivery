import { GetOrderService } from "../../orderService/getIdOrderService.js";

const consultarStatusPedidoTool = {
  type: "function",

  function: {
    name: "consultar_status_pedido",

    description: `
Consulta o pedido mais recente do cliente e retorna número,
status, tipo (RETIRADA ou DELIVERY), valor e data de criação.

REGRAS OBRIGATÓRIAS:

1. Use esta ferramenta sempre que o cliente perguntar
sobre o andamento, situação ou previsão do pedido.

2. Se o pedido for RETIRADA:
- Informe que o prazo estimado de preparo é de 20 minutos a 40 minutos,
  contados a partir da confirmação do pedido.
- Se o status for PRONTO, não afirme que o pedido está
  fisicamente pronto apenas com base nesse status.
- Oriente o cliente a aguardar o prazo estimado.

3. Se o pedido for DELIVERY:
- Informe que o prazo estimado de entrega é de
  40 a 60 minutos após a confirmação.
- Se o status for PRONTO, não diga que o entregador
  já saiu para entrega.
- Se o status for SAIU_PARA_ENTREGA, explique que
  esse status pode ser atualizado automaticamente
  e não garante que o entregador realmente saiu.
- Se o status for ENTREGUE, não afirme que o cliente
  recebeu fisicamente o pedido sem confirmação.

4. Os status são atualizados automaticamente pelo sistema.
Por isso, não trate mudanças automáticas como comprovação
de preparo concluído, saída do entregador ou entrega realizada.

5. Nunca invente horários exatos de conclusão.
Os prazos informados são estimativas.
`,

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
