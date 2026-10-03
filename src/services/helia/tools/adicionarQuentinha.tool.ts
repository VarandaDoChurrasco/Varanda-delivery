import { CreateCartItemService } from "../../carService/createitemCartService.js";

const createCartItemService = new CreateCartItemService();

export const adicionarQuentinhaTool = {
  type: "function" as const,

  function: {
    name: "adicionar_quentinha",

    description:
      "Adiciona uma quentinha ao carrinho aberto do cliente. Use o tamanhoQuentinhaId retornado pelo consultar_cardapio. Cada CarrinhoItem representa uma quentinha.",

    parameters: {
      type: "object",

      properties: {
        carrinhoId: {
          type: "string",
          description: "ID do carrinho aberto do cliente.",
        },

        tamanhoQuentinhaId: {
          type: "string",
          description:
            "ID real do tamanho da quentinha retornado pelo consultar_cardapio.",
        },

        quantidade: {
          type: "integer",
          minimum: 1,
          description: "Quantidade de quentinhas desse mesmo tamanho.",
        },

        observacao: {
          type: "string",
          description: "Observação opcional relacionada à quentinha.",
        },
      },

      required: ["carrinhoId", "tamanhoQuentinhaId", "quantidade"],

      additionalProperties: false,
    },
  },
};

export async function executarAdicionarQuentinha(args: {
  carrinhoId: string;
  tamanhoQuentinhaId: string;
  quantidade: number;
  observacao?: string;
}) {
  const item = await createCartItemService.execute({
    carrinhoId: args.carrinhoId,
    tamanhoQuentinhaId: args.tamanhoQuentinhaId,
    quantidade: args.quantidade,
    observacao: args.observacao,
  });

  return {
    sucesso: true,
    carrinhoItemId: item.id,
    carrinhoId: item.carrinhoId,
    tamanhoQuentinhaId: item.tamanhoId,
    quantidade: item.quantidade,
    precoUnitario: Number(item.precoUnitario),
    escolhas: item.escolhas,
    adicionais: item.adicionais,
    remocoes: item.remocoes,
  };
}
