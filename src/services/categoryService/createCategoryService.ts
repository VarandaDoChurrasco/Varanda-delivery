import { prisma } from "../../lib/prisma.js";

export class CreateCategoryService {
  async execute({ nome }: { nome: string | null }) {
    if (!nome || nome.trim() === "") {
      throw new Error("O nome e obrigatorio.");
    }

    const formattedName = nome.trim();

    const categoryAlreadyExists = await prisma.categoria.findFirst({
      where: {
        nome: formattedName,
      },
    });

    if (categoryAlreadyExists) {
      throw new Error("Já existe uma categoria cadastrada com este nome.");
    }

    const categoria = await prisma.categoria.create({
      data: {
        nome: formattedName,
      },
    });

    return categoria;
  }
}
