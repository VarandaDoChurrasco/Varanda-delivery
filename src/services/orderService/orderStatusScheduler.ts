import { prisma } from "../../lib/prisma.js";
import { AutomaticOrderStatusService } from "./automaticOrderStatusService.js";

const select = {
  id: true, tipo: true, status: true, confirmadoEm: true, updatedAt: true,
} as const;

export const orderStatusScheduler = new AutomaticOrderStatusService({
  pending: () => prisma.pedido.findMany({
    where: {
      tipo: "DELIVERY",
      confirmadoEm: { not: null },
      status: { in: ["PRONTO", "SAIU_PARA_ENTREGA"] },
    },
    select,
  }),
  get: (id) => prisma.pedido.findUnique({ where: { id }, select }),
  transition: async (order, status) => {
    if (!order.confirmadoEm ||
        (order.status !== "PRONTO" && order.status !== "SAIU_PARA_ENTREGA")) return;
    await prisma.pedido.updateMany({
      where: {
        id: order.id,
        tipo: "DELIVERY",
        status: order.status,
        confirmadoEm: order.confirmadoEm,
        updatedAt: order.updatedAt,
      },
      data: { status },
    });
  },
});
