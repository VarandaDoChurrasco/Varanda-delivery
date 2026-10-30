import { prisma } from "../../lib/prisma.js";

class StatusRefrigerante {
  private inicioDoDiaBrasil(): Date {
    const agora = new Date();

    const partes = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(agora);

    const valores = Object.fromEntries(
      partes.map((parte) => [parte.type, parte.value]),
    );

    const ano = Number(valores.year);
    const mes = Number(valores.month);
    const dia = Number(valores.day);

    // Meia-noite no horário de Brasília (UTC-3).
    return new Date(Date.UTC(ano, mes - 1, dia, 3, 0, 0));
  }

  async marcarComoAcabou(id: string) {
    return prisma.refrigerante.update({
      where: { id },
      data: {
        acabouEm: new Date(),
      },
    });
  }

  async marcarComoAtivo(id: string) {
    return prisma.refrigerante.update({
      where: { id },
      data: {
        acabouEm: null,
      },
    });
  }

  async buscarPorNome(nome: string) {
    return prisma.refrigerante.findFirst({
      where: {
        nome: {
          equals: nome.trim(),
          mode: "insensitive",
        },
      },
    });
  }

  async desativarPorNome(nome: string) {
    const refrigerante = await this.buscarPorNome(nome);

    if (!refrigerante) {
      return null;
    }

    return this.marcarComoAcabou(refrigerante.id);
  }

  async reativarAcabadosDeDiasAnteriores() {
    const inicioDoDia = this.inicioDoDiaBrasil();

    return prisma.refrigerante.updateMany({
      where: {
        acabouEm: {
          lt: inicioDoDia,
        },
      },
      data: {
        acabouEm: null,
      },
    });
  }

  async listar() {
    await this.reativarAcabadosDeDiasAnteriores();

    return prisma.refrigerante.findMany({
      orderBy: {
        nome: "asc",
      },
    });
  }

  async listarDisponiveis() {
    await this.reativarAcabadosDeDiasAnteriores();

    return prisma.refrigerante.findMany({
      where: {
        acabouEm: null,
      },
      orderBy: {
        nome: "asc",
      },
    });
  }
}

export default new StatusRefrigerante();
