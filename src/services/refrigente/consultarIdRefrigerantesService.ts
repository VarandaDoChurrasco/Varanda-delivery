import { prisma } from "../../lib/prisma.js";

class ConsultarIdRefrigerantesService {
  async execute(id: string) {
    const refrigerante = await prisma.refrigerante.findUnique({
      where: {
        id,
      },
    });

    if (!refrigerante) {
      throw new Error("Refrigerante não encontrado.");
    }

    return refrigerante;
  }
}

export { ConsultarIdRefrigerantesService };
