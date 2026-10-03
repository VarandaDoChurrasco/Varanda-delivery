import { prisma } from "../../lib/prisma.js";

type CadastrarRefrigeranteInput = {
  nome: string;
  preco: number;
};

class CadastrarRefrigeranteService {
  async execute({ nome, preco }: CadastrarRefrigeranteInput) {
    const nomeNormalizado = nome.trim();

    if (!nomeNormalizado) {
      throw new Error("Nome do refrigerante não informado.");
    }

    if (!Number.isFinite(preco) || preco <= 0) {
      throw new Error("Preço do refrigerante inválido.");
    }

    const refrigerante = await prisma.refrigerante.upsert({
      where: {
        nome: nomeNormalizado,
      },
      update: {
        preco,
        ativo: true,
      },
      create: {
        nome: nomeNormalizado,
        preco,
        ativo: true,
      },
    });

    return refrigerante;
  }
}

export { CadastrarRefrigeranteService };
