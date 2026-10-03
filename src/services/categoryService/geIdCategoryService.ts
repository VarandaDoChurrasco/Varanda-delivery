import { prisma } from "../../lib/prisma.js";

class getIdCategoryService {
  async execute(id: string) {
    const getIdCategory = await prisma.categoria.findUnique({
      where: {
        id,
      },
    });
    return getIdCategory;
  }
}
export { getIdCategoryService };
