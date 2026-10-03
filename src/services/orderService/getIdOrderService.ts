import { prisma } from "../../lib/prisma.js";

class getOrderService {
  async execute(id: string) {
    const pedido = await prisma.pedido.findUnique({
      where: {
        id,
      },
      include: {
        cliente: true,
        bairro: true,
        itens: {
          include: {
            adicionais: true,
            remocoes: true,
          },
        },
      },
    });
    if (!pedido) {
      throw new Error("Este pedido nao existe...");
    }
    return pedido;
  }
}
export { getOrderService };
