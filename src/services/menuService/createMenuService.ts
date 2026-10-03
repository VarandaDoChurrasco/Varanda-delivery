import { prisma } from "../../lib/prisma.js";
import { CardapioCreateRequest } from "../../type/type.js";

class CreateCardapioService {
  async execulte(dados: CardapioCreateRequest) {
    if (!dados || !dados.data) {
      throw new Error("Informe a data do cardápio.");
    }

    if (!Array.isArray(dados.opcoes) || dados.opcoes.length === 0) {
      throw new Error("Informe ao menos uma opção para o cardápio.");
    }

    // Valida o formato da data
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dados.data)) {
      throw new Error("Informe a data no formato YYYY-MM-DD.");
    }

    const data = new Date(`${dados.data}T00:00:00.000Z`);

    if (
      isNaN(data.getTime()) ||
      data.toISOString().slice(0, 10) !== dados.data
    ) {
      throw new Error("Data do cardápio inválida.");
    }

    // Verifica se já existe cardápio nessa data
    const cardapioExistente = await prisma.cardapio.findUnique({
      where: { data },
    });

    if (cardapioExistente) {
      throw new Error("Já existe um cardápio para esta data.");
    }

    // Verifica se há IDs repetidos
    const ids = dados.opcoes.map((item) => item.opcaoId);

    if (ids.some((id) => !id) || new Set(ids).size !== ids.length) {
      throw new Error(
        "As opções devem possuir IDs válidos e não podem se repetir.",
      );
    }

    // Busca as opções cadastradas
    const opcoesExistentes = await prisma.opcaoQuentinha.findMany({
      where: {
        id: { in: ids },
      },
    });

    if (opcoesExistentes.length !== ids.length) {
      throw new Error("Uma ou mais opções não foram encontradas.");
    }

    // Verifica se as opções estão ativas e disponíveis
    const opcaoIndisponivel = opcoesExistentes.find(
      (opcao) => !opcao.ativo || !opcao.disponivel,
    );

    if (opcaoIndisponivel) {
      throw new Error(
        `A opção "${opcaoIndisponivel.nome}" está inativa ou indisponível.`,
      );
    }

    // Cria o cardápio e vincula as opções
    const cardapio = await prisma.cardapio.create({
      data: {
        data,
        cardapioOpcaoQuentinhas: {
          create: dados.opcoes.map((item, index) => {
            const opcao = opcoesExistentes.find(
              (opcao) => opcao.id === item.opcaoId,
            )!;

            return {
              opcaoId: opcao.id,
              tipo: opcao.tipo,
              ordem: item.ordem ?? index,
              disponivel: true,
            };
          }),
        },
      },
      include: {
        cardapioOpcaoQuentinhas: {
          include: {
            opcao: true,
          },
          orderBy: {
            ordem: "asc",
          },
        },
      },
    });

    return cardapio;
  }
}

export { CreateCardapioService };
