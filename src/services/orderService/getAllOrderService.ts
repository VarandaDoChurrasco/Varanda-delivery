import { prisma } from "../../lib/prisma.js";

class GetAllOrderService {
  async execute() {
    const pedidos = await prisma.pedido.findMany({
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

    if (!pedidos) {
      throw new Error("Nenhum pedido ainda.....");
    }
    return pedidos;
  }
}
export { GetAllOrderService };
