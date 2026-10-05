import "dotenv/config";

import { WhatsAppService } from "../src/services/whatsapp/whatsapp.service.js";
import { EnviarComprovantePedidoService } from "../src/services/printService/enviarComprovantePedidoService.js";
import { prisma } from "../src/lib/prisma.js";

async function esperarWhatsAppConectar(sock: any) {
  return new Promise<void>((resolve) => {
    if (sock.user) {
      resolve();
      return;
    }

    sock.ev.on("connection.update", (update: any) => {
      if (update.connection === "open") {
        resolve();
      }
    });
  });
}

async function teste() {
  try {
    console.log("📱 Iniciando WhatsApp...");

    const whatsapp = new WhatsAppService();

    const sock = await whatsapp.iniciar();

    console.log("⏳ Aguardando conexão com o WhatsApp...");

    await esperarWhatsAppConectar(sock);

    console.log("✅ WhatsApp conectado!");

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

    console.log(`✅ Comprovante do pedido #${pedido.numero} enviado!`);
  } catch (error) {
    console.error("❌ Erro no teste:");
    console.error(error);
  }
}

teste();
