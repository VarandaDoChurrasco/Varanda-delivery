import { prisma } from "../../lib/prisma.js";
import { AdicionalCreateRequest } from "../../type/type.js";

class createAdditionalService {
  async execulte(dados: AdicionalCreateRequest) {
    if (!dados || !dados.nome || dados.preco === undefined) {
      throw new Error("Envie todos os dados obrigatórios (nome, preco)");
    }

    if (dados.preco < 0) {
      throw new Error("O preço não pode ser negativo.");
    }

    const exists = await prisma.adicional.findFirst({
      where: {
        nome: dados.nome,
      },
    });

    if (exists) {
      throw new Error("Adicional já existe.");
    }

    const adicional = await prisma.adicional.create({
      data: {
        nome: dados.nome,
        preco: dados.preco,
      },
    });

    return adicional;
  }
}

export { createAdditionalService };
