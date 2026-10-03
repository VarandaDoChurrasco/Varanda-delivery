import { prisma } from "../../lib/prisma.js";

class ConsultarListRefrigerantesService {
  async execute() {
    const refrigerantes = await prisma.refrigerante.findMany({
      where: {
        ativo: true,
      },
      orderBy: {
        nome: "asc",
      },
    });
    if (!refrigerantes.length) {
      throw new Error("Nenhum refrigerante encontrado.");
    }

    return refrigerantes;
  }
}

export { ConsultarListRefrigerantesService };
