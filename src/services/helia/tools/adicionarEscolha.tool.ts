import { CarrinhoItemEscolhaService } from "../../quentinha/itemCarrinhoQuentinhaService.js";

const escolhaService = new CarrinhoItemEscolhaService();

export const adicionarEscolhaTool = {
  type: "function" as const,

  function: {
    name: "adicionar_escolha",

    description:
      "Adiciona uma escolha a uma quentinha específica do carrinho. Pode ser proteína, acompanhamento ou salada. Use somente opções que foram retornadas pelo consultar_cardapio.",

    parameters: {
      type: "object",

      properties: {
        carrinhoItemId: {
          type: "string",
          description: "ID da quentinha específica no carrinho.",
        },

        tipo: {
          type: "string",
          enum: ["PROTEINA", "ACOMPANHAMENTO", "SALADA"],
          description: "Tipo da escolha que será adicionada.",
        },

        nome: {
          type: "string",
          description: "Nome exato da opção retornada pelo consultar_cardapio.",
        },

        opcaoId: {
          type: "string",
          description: "ID da opção retornado pelo consultar_cardapio.",
        },
      },

      required: ["carrinhoItemId", "tipo", "nome", "opcaoId"],

      additionalProperties: false,
    },
  },
};

export async function executarAdicionarEscolha(args: {
  carrinhoItemId: string;
  tipo: "PROTEINA" | "ACOMPANHAMENTO" | "SALADA";
  nome: string;
  opcaoId: string;
}) {
  const escolha = await escolhaService.criar({
    carrinhoItemId: args.carrinhoItemId,
    tipo: args.tipo,
    nome: args.nome,
    opcaoId: args.opcaoId,
  });

  return {
    sucesso: true,
    escolhaId: escolha.id,
    carrinhoItemId: escolha.carrinhoItemId,
    tipo: escolha.tipo,
    nome: escolha.nome,
    opcaoId: escolha.opcaoId,
  };
}
