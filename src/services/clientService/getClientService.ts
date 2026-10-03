import { prisma } from "../../lib/prisma.js";

class getClientService {
  async execute(telefone: string) {
    if (!telefone || typeof telefone !== "string" || telefone.trim() === "") {
      throw new Error("O telefone é obrigatório.");
    }

    const formattedPhone = telefone.trim();

    const getClient = await prisma.cliente.findUnique({
      where: { telefone: formattedPhone },
    });

    return getClient;
  }
}

export { getClientService };
