import { prisma } from "../../lib/prisma.js";

class getCategoryService {
  async execute() {
    const category = await prisma.categoria.findMany({
      orderBy: {
        nome: "asc",
      },
    });
    return category;
  }
}
export { getCategoryService };
