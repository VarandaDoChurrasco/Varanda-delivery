import { createCartService } from "../../carService/createCarService.js";

const cartService = new createCartService();

export const obterCarrinhoTool = {
  type: "function" as const,

  function: {
    name: "obter_carrinho",

    description:
      "Obtém o carrinho aberto do cliente. Se o cliente já tiver um carrinho ABERTO, reutiliza esse carrinho. Caso não tenha, cria um novo.",

    parameters: {
      type: "object",

      properties: {
        clienteId: {
          type: "string",
          description: "ID do cliente obtido pela ferramenta obter_cliente.",
        },
      },

      required: ["clienteId"],

      additionalProperties: false,
    },
  },
};

export async function executarObterCarrinho(args: { clienteId: string }) {
  if (!args.clienteId) {
    throw new Error("clienteId não informado.");
  }

  const carrinho = await cartService.execulte({
    clienteId: args.clienteId,
  });

  return {
    carrinhoId: carrinho.id,
    status: carrinho.status,
    clienteId: carrinho.clienteId,
    itens: carrinho.itens,
    criadoOuReutilizado: true,
  };
}
