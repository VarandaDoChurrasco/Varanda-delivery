import { prisma } from "./lib/prisma.js";
import { EnviarComprovantePedidoService } from "./services/printService/enviarComprovantePedidoService.js";

async function teste() {
  try {
    const pedido = await prisma.pedido.findFirst({
      orderBy: {
        createdAt: "desc",
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

    if (!pedido) {
      throw new Error("Nenhum pedido encontrado.");
    }

    console.log(`📋 Pedido encontrado: #${pedido.numero}`);

    const enviarComprovante = new EnviarComprovantePedidoService();

    await enviarComprovante.execute(pedido);

    console.log("✅ Comprovante enviado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao enviar comprovante:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

teste();
