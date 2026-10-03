import { AdicionarRefrigeranteCarrinhoService } from "../../refrigente/adicionarRefrigeranteCarrinhoService.js";

const adicionarRefrigeranteService = new AdicionarRefrigeranteCarrinhoService();

export const adicionarRefrigeranteTool = {
  type: "function" as const,

  function: {
    name: "adicionar_refrigerante",

    description:
      "Adiciona um refrigerante ao carrinho aberto do cliente. Use somente o refrigeranteId real retornado pela ferramenta consultar_refrigerantes. O preço é obtido diretamente do banco.",

    parameters: {
      type: "object",

      properties: {
        carrinhoId: {
          type: "string",
          description: "ID do carrinho aberto do cliente.",
        },

        refrigeranteId: {
          type: "string",
          description:
            "ID real do refrigerante retornado pela consultar_refrigerantes.",
        },

        quantidade: {
          type: "integer",
          minimum: 1,
          description: "Quantidade de refrigerantes.",
        },
      },

      required: ["carrinhoId", "refrigeranteId", "quantidade"],

      additionalProperties: false,
    },
  },
};

export async function executarAdicionarRefrigerante(args: {
  carrinhoId: string;
  refrigeranteId: string;
  quantidade: number;
}) {
  const item = await adicionarRefrigeranteService.execute({
    carrinhoId: args.carrinhoId,
    refrigeranteId: args.refrigeranteId,
    quantidade: args.quantidade,
  });

  return {
    sucesso: true,
    carrinhoRefrigeranteId: item.id,
    carrinhoId: item.carrinhoId,
    refrigeranteId: item.refrigeranteId,
    nome: item.refrigerante.nome,
    quantidade: item.quantidade,
    precoUnitario: Number(item.precoUnitario),
    subtotal: Number(item.precoUnitario) * item.quantidade,
  };
}
