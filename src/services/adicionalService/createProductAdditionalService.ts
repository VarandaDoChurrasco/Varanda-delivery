import { prisma } from "../../lib/prisma.js";
import { ProdutoAdicionalCreateRequest } from "../../type/type.js";

class createProductAdditionalService {
  async execulte(dados: ProdutoAdicionalCreateRequest) {
    if (!dados || !dados.produtoId || !dados.adicionalId) {
      throw new Error("Envie os dados obrigatórios (produtoId, adicionalId)");
    }

    const produto = await prisma.produto.findUnique({
      where: {
        id: dados.produtoId,
      },
    });

    if (!produto) {
      throw new Error("Produto não encontrado.");
    }

    const adicional = await prisma.adicional.findUnique({
      where: {
        id: dados.adicionalId,
      },
    });

    if (!adicional) {
      throw new Error("Adicional não encontrado.");
    }

    const relacaoExistente = await prisma.produtoAdicional.findUnique({
      where: {
        produtoId_adicionalId: {
          produtoId: dados.produtoId,
          adicionalId: dados.adicionalId,
        },
      },
    });

    if (relacaoExistente) {
      throw new Error("Este adicional já está relacionado a este produto.");
    }

    const produtoAdicional = await prisma.produtoAdicional.create({
      data: {
        produtoId: dados.produtoId,
        adicionalId: dados.adicionalId,
      },
    });

    return produtoAdicional;
  }
}

export { createProductAdditionalService };
