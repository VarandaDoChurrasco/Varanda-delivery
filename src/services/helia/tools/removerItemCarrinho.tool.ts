import { DeleteCartItemService } from "../../carService/DeleteCartItemService.js";

const deleteCartItemService = new DeleteCartItemService();

export const removerItemCarrinhoTool = {
  type: "function" as const,

  function: {
    name: "remover_item_carrinho",

    description:
      "Remove uma quentinha inteira do carrinho aberto. Use somente quando o cliente pedir explicitamente para remover, excluir, tirar ou cancelar uma quentinha inteira. Não use para remover apenas um ingrediente, proteína, acompanhamento ou salada.",

    parameters: {
      type: "object",

      properties: {
        carrinhoItemId: {
          type: "string",
          description:
            "ID exato do item da quentinha no carrinho, obtido através da consulta ao carrinho.",
        },
      },

      required: ["carrinhoItemId"],

      additionalProperties: false,
    },
  },
};

export async function executarRemoverItemCarrinho(args: {
  carrinhoItemId: string;
}) {
  const item = await deleteCartItemService.execute(args.carrinhoItemId);

  return {
    sucesso: true,
    carrinhoItemId: item.id,
    mensagem: "Quentinha removida do carrinho.",
  };
}
