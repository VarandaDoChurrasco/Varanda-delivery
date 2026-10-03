import { prisma } from "../../lib/prisma.js";

class ListarProdutosComAdicionaisService {
  async execute() {
    const produtos = await prisma.produto.findMany({
      include: {
        adicionais: {
          include: {
            adicional: true,
          },
        },
      },
    });

    return produtos;
  }
}
export { ListarProdutosComAdicionaisService };
