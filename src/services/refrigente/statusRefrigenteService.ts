import { prisma } from "../../lib/prisma.js";

class StatusRefrigerante {
  async marcarComoAcabou(id: string) {
    return prisma.refrigerante.update({
      where: { id },
      data: { acabouEm: new Date() },
    });
  }

  async marcarComoAtivo(id: string) {
    return prisma.refrigerante.update({
      where: { id },
      data: { acabouEm: null },
    });
  }

  async buscarPorNome(nome: string) {
    return prisma.refrigerante.findFirst({
      where: { nome: { equals: nome, mode: "insensitive" } },
    });
  }

  async desativarPorNome(nome: string) {
    const ref = await this.buscarPorNome(nome);
    if (!ref) return null;
    return this.marcarComoAcabou(ref.id);
  }

  async reativarAcabadosDeDiasAnteriores() {
    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);

    await prisma.refrigerante.updateMany({
      where: { acabouEm: { not: null, lt: inicioDoDia } },
      data: { acabouEm: null },
    });
  }

  async listar() {
    await this.reativarAcabadosDeDiasAnteriores();
    return prisma.refrigerante.findMany({ orderBy: { nome: "asc" } });
  }
}

export default new StatusRefrigerante();
