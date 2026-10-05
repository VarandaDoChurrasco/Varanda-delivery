import { GetOrderService } from "./services/orderService/getIdOrderService.js";

const service = new GetOrderService();

const pedido = await service.execute("d06985d9-d826-42e5-b51e-b86984dbef93");

console.log("PEDIDO:", {
  id: pedido.id,
  numero: pedido.numero,
  tipo: pedido.tipo,
  status: pedido.status,
  total: Number(pedido.total),
});
