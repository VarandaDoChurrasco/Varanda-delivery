import { calculateCartService } from "../../carService/calculateCartService.js";

const checkoutService = new calculateCartService();

export const calcularCheckoutTool = {
  type: "function" as const,

  function: {
    name: "calcular_checkout",

    description:
      "Calcula o valor final do carrinho antes da criação do pedido. Deve ser usada quando o cliente terminar de montar o pedido e antes de criar o pedido.",

    parameters: {
      type: "object",

      properties: {
        carrinhoId: {
          type: "string",
          description: "ID do carrinho aberto.",
        },

        tipo: {
          type: "string",
          enum: ["DELIVERY", "RETIRADA"],
          description:
            "Tipo do pedido. DELIVERY para entrega ou RETIRADA para buscar no estabelecimento.",
        },

        bairroId: {
          type: "string",
          description: "ID do bairro. Obrigatório para pedidos DELIVERY.",
        },
      },

      required: ["carrinhoId", "tipo"],

      additionalProperties: false,
    },
  },
};

export async function executarCalcularCheckout(args: {
  carrinhoId: string;
  tipo: "DELIVERY" | "RETIRADA";
  bairroId?: string;
}) {
  const resultado = await checkoutService.execute({
    carrinhoId: args.carrinhoId,
    tipo: args.tipo,
    bairroId: args.bairroId,
  });

  return resultado;
}
