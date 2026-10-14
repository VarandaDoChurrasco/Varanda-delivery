import { CreateProductCartItemService } from "../../carService/createProductCartItemService.js";

const createProductCartItemService = new CreateProductCartItemService();

export const adicionarProdutoTool = {
  type: "function" as const,
  function: {
    name: "adicionar_produto",
    description:
      "Adiciona um produto individual do cardápio noturno ao carrinho aberto. " +
      "Use para espaguete, lasanha, sopas, batata recheada e outros produtos individuais. " +
      "Consulte primeiro consultar_cardapio e use o ID real do produto retornado. " +
      "Não use esta ferramenta para quentinhas.",
    parameters: {
      type: "object",
      properties: {
        carrinhoId: {
          type: "string",
          description: "ID real do carrinho aberto.",
        },
        produtoId: {
          type: "string",
          description: "ID real do produto retornado pelo consultar_cardapio.",
        },
        quantidade: {
          type: "integer",
          minimum: 1,
          description: "Quantidade do produto.",
        },
        observacao: {
          type: "string",
          description: "Observação opcional do cliente.",
        },
      },
      required: ["carrinhoId", "produtoId", "quantidade"],
      additionalProperties: false,
    },
  },
};

export async function executarAdicionarProduto(args: {
  carrinhoId: string;
  produtoId: string;
  quantidade: number;
  observacao?: string;
}) {
  const item = await createProductCartItemService.execute(args);

  return {
    sucesso: true,
    carrinhoItemId: item.id,
    carrinhoId: item.carrinhoId,
    produtoId: item.produtoId,
    produtoNome: item.produtoNome,
    quantidade: item.quantidade,
    precoUnitario: Number(item.precoUnitario),
    subtotal: Number(item.precoUnitario) * item.quantidade,
  };
}
