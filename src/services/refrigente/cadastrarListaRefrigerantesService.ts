import { prisma } from "../../lib/prisma.js";

type RefrigeranteInput = {
  nome: string;
  preco: number;
};

class CadastrarListaRefrigerantesService {
  async execute(refrigerantes: RefrigeranteInput[]) {
    if (!refrigerantes.length) {
      throw new Error("Nenhum refrigerante informado.");
    }

    const cadastrados = [];

    for (const refrigerante of refrigerantes) {
      const nome = refrigerante.nome.trim();

      if (!nome) {
        throw new Error("Nome do refrigerante não informado.");
      }

      if (!Number.isFinite(refrigerante.preco) || refrigerante.preco <= 0) {
        throw new Error(`Preço inválido para o refrigerante: ${nome}`);
      }
      const cadastrado = await prisma.refrigerante.upsert({
        where: {
          nome,
        },
        update: {
          preco: refrigerante.preco,
          ativo: true,
        },
        create: {
          nome,
          preco: refrigerante.preco,
          ativo: true,
        },
      });
      cadastrados.push(cadastrado);
    }

    return cadastrados;
  }
}

export { CadastrarListaRefrigerantesService };
