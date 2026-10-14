import { prisma } from "../../lib/prisma.js";
import {
  TipoOpcaoQuentinha,
  PeriodoCardapio,
  TipoProduto,
} from "@prisma/client";

import type { ProdutoExtraido } from "./extrairCardapioDaImagem.service.js";

class CadastrarCardapioService {
  async execute() {
    return prisma.$transaction(async (tx) => {
      const pendente = await tx.cardapioPendente.findFirst();

      if (!pendente) {
        throw new Error("Nenhum cardápio pendente para cadastrar.");
      }

      const contexto = this.obterDataHoraBrasilia();
      const hoje = contexto.data;
      const periodo =
        contexto.hora < 15 ? PeriodoCardapio.ALMOCO : PeriodoCardapio.NOITE;

      const acompanhamentos = this.normalizarLista(pendente.acompanhamentos);

      const proteinas = this.normalizarLista(pendente.proteinas);

      const saladas = this.normalizarLista(pendente.saladas);

      const produtos = this.normalizarProdutos(pendente.produtos);

      // Valida o conteúdo antes de modificar o cardápio existente.
      if (periodo === PeriodoCardapio.ALMOCO) {
        const totalOpcoes =
          acompanhamentos.length + proteinas.length + saladas.length;

        if (totalOpcoes === 0) {
          throw new Error(
            "O cardápio de almoço não possui opções de quentinha.",
          );
        }
      } else {
        if (produtos.length === 0) {
          throw new Error(
            "O cardápio noturno não possui produtos individuais.",
          );
        }

        const produtoSemPreco = produtos.find(
          (produto) => produto.preco === null,
        );

        if (produtoSemPreco) {
          throw new Error(
            `O produto "${produtoSemPreco.nome}" está sem preço. ` +
              "Revise o cardápio pendente antes de aprovar.",
          );
        }
      }

      const cardapio = await tx.cardapio.upsert({
        where: {
          data_periodo: {
            data: hoje,
            periodo,
          },
        },
        update: {
          ativo: true,
        },
        create: {
          data: hoje,
          periodo,
          ativo: true,
        },
      });

      // Remove somente os vínculos do cardápio deste período.
      // Os produtos e o histórico de pedidos não são apagados.
      await tx.cardapioOpcaoQuentinha.deleteMany({
        where: {
          cardapioId: cardapio.id,
        },
      });

      await tx.cardapioItem.deleteMany({
        where: {
          cardapioId: cardapio.id,
        },
      });

      if (periodo === PeriodoCardapio.ALMOCO) {
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
              disponivel: true,
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
      } else {
        for (let i = 0; i < produtos.length; i++) {
          const produtoExtraido = produtos[i];

          // A validação acima garante que o preço não seja null.
          const preco = produtoExtraido.preco!;

          const produto = await tx.produto.upsert({
            where: {
              nome: produtoExtraido.nome,
            },
            update: {
              descricao: produtoExtraido.descricao,
              preco,
              tipo: TipoProduto.SIMPLES,
              ativo: true,
              disponivel: true,
            },
            create: {
              nome: produtoExtraido.nome,
              descricao: produtoExtraido.descricao,
              preco,
              tipo: TipoProduto.SIMPLES,
              ativo: true,
              disponivel: true,
            },
          });

          await tx.cardapioItem.create({
            data: {
              cardapioId: cardapio.id,
              produtoId: produto.id,
              preco: produtoExtraido.preco!,
              disponivel: true,
              ordem: i,
            },
          });
        }
      }

      // Só remove o pendente depois de concluir o cadastro.
      await tx.cardapioPendente.delete({
        where: {
          id: pendente.id,
        },
      });

      return {
        cardapioId: cardapio.id,
        data: hoje,
        periodo,
        produtos: periodo === PeriodoCardapio.NOITE ? produtos : [],
        acompanhamentos:
          periodo === PeriodoCardapio.ALMOCO ? acompanhamentos : [],
        proteinas: periodo === PeriodoCardapio.ALMOCO ? proteinas : [],
        saladas: periodo === PeriodoCardapio.ALMOCO ? saladas : [],
      };
    });
  }

  private normalizarLista(valor: unknown): string[] {
    if (!Array.isArray(valor)) {
      return [];
    }

    return [
      ...new Set(
        valor
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    ];
  }

  private normalizarProdutos(valor: unknown): ProdutoExtraido[] {
    if (!Array.isArray(valor)) {
      return [];
    }

    const produtos = valor
      .filter(
        (item): item is Record<string, unknown> =>
          typeof item === "object" &&
          item !== null &&
          !Array.isArray(item) &&
          typeof (item as Record<string, unknown>).nome === "string",
      )
      .map((item) => ({
        nome: (item.nome as string).trim(),
        preco:
          typeof item.preco === "number" &&
          Number.isFinite(item.preco) &&
          item.preco >= 0
            ? item.preco
            : null,
        descricao:
          typeof item.descricao === "string" && item.descricao.trim()
            ? item.descricao.trim()
            : null,
      }))
      .filter((produto) => produto.nome.length > 0);

    // Evita cadastrar o mesmo produto duas vezes no mesmo menu.
    const unicos = new Map<string, ProdutoExtraido>();

    for (const produto of produtos) {
      unicos.set(produto.nome.toLocaleLowerCase("pt-BR"), produto);
    }

    return [...unicos.values()];
  }

  private obterDataHoraBrasilia(): {
    data: Date;
    hora: number;
  } {
    const partes = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date());

    const obterParte = (tipo: string) =>
      partes.find((parte) => parte.type === tipo)?.value ?? "";

    const ano = Number(obterParte("year"));
    const mes = Number(obterParte("month"));
    const dia = Number(obterParte("day"));
    const hora = Number(obterParte("hour"));

    if (
      !ano ||
      !mes ||
      !dia ||
      !Number.isInteger(hora) ||
      hora < 0 ||
      hora > 23
    ) {
      throw new Error(
        "Não foi possível determinar a data e o horário de Brasília.",
      );
    }

    return {
      data: new Date(Date.UTC(ano, mes - 1, dia)),
      hora,
    };
  }
}

export { CadastrarCardapioService };

/*import { prisma } from "../../lib/prisma.js";
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

export { CadastrarCardapioService };*/
