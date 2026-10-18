import { CreateJantinhaCartItemService } from "../../carService/createJantinhaCartItemService.js";

const service = new CreateJantinhaCartItemService();

export const adicionarJantinhaTool = {
  type: "function" as const,

  function: {
    name: "adicionar_jantinha",

    description:
      "Adiciona uma jantinha P ou M ao carrinho. Use somente o produtoId retornado por consultar_cardapio para Jantinha P ou Jantinha M. Disponível no período NOITE.",

    parameters: {
      type: "object",

      properties: {
        carrinhoId: {
          type: "string",
          description: "ID do carrinho aberto.",
        },

        produtoId: {
          type: "string",
          description:
            "ID da Jantinha P ou Jantinha M retornado pelo cardápio.",
        },

        quantidade: {
          type: "integer",
          minimum: 1,
          description: "Quantidade de jantinhas.",
        },

        observacao: {
          type: "string",
          description: "Observação opcional.",
        },
      },

      required: ["carrinhoId", "produtoId", "quantidade"],

      additionalProperties: false,
    },
  },
};

export async function executarAdicionarJantinha(args: {
  carrinhoId: string;
  produtoId: string;
  quantidade: number;
  observacao?: string;
}) {
  const item = await service.execute(args);

  return {
    sucesso: true,
    carrinhoItemId: item.id,
    carrinhoId: item.carrinhoId,
    produtoId: item.produtoId,
    quantidade: item.quantidade,
    precoUnitario: Number(item.precoUnitario),
    escolhas: item.escolhas,
    adicionais: item.adicionais,
    remocoes: item.remocoes,
  };
}
