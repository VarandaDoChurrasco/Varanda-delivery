import { RemoverCarrinhoRefrigeranteService } from "../../refrigente/removerCarrinhoRefrigeranteService.js";

const removerCarrinhoRefrigeranteService =
  new RemoverCarrinhoRefrigeranteService();

export const removerRefrigeranteCarrinhoTool = {
  type: "function" as const,

  function: {
    name: "remover_refrigerante_carrinho",

    description:
      "Remove um refrigerante inteiro do carrinho aberto. Use somente quando o cliente pedir explicitamente para remover, excluir ou tirar o refrigerante. Não use apenas porque o refrigerante já está no carrinho.",

    parameters: {
      type: "object",

      properties: {
        carrinhoId: {
          type: "string",
          description: "ID do carrinho aberto do cliente.",
        },

        refrigeranteId: {
          type: "string",
          description: "ID real do refrigerante que está no carrinho.",
        },
      },

      required: ["carrinhoId", "refrigeranteId"],

      additionalProperties: false,
    },
  },
};

export async function executarRemoverRefrigeranteCarrinho(args: {
  carrinhoId: string;
  refrigeranteId: string;
}) {
  return await removerCarrinhoRefrigeranteService.execute({
    carrinhoId: args.carrinhoId,
    refrigeranteId: args.refrigeranteId,
  });
}
