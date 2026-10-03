import { error } from "console";
import { prisma } from "../../lib/prisma.js";
import { ProdutoCreateRequest } from "../../type/type.js";

class createProductService {
  async execulte(dados: ProdutoCreateRequest) {
    if (!dados || !dados.nome || !dados.preco || !dados.categoriaId) {
      throw new Error(
        "Envie todos os dados obrigatórios (nome, preco, categoriaId)",
      );
    }

    const product = await prisma.produto.create({
      data: {
        nome: dados.nome,
        descricao: dados.descricao,
        preco: dados.preco, // O Prisma aceita o 'number' aqui tranquilamente!
        categoriaId: dados.categoriaId,
        // disponivel e ativo pegarão o default(true) se não forem enviados
      },
    });
    return product;
  }
}

export { createProductService };
