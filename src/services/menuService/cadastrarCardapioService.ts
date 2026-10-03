import { prisma } from "../../lib/prisma.js";
import { TipoOpcaoQuentinha } from "@prisma/client";

class CadastrarCardapioService {
  async execute() {
    return prisma.$transaction(async (tx) => {
      const pendente = await tx.cardapioPendente.findFirst();

      if (!pendente) {
        throw new Error("Nenhum cardápio pendente para cadastrar.");
      }

      const acompanhamentos = this.normalizarLista(pendente.acompanhamentos);

      const proteinas = this.normalizarLista(pendente.proteinas);

      const saladas = this.normalizarLista(pendente.saladas);

      const hoje = this.obterDataHoje();

      const cardapio = await tx.cardapio.upsert({
        where: {
          data: hoje,
        },
        update: {
          ativo: true,
        },
        create: {
          data: hoje,
          ativo: true,
        },
      });

      // Remove somente as opções do cardápio atual.
      await tx.cardapioOpcaoQuentinha.deleteMany({
        where: {
          cardapioId: cardapio.id,
        },
      });

      const opcoes = [
        ...acompanhamentos.map((nome) => ({
          nome,
          tipo: TipoOpcaoQuentinha.ACOMPANHAMENTO,
        })),

        ...proteinas.map((nome) => ({
          nome,
          tipo: TipoOpcaoQuentinha.PROTEINA,
        })),

        ...saladas.map((nome) => ({
          nome,
          tipo: TipoOpcaoQuentinha.SALADA,
        })),
      ];

      for (let i = 0; i < opcoes.length; i++) {
        const opcao = opcoes[i];

        const opcaoQuentinha = await tx.opcaoQuentinha.upsert({
          where: {
            nome: opcao.nome,
          },
          update: {
            tipo: opcao.tipo,
            ativo: true,
          },
          create: {
            nome: opcao.nome,
            tipo: opcao.tipo,
            ativo: true,
            disponivel: true,
          },
        });

        await tx.cardapioOpcaoQuentinha.create({
          data: {
            cardapioId: cardapio.id,
            opcaoId: opcaoQuentinha.id,
            tipo: opcao.tipo,
            disponivel: true,
            ordem: i,
          },
        });
      }

      await tx.cardapioPendente.delete({
        where: {
          id: pendente.id,
        },
      });

      return {
        cardapioId: cardapio.id,
        data: hoje,
        acompanhamentos,
        proteinas,
        saladas,
      };
    });
  }

  private normalizarLista(valor: unknown): string[] {
    if (!Array.isArray(valor)) {
      return [];
    }

    return valor
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private obterDataHoje(): Date {
    const agora = new Date();

    const partes = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(agora);

    const ano = partes.find((p) => p.type === "year")?.value;
    const mes = partes.find((p) => p.type === "month")?.value;
    const dia = partes.find((p) => p.type === "day")?.value;

    if (!ano || !mes || !dia) {
      throw new Error("Não foi possível determinar a data atual.");
    }

    return new Date(`${ano}-${mes}-${dia}T00:00:00.000Z`);
  }
}

export { CadastrarCardapioService };
