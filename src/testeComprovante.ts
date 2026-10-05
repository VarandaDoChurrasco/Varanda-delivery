import "dotenv/config";
import { prisma } from "./lib/prisma.js";
import { GerarComprovantePedidoService } from "./services/printService/gerarComprovantePedidoService.js";
import fs from "node:fs/promises";

async function teste() {
  try {
    // Pega o pedido mais recente
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

    console.log(`Pedido encontrado: #${pedido.numero}`);

    const gerarComprovante = new GerarComprovantePedidoService();

    const pdf = await gerarComprovante.execute(pedido);

    const caminho = `./pedido-${pedido.numero}.pdf`;

    await fs.writeFile(caminho, pdf);

    console.log("=================================");
    console.log("PDF GERADO COM SUCESSO!");
    console.log(`Pedido: #${pedido.numero}`);
    console.log(`Arquivo: ${caminho}`);
    console.log(`Tamanho: ${pdf.length} bytes`);
    console.log("=================================");
  } catch (error) {
    console.error("Erro ao gerar comprovante:");

    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

teste();
