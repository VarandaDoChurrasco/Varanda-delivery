import { prisma } from "../../lib/prisma.js";

class getNeighborhoodService {
  async execute(id: string) {
    const bairro = await prisma.bairro.findUnique({
      where: {
        id,
      },
    });

    if (!bairro) {
      throw new Error("Bairro não encontrado.");
    }

    return bairro;
  }
}

export { getNeighborhoodService };
