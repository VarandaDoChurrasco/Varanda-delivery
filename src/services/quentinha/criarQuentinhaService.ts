import { prisma } from "../../lib/prisma.js";

interface CriarOpcaoData {
  nome: string;
  tipo: "PROTEINA" | "ACOMPANHAMENTO" | "SALADA";
}

export class OpcaoQuentinhaService {
  async criar(data: CriarOpcaoData) {
    const { nome, tipo } = data;

    const existente = await prisma.opcaoQuentinha.findUnique({
      where: {
        nome,
      },
    });

    if (existente) {
      throw new Error("Essa opção de quentinha já existe.");
    }

    return await prisma.opcaoQuentinha.create({
      data: {
        nome,
        tipo,
      },
    });
  }

  async listar() {
    return await prisma.opcaoQuentinha.findMany({
      where: {
        ativo: true,
        disponivel: true,
      },
      orderBy: [
        {
          tipo: "asc",
        },
        {
          nome: "asc",
        },
      ],
    });
  }

  async listarPorTipo(tipo: "PROTEINA" | "ACOMPANHAMENTO" | "SALADA") {
    return await prisma.opcaoQuentinha.findMany({
      where: {
        tipo,
        ativo: true,
        disponivel: true,
      },
      orderBy: {
        nome: "asc",
      },
    });
  }

  async buscarPorId(id: string) {
    return await prisma.opcaoQuentinha.findUnique({
      where: {
        id,
      },
    });
  }

  async atualizar(id: string, data: Partial<CriarOpcaoData>) {
    return await prisma.opcaoQuentinha.update({
      where: {
        id,
      },
      data,
    });
  }

  async desativar(id: string) {
    return await prisma.opcaoQuentinha.update({
      where: {
        id,
      },
      data: {
        ativo: false,
      },
    });
  }
}
