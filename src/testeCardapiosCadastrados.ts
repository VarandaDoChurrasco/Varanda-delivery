import "dotenv/config";
import { prisma } from "./lib/prisma.js";

async function main() {
  try {
    const cardapios = await prisma.cardapio.findMany({
      orderBy: [{ data: "desc" }, { periodo: "asc" }],
      take: 10,
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
        cardapioOpcaoQuentinhas: {
          include: {
            opcao: true,
          },
        },
      },
    });

    for (const cardapio of cardapios) {
      console.log("\n==========================");
      console.log("Data:", cardapio.data.toISOString().slice(0, 10));
      console.log("Período:", cardapio.periodo);
      console.log("Ativo:", cardapio.ativo);

      console.log(
        "Produtos:",
        cardapio.itens.map((item) => ({
          nome: item.produto.nome,
          preco: Number(item.preco),
        })),
      );

      console.log(
        "Opções:",
        cardapio.cardapioOpcaoQuentinhas.map((item) => ({
          nome: item.opcao.nome,
          tipo: item.tipo,
        })),
      );
    }

    const pendentes = await prisma.cardapioPendente.findMany();

    console.log("\nCardápios pendentes:", pendentes.length);
  } catch (error) {
    console.error("Erro:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
