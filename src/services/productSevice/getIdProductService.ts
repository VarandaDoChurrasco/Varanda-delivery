import { prisma } from "../../lib/prisma.js";

class getIdProduct {
  async execute(id: string) {
    const getProduct = await prisma.produto.findUnique({
      where: {
        id,
      },
    });
    return getProduct;
  }
}
export { getIdProduct };
