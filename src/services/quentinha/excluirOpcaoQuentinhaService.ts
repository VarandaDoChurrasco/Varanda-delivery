import { prisma } from "../../lib/prisma.js";
import { PeriodoCardapio } from "@prisma/client";

export class ExcluirOpcaoQuentinhaService {
  async executar(nome: string) {
    const nomeItem = nome.trim();

    if (!nomeItem) {
      throw new Error("Informe o nome do item.");
    }

    const agora = new Date();

    const dataLocal = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(agora);

    const [ano, mes, dia] = dataLocal.split("-").map(Number);
    const hoje = new Date(Date.UTC(ano, mes - 1, dia));

    const hora = Number(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "America/Sao_Paulo",
        hour: "2-digit",
        hourCycle: "h23",
      }).format(agora),
    );

    const periodo = hora >= 15 ? PeriodoCardapio.NOITE : PeriodoCardapio.ALMOCO;

    const cardapio = await prisma.cardapio.findFirst({
      where: {
        data: hoje,
        periodo,
        ativo: true,
      },
    });

    if (!cardapio) {
      throw new Error("Não existe cardápio ativo para este período.");
    }

    // Procura nas opções de montagem da quentinha ou jantinha
    const opcao = await prisma.opcaoQuentinha.findFirst({
      where: {
        nome: {
          equals: nomeItem,
          mode: "insensitive",
        },
      },
    });

    if (opcao) {
      const vinculo = await prisma.cardapioOpcaoQuentinha.findFirst({
        where: {
          cardapioId: cardapio.id,
          opcaoId: opcao.id,
          disponivel: true,
        },
      });

      if (vinculo) {
        await prisma.cardapioOpcaoQuentinha.update({
          where: {
            id: vinculo.id,
          },
          data: {
            disponivel: false,
          },
        });

        return {
          id: opcao.id,
          nome: opcao.nome,
          tipo: "OPCAO",
          periodo,
        };
      }
    }

    // Procura nos produtos individuais da noite
    const produto = await prisma.produto.findFirst({
      where: {
        nome: {
          equals: nomeItem,
          mode: "insensitive",
        },
      },
    });

    if (produto) {
      const vinculo = await prisma.cardapioItem.findFirst({
        where: {
          cardapioId: cardapio.id,
          produtoId: produto.id,
          disponivel: true,
        },
      });

      if (vinculo) {
        await prisma.cardapioItem.update({
          where: {
            id: vinculo.id,
          },
          data: {
            disponivel: false,
          },
        });

        return {
          id: produto.id,
          nome: produto.nome,
          tipo: "PRODUTO",
          periodo,
        };
      }
    }

    throw new Error("Item não encontrado no cardápio ativo.");
  }
}
