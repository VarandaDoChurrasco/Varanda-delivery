import { prisma } from "../../lib/prisma.js";

class getCartService {
  async execulte(carrinhoId: string) {
    if (!carrinhoId) {
      throw new Error("Informe o carrinhoId.");
    }
    console.log("ID recebido no service:", carrinhoId);
    const carrinho = await prisma.carrinho.findUnique({
      where: {
        id: carrinhoId,
      },
      include: {
        cliente: true,
        itens: {
          include: {
            produto: true,

            adicionais: {
              include: {
                adicional: true,
              },
            },

            remocoes: true,
          },
        },
      },
    });

    if (!carrinho) {
      throw new Error("Carrinho não encontrado.");
    }

    let subtotal = 0;

    const itens = carrinho.itens.map((item) => {
      const valorProduto = Number(item.precoUnitario) * item.quantidade;

      const valorAdicionais = item.adicionais.reduce((total, adicional) => {
        return (
          total +
          Number(adicional.precoUnitario) *
            adicional.quantidade *
            item.quantidade
        );
      }, 0);

      const totalItem = valorProduto + valorAdicionais;

      subtotal += totalItem;

      return {
        id: item.id,
        quantidade: item.quantidade,
        observacao: item.observacao,

        produto: {
          id: item.produto.id,
          nome: item.produto.nome,
        },

        precoUnitario: Number(item.precoUnitario),

        adicionais: item.adicionais.map((adicional) => ({
          id: adicional.id,
          nome: adicional.adicional.nome,
          quantidade: adicional.quantidade,
          precoUnitario: Number(adicional.precoUnitario),
        })),

        remocoes: item.remocoes.map((remocao) => ({
          id: remocao.id,
          ingrediente: remocao.ingrediente,
        })),

        total: totalItem,
      };
    });

    return {
      id: carrinho.id,
      status: carrinho.status,

      cliente: {
        id: carrinho.cliente.id,
        nome: carrinho.cliente.nome,
        telefone: carrinho.cliente.telefone,
      },

      itens,

      subtotal,
      taxaEntrega: 0,
      total: subtotal,
    };
  }
}

export { getCartService };
