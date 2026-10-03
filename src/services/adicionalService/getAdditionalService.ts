import { prisma } from "../../lib/prisma.js";

class getAdditionalService {
  async execute() {
    const adicional = await prisma.adicional.findMany({
      orderBy: {
        nome: "asc",
      },
    });
    return adicional;
  }
}

export { getAdditionalService };
