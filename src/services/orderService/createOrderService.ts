import { prisma } from "../../lib/prisma.js";
import { CheckoutRequest } from "../../type/type.js";
import { FormaPagamento } from "@prisma/client";
import { randomUUID } from "crypto"; // ✅ importação explícita

// ==========================================
// NORMALIZAR FORMA DE PAGAMENTO
// ==========================================

function normalizarFormaPagamento(valor: string): FormaPagamento {
  const mapa: Record<string, FormaPagamento> = {
    pix: "PIX",
    dinheiro: "DINHEIRO",
    debito: "DEBITO",
    débito: "DEBITO",
    credito: "CREDITO",
    crédito: "CREDITO",
  };

  const chave = String(valor).toLowerCase().trim();
  const normalizado = mapa[chave];

  if (!normalizado) {
    throw new Error(`Forma de pagamento inválida: ${valor}`);
  }

  return normalizado;
}

class createPedidoService {
  async execute(dados: CheckoutRequest) {
    if (!dados || !dados.carrinhoId || !dados.tipo) {
      throw new Error("Informe o carrinhoId e o tipo do pedido.");
    }

    if (!dados.formaPagamento) {
      throw new Error("Informe a forma de pagamento.");
    }

    if (dados.tipo !== "DELIVERY" && dados.tipo !== "RETIRADA") {
      throw new Error("Tipo de pedido inválido.");
    }

    // ==========================================
    // NORMALIZAR FORMA DE PAGAMENTO (PRIMEIRO!)
    // ==========================================
    const formaPagamento = normalizarFormaPagamento(dados.formaPagamento);

    const carrinho = await prisma.carrinho.findUnique({
      where: {
        id: dados.carrinhoId,
      },
      include: {
        cliente: true,
        itens: {
          include: {
            adicionais: {
              include: {
                adicional: true,
              },
            },
            remocoes: true,
            escolhas: true,
          },
        },

        refrigerantes: {
          include: {
            refrigerante: true,
          },
        },
      },
    });

    if (!carrinho) {
      throw new Error("Carrinho não encontrado.");
    }

    if (carrinho.status !== "ABERTO") {
      throw new Error("Este carrinho não está aberto.");
    }

    if (carrinho.itens.length === 0) {
      throw new Error("O carrinho está vazio.");
    }

    const tamanhoIds = carrinho.itens
      .map((item) => item.tamanhoId)
      .filter((id): id is string => Boolean(id));

    const tamanhos = await prisma.tamanhoQuentinha.findMany({
      where: {
        id: {
          in: tamanhoIds,
        },
      },
    });

    // ==========================================
    // VALIDAR DELIVERY
    // ==========================================

    let taxaEntrega = 0;
    let bairro = null;

    if (dados.tipo === "DELIVERY") {
      if (!dados.bairroId) {
        throw new Error("Informe o bairro para pedidos de delivery.");
      }

      if (!dados.endereco) {
        throw new Error("Informe o endereço para pedidos de delivery.");
      }

      bairro = await prisma.bairro.findUnique({
        where: {
          id: dados.bairroId,
        },
      });

      if (!bairro) {
        throw new Error("Bairro não encontrado.");
      }

      if (!bairro.ativo) {
        throw new Error("Este bairro está indisponível para entrega.");
      }

      taxaEntrega = Number(bairro.taxaEntrega);
    }

    // ==========================================
    // CALCULAR SUBTOTAL
    // ==========================================

    let subtotal = 0;

    for (const item of carrinho.itens) {
      const valorProduto = Number(item.precoUnitario) * item.quantidade;

      const valorAdicionais = item.adicionais.reduce((total, adicional) => {
        return (
          total +
          Number(adicional.precoUnitario) *
            adicional.quantidade *
            item.quantidade
        );
      }, 0);

      subtotal += valorProduto + valorAdicionais;
    }
    const subtotalRefrigerantes = carrinho.refrigerantes.reduce(
      (total, refrigerante) => {
        return (
          total + Number(refrigerante.precoUnitario) * refrigerante.quantidade
        );
      },
      0,
    );
    subtotal += subtotalRefrigerantes;
    const total = subtotal + taxaEntrega;

    // ==========================================
    // VALIDAR DINHEIRO (usando formaPagamento normalizada)
    // ==========================================

    let trocoPara: number | null = null;

    if (formaPagamento === "DINHEIRO") {
      if (dados.trocoPara === undefined || dados.trocoPara === null) {
        throw new Error("Informe o valor para troco.");
      }

      const trocoNumero = Number(dados.trocoPara);

      if (isNaN(trocoNumero) || trocoNumero < total) {
        throw new Error(
          "O valor para troco deve ser maior ou igual ao total do pedido.",
        );
      }

      trocoPara = trocoNumero;
    }

    // ==========================================
    // CRIAR PEDIDO
    // ==========================================

    const pedido = await prisma.$transaction(async (tx) => {
      const pedido = await tx.pedido.create({
        data: {
          tipo: dados.tipo,
          status: "AGUARDANDO_CONFIRMACAO",

          subtotal,
          taxaEntrega,
          total,

          formaPagamento, // ✅ agora usa o valor normalizado (PIX, DINHEIRO...)

          trocoPara, // ✅ null quando não é dinheiro

          endereco: dados.tipo === "DELIVERY" ? dados.endereco : null,

          complemento: dados.tipo === "DELIVERY" ? dados.complemento : null,

          referencia: dados.tipo === "DELIVERY" ? dados.referencia : null,

          clienteId: carrinho.clienteId,

          bairroId: dados.tipo === "DELIVERY" ? dados.bairroId : null,

          refrigerantes: {
            create: carrinho.refrigerantes.map((item) => ({
              refrigeranteId: item.refrigeranteId,
              quantidade: item.quantidade,
              precoUnitario: item.precoUnitario,
            })),
          },

          itens: {
            create: carrinho.itens.map((item) => {
              const tamanho = tamanhos.find(
                (tamanho) => tamanho.id === item.tamanhoId,
              );

              if (!tamanho) {
                throw new Error(
                  `Tamanho da quentinha não encontrado para o item ${item.id}.`,
                );
              }

              return {
                produtoNome: tamanho.nome,
                quantidade: item.quantidade,
                precoUnitario: item.precoUnitario,
                observacao: item.observacao,

                escolhas: {
                  create: item.escolhas.map((escolha) => ({
                    tipo: escolha.tipo,
                    nome: escolha.nome,
                  })),
                },

                adicionais: {
                  create: item.adicionais.map((adicional) => ({
                    adicionalId: adicional.adicionalId,
                    nome: adicional.adicional.nome,
                    quantidade: adicional.quantidade,
                    precoUnitario: adicional.precoUnitario,
                  })),
                },

                remocoes: {
                  create: item.remocoes.map((remocao) => ({
                    id: randomUUID(),
                    ingrediente: remocao.ingrediente,
                  })),
                },
              };
            }),
          },
        },

        include: {
          cliente: true,
          bairro: true,
          itens: {
            include: {
              escolhas: true,
              adicionais: true,
              remocoes: true,
            },
          },
          refrigerantes: {
            include: {
              refrigerante: true,
            },
          },
        },
      });

      await tx.carrinho.update({
        where: {
          id: dados.carrinhoId,
        },
        data: {
          status: "FINALIZADO",
        },
      });

      return pedido;
    });
    return pedido;
  }
}

export { createPedidoService };
