import { prisma } from "../../lib/prisma.js";
import { CardapioExtraido } from "./extrairCardapioDaImagem.service.js";

class CardapioPendenteService {
  async salvar(cardapio: CardapioExtraido) {
    const existente = await prisma.cardapioPendente.findFirst();

    if (existente) {
      return prisma.cardapioPendente.update({
        where: {
          id: existente.id,
        },
        data: {
          acompanhamentos: cardapio.acompanhamentos,
          proteinas: cardapio.proteinas,
          saladas: cardapio.saladas,
        },
      });
    }

    return prisma.cardapioPendente.create({
      data: {
        acompanhamentos: cardapio.acompanhamentos,
        proteinas: cardapio.proteinas,
        saladas: cardapio.saladas,
      },
    });
  }

  async obter() {
    return prisma.cardapioPendente.findFirst();
  }

  async excluir() {
    const existente = await prisma.cardapioPendente.findFirst();

    if (!existente) {
      return;
    }

    await prisma.cardapioPendente.delete({
      where: {
        id: existente.id,
      },
    });
  }
}

export { CardapioPendenteService };
