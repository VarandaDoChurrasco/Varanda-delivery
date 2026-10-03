import { prisma } from "../../lib/prisma.js";

interface CriarCarrinhoItemData {
  carrinhoId: string;
  tamanhoQuentinhaId: string;
  quantidade: number;
  observacao?: string;
}

class CreateCartItemService {
  async execute(dados: CriarCarrinhoItemData) {
    if (
      !dados ||
      !dados.carrinhoId ||
      !dados.tamanhoQuentinhaId ||
      dados.quantidade === undefined
    ) {
      throw new Error(
        "Envie os dados obrigatórios (carrinhoId, tamanhoQuentinhaId, quantidade)",
      );
    }

    if (!Number.isInteger(dados.quantidade) || dados.quantidade <= 0) {
      throw new Error(
        "A quantidade deve ser um número inteiro maior que zero.",
      );
    }

    // 1. Verifica o carrinho
    const carrinho = await prisma.carrinho.findUnique({
      where: {
        id: dados.carrinhoId,
      },
    });

    if (!carrinho) {
      throw new Error("Carrinho não encontrado.");
    }

    // 2. Verifica se o carrinho está aberto
    if (carrinho.status !== "ABERTO") {
      throw new Error("Este carrinho não está aberto.");
    }

    // 3. Busca o cardápio de hoje
    const agora = new Date();

    const inicioDoDia = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate(),
    );

    const fimDoDia = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate() + 1,
    );

    const cardapio = await prisma.cardapio.findFirst({
      where: {
        data: {
          gte: inicioDoDia,
          lt: fimDoDia,
        },
        ativo: true,
      },
    });

    if (!cardapio) {
      throw new Error("Não existe cardápio disponível para hoje.");
    }

    // 4. Busca o tamanho no cardápio do dia
    const tamanho = await prisma.tamanhoQuentinha.findUnique({
      where: {
        id: dados.tamanhoQuentinhaId,
      },
    });

    if (!tamanho) {
      throw new Error("Tamanho de quentinha não encontrado.");
    }

    if (!tamanho.ativo) {
      throw new Error("Este tamanho de quentinha está inativo.");
    }
    // 5. Cria o item no carrinho com o preço do cardápio
    const carrinhoItem = await prisma.carrinhoItem.create({
      data: {
        carrinhoId: dados.carrinhoId,
        tamanhoId: dados.tamanhoQuentinhaId,
        quantidade: dados.quantidade,
        precoUnitario: tamanho.preco,
        observacao: dados.observacao,
      },
      include: {
        escolhas: true,
        adicionais: true,
        remocoes: true,
      },
    });

    return carrinhoItem;
  }
}

export { CreateCartItemService };
