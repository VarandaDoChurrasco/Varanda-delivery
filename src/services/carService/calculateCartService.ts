import { prisma } from "../../lib/prisma.js";
import { CalculateCartRequest } from "../../type/type.js";

class calculateCartService {
  async execute(dados: CalculateCartRequest) {
    if (!dados || !dados.carrinhoId || !dados.tipo) {
      throw new Error("Informe o carrinhoId e o tipo do pedido.");
    }

    if (dados.tipo !== "DELIVERY" && dados.tipo !== "RETIRADA") {
      throw new Error("Tipo de pedido inválido.");
    }

    const carrinho = await prisma.carrinho.findUnique({
      where: {
        id: dados.carrinhoId,
      },
      include: {
        itens: {
          include: {
            adicionais: true,
          },
        },
        refrigerantes: true,
      },
    });

    if (!carrinho) {
      throw new Error("Carrinho não encontrado.");
    }

    if (carrinho.status !== "ABERTO") {
      throw new Error("Este carrinho não está aberto.");
    }

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

    let taxaEntrega = 0;
    let bairro = null;

    if (dados.tipo === "DELIVERY") {
      if (!dados.bairroId) {
        throw new Error("Informe o bairro para pedidos de delivery.");
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

    const total = subtotal + taxaEntrega;

    return {
      carrinhoId: carrinho.id,
      tipo: dados.tipo,

      bairro: bairro
        ? {
            id: bairro.id,
            nome: bairro.nome,
          }
        : null,

      subtotal,
      subtotalRefrigerantes,
      taxaEntrega,
      total,
    };
  }
}

export { calculateCartService };

{
  /*class calculateCartService {
  async execute(dados: CalculateCartRequest) {
    if (!dados || !dados.carrinhoId || !dados.tipo) {
      throw new Error("Informe o carrinhoId e o tipo do pedido.");
    }

    if (dados.tipo !== "DELIVERY" && dados.tipo !== "RETIRADA") {
      throw new Error("Tipo de pedido inválido.");
    }

    const carrinho = await prisma.carrinho.findUnique({
      where: {
        id: dados.carrinhoId,
      },
      include: {
        itens: {
          include: {
            adicionais: true,
          },
        },
        refrigerantes: true,
      },
    });

    if (!carrinho) {
      throw new Error("Carrinho não encontrado.");
    }

    if (carrinho.status !== "ABERTO") {
      throw new Error("Este carrinho não está aberto.");
    }

    let subtotal = 0;

    for (const item of carrinho.itens) {
      const subtotalRefrigerantes = carrinho.refrigerantes.reduce(
        (total, refrigerante) => {
          return (
            total + Number(refrigerante.precoUnitario) * refrigerante.quantidade
          );
        },
        0,
      );
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

    let taxaEntrega = 0;
    let bairro = null;

    if (dados.tipo === "DELIVERY") {
      if (!dados.bairroId) {
        throw new Error("Informe o bairro para pedidos de delivery.");
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

    const total = subtotal + taxaEntrega;

    return {
      carrinhoId: carrinho.id,
      tipo: dados.tipo,
      bairro: bairro
        ? {
            id: bairro.id,
            nome: bairro.nome,
          }
        : null,
      subtotal,
      taxaEntrega,
      total,
    };
  }
}*/
}

//export { calculateCartService };
