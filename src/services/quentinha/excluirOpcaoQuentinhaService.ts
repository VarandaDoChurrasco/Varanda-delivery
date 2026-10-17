// src/services/quentinha/excluirOpcaoQuentinhaService.ts
import { prisma } from "../../lib/prisma.js";

export class ExcluirOpcaoQuentinhaService {
  async executar(nome: string) {
    const opcao = await prisma.opcaoQuentinha.findUnique({
      where: { nome },
    });

    if (!opcao) {
      throw new Error("Opção não encontrada");
    }

    if (!opcao.ativo) {
      throw new Error("Opção já está desativada");
    }

    // Verifica vínculos com cardápios (usa o id que veio do banco)
    const vinculos = await prisma.cardapioOpcaoQuentinha.count({
      where: { opcaoId: opcao.id },
    });

    // Soft delete
    const opcaoDesativada = await prisma.opcaoQuentinha.update({
      where: { id: opcao.id },
      data: { ativo: false },
    });

    return {
      ...opcaoDesativada,
      tinhaVinculos: vinculos > 0,
      quantidadeVinculos: vinculos,
    };
  }
}
