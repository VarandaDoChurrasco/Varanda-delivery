import { prisma } from "../../lib/prisma.js";
import { BairroCreateRequest } from "../../type/type.js";

class createBairroService {
  async execute(dados: BairroCreateRequest) {
    if (!dados || !dados.nome || dados.taxaEntrega === undefined) {
      throw new Error("Envie os dados obrigatórios (nome, taxaEntrega)");
    }

    if (dados.taxaEntrega < 0) {
      throw new Error("A taxa de entrega não pode ser negativa.");
    }

    const bairroExistente = await prisma.bairro.findUnique({
      where: {
        nome: dados.nome,
      },
    });

    if (bairroExistente) {
      throw new Error("Este bairro já está cadastrado.");
    }

    const bairro = await prisma.bairro.create({
      data: {
        nome: dados.nome,
        taxaEntrega: dados.taxaEntrega,
      },
    });

    return bairro;
  }
}

export { createBairroService };
