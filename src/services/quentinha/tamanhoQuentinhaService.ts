import { prisma } from "../../lib/prisma.js";
import { TamanhoQuentinhaData } from "../../type/type.js";

class TamanhoQuentinhaService {
  async create(dados: TamanhoQuentinhaData) {
    if (
      !dados ||
      !dados.nome ||
      dados.preco === undefined ||
      dados.maxProteinas === undefined
    ) {
      throw new Error(
        "Envie os dados obrigatórios: nome, preco e maxProteinas.",
      );
    }

    if (dados.preco <= 0) {
      throw new Error("O preço deve ser maior que zero.");
    }

    if (!Number.isInteger(dados.maxProteinas) || dados.maxProteinas <= 0) {
      throw new Error(
        "A quantidade máxima de proteínas deve ser um número inteiro maior que zero.",
      );
    }

    const existente = await prisma.tamanhoQuentinha.findUnique({
      where: {
        nome: dados.nome,
      },
    });

    if (existente) {
      throw new Error("Esse tamanho de quentinha já existe.");
    }

    const tamanho = await prisma.tamanhoQuentinha.create({
      data: {
        nome: dados.nome,
        preco: dados.preco,
        maxProteinas: dados.maxProteinas,
      },
    });

    return tamanho;
  }

  async get() {
    const tamanhos = await prisma.tamanhoQuentinha.findMany({
      where: {
        ativo: true,
      },
      orderBy: {
        preco: "asc",
      },
    });

    return tamanhos;
  }

  async update(id: string, dados: Partial<TamanhoQuentinhaData>) {
    if (!id) {
      throw new Error("Informe o ID do tamanho da quentinha.");
    }

    const existente = await prisma.tamanhoQuentinha.findUnique({
      where: {
        id,
      },
    });

    if (!existente) {
      throw new Error("Tamanho de quentinha não encontrado.");
    }

    if (dados.preco !== undefined && dados.preco <= 0) {
      throw new Error("O preço deve ser maior que zero.");
    }

    if (
      dados.maxProteinas !== undefined &&
      (!Number.isInteger(dados.maxProteinas) || dados.maxProteinas <= 0)
    ) {
      throw new Error(
        "A quantidade máxima de proteínas deve ser um número inteiro maior que zero.",
      );
    }

    if (dados.nome && dados.nome !== existente.nome) {
      const nomeExistente = await prisma.tamanhoQuentinha.findUnique({
        where: {
          nome: dados.nome,
        },
      });

      if (nomeExistente) {
        throw new Error("Esse tamanho de quentinha já existe.");
      }
    }

    const tamanhoAtualizado = await prisma.tamanhoQuentinha.update({
      where: {
        id,
      },
      data: {
        ...(dados.nome !== undefined && {
          nome: dados.nome,
        }),
        ...(dados.preco !== undefined && {
          preco: dados.preco,
        }),
        ...(dados.maxProteinas !== undefined && {
          maxProteinas: dados.maxProteinas,
        }),
      },
    });

    return tamanhoAtualizado;
  }

  async getById(id: string) {
    if (!id) {
      throw new Error("Informe o ID do tamanho da quentinha.");
    }

    const tamanho = await prisma.tamanhoQuentinha.findUnique({
      where: {
        id,
      },
    });

    if (!tamanho) {
      throw new Error("Tamanho de quentinha não encontrado.");
    }

    return tamanho;
  }

  async desativar(id: string) {
    if (!id) {
      throw new Error("Informe o ID do tamanho da quentinha.");
    }

    const tamanho = await prisma.tamanhoQuentinha.findUnique({
      where: {
        id,
      },
    });

    if (!tamanho) {
      throw new Error("Tamanho de quentinha não encontrado.");
    }

    return await prisma.tamanhoQuentinha.update({
      where: {
        id,
      },
      data: {
        ativo: false,
      },
    });
  }
}

export { TamanhoQuentinhaService };
