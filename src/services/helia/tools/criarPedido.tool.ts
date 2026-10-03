import { createPedidoService } from "../../orderService/createOrderService.js";

const pedidoService = new createPedidoService();

export const criarPedidoTool = {
  type: "function" as const,

  function: {
    name: "criar_pedido",

    description:
      "Cria o pedido depois que o cliente terminou de montar o carrinho, escolheu a forma de pagamento e todas as informações necessárias foram preenchidas. O pedido será criado como AGUARDANDO_CONFIRMACAO. Só use esta ferramenta depois que o cliente tiver concordado com o resumo final do pedido.",

    parameters: {
      type: "object",

      properties: {
        carrinhoId: {
          type: "string",
          description: "ID do carrinho aberto do cliente.",
        },

        tipo: {
          type: "string",
          enum: ["DELIVERY", "RETIRADA"],
          description:
            "Tipo do pedido. DELIVERY para entrega ou RETIRADA para buscar no estabelecimento.",
        },

        formaPagamento: {
          type: "string",
          enum: ["PIX", "DINHEIRO", "DEBITO", "CREDITO"],
          description: "Forma de pagamento escolhida pelo cliente.",
        },

        bairroId: {
          type: "string",
          description:
            "ID do bairro para DELIVERY. Não informar para RETIRADA.",
        },

        endereco: {
          type: "string",
          description:
            "Endereço completo para entrega. Obrigatório para DELIVERY.",
        },

        complemento: {
          type: "string",
          description: "Complemento do endereço, se houver.",
        },

        referencia: {
          type: "string",
          description: "Ponto de referência para entrega, se houver.",
        },

        trocoPara: {
          type: "number",
          description:
            "Valor em dinheiro que o cliente entregará para receber troco. Obrigatório quando a forma de pagamento for DINHEIRO.",
        },
      },

      required: ["carrinhoId", "tipo", "formaPagamento"],

      additionalProperties: false,
    },
  },
};

{
  /*export async function executarCriarPedido(args: {
  carrinhoId: string;
  tipo: "DELIVERY" | "RETIRADA";
  formaPagamento: "PIX" | "DINHEIRO" | "DEBITO" | "CREDITO";
  bairroId?: string;
  endereco?: string;
  complemento?: string;
  referencia?: string;
  trocoPara?: number;
}) {
  const pedido = (await pedidoService.execute({
    carrinhoId: args.carrinhoId,
    tipo: args.tipo,
    formaPagamento: args.formaPagamento,
    bairroId: args.bairroId,
    endereco: args.endereco,
    complemento: args.complemento,
    referencia: args.referencia,
    trocoPara: args.trocoPara,
  })) as {
    id: string;
    numero: number | string;
    status: string;
    tipo: string;
    subtotal: number | string;
    taxaEntrega: number | string;
    total: number | string;
    formaPagamento: string;
    trocoPara: number | string | null;
    endereco?: string | null;
    complemento?: string | null;
    referencia?: string | null;
    bairro?: { id: string; nome: string } | null;
    itens?: unknown[];
  } | void;

  if (!pedido) {
    return {
      sucesso: false,
      mensagem: "Pedido não foi criado.",
    };
  }

  return {
    sucesso: true,
    pedidoId: pedido.id,
    numero: Number(pedido.numero),
    status: pedido.status,
    tipo: pedido.tipo,
    subtotal: Number(pedido.subtotal),
    taxaEntrega: Number(pedido.taxaEntrega),
    total: Number(pedido.total),
    formaPagamento: pedido.formaPagamento,
    trocoPara: pedido.trocoPara !== null ? Number(pedido.trocoPara) : null,
    endereco: pedido.endereco,
    complemento: pedido.complemento,
    referencia: pedido.referencia,
    bairro: pedido.bairro
      ? {
          id: pedido.bairro.id,
          nome: pedido.bairro.nome,
        }
      : null,
    itens: pedido.itens,
  };
}*/
}

export async function executarCriarPedido(args: {
  carrinhoId: string;
  tipo: "DELIVERY" | "RETIRADA";
  formaPagamento: "PIX" | "DINHEIRO" | "DEBITO" | "CREDITO";
  bairroId?: string;
  endereco?: string;
  complemento?: string;
  referencia?: string;
  trocoPara?: number;
}) {
  const pedido = await pedidoService.execute({
    carrinhoId: args.carrinhoId,
    tipo: args.tipo,
    formaPagamento: args.formaPagamento,
    bairroId: args.bairroId,
    endereco: args.endereco,
    complemento: args.complemento,
    referencia: args.referencia,
    trocoPara: args.trocoPara,
  });

  if (!pedido) {
    return {
      sucesso: false,
      mensagem: "Pedido não foi criado.",
    };
  }

  return {
    sucesso: true,
    pedidoId: pedido.id,
    numero: Number(pedido.numero),
    status: pedido.status,
    tipo: pedido.tipo,
    subtotal: Number(pedido.subtotal),
    taxaEntrega: Number(pedido.taxaEntrega),
    total: Number(pedido.total),
    formaPagamento: pedido.formaPagamento,
    trocoPara: pedido.trocoPara !== null ? Number(pedido.trocoPara) : null,

    troco:
      pedido.trocoPara !== null
        ? Number(pedido.trocoPara) - Number(pedido.total)
        : null,
    // trocoPara: pedido.trocoPara !== null ? Number(pedido.trocoPara) : null,
    endereco: pedido.endereco,
    complemento: pedido.complemento,
    referencia: pedido.referencia,
    bairro: pedido.bairro
      ? {
          id: pedido.bairro.id,
          nome: pedido.bairro.nome,
        }
      : null,
    itens: pedido.itens,
  };
}
