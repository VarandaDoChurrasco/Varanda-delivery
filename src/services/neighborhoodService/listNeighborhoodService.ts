import { prisma } from "../../lib/prisma.js";

class listNeighborhoodService {
  async execute() {
    const bairros = await prisma.bairro.findMany({
      orderBy: {
        nome: "asc",
      },
    });

    console.log("BAIRROS NO SERVICE:", bairros);

    return bairros;
  }
}

export { listNeighborhoodService };
