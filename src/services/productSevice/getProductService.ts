import { prisma } from "../../lib/prisma.js";

class getProductService {
  async execute() {
    const produtos = await prisma.produto.findMany({
      orderBy: {
        nome: "asc",
      },
      include: {
        categoria: true, // <--- ISSO AQUI traz os dados da Categoria junto com o Produto
      },
    });
    console.log("Produtos com categoria");
    return produtos;
  }
}

export { getProductService };
