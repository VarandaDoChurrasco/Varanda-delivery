import { prisma } from "../../lib/prisma.js";
import { ProdutoCreateRequest } from "../../type/type.js";

class createProductService {
  async execulte(dados: ProdutoCreateRequest) {
    if (
      !dados ||
      !dados.nome ||
      dados.preco === undefined ||
      dados.preco === null
    ) {
      throw new Error("Informe o nome e o preço do produto.");
    }

    if (!Number.isFinite(Number(dados.preco)) || Number(dados.preco) < 0) {
      throw new Error("Preço inválido.");
    }

    const produto = await prisma.produto.create({
      data: {
        nome: dados.nome,
        descricao: dados.descricao,
        preco: dados.preco,
        tipo: "SIMPLES",
        ativo: true,
        disponivel: true,
      },
    });

    return produto;
  }
}

export { createProductService };

//===================
/*
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando o seed do cardápio...");

  // 1. Criar as Categorias
  const categorias = [
    { nome: "Spaguete Cremoso e Batata Recheada" },
    { nome: "Escondidinho" },
    { nome: "Lasanha" },
    { nome: "Jantinha" },
  ];

  const categoriasCriadas: any = {};

  for (const cat of categorias) {
    const categoria = await prisma.categoria.upsert({
      where: { nome: cat.nome },
      update: {},
      create: cat,
    });
    categoriasCriadas[cat.nome] = categoria.id;
    console.log(`Categoria criada: ${cat.nome}`);
  }

  // 2. Criar os Produtos

  // --- SPAGUETE (R$ 20,00) ---
  const saboresSpaguete = [
    "Camarão",
    "Carne moída",
    "Calabresa",
    "Frango desfiado",
    "Pizza",
    "Carne do sol",
  ];
  const inclusosSpaguete =
    "Inclusos: Bacon, Cheddar, Creme cheese, Molho branco e Queijo crenoso.";

  for (const sabor of saboresSpaguete) {
    await prisma.produto.create({
      data: {
        nome: `Spaguete Cremoso e Batata Recheada - ${sabor}`,
        descricao: inclusosSpaguete,
        preco: 20.0,
        categoriaId: categoriasCriadas["Spaguete Cremoso e Batata Recheada"],
      },
    });
  }

  // --- ESCONDIDINHO (R$ 30,00) ---
  const saboresEscondidinho = [
    "Camarão",
    "Carne moída",
    "Calabresa",
    "Frango desfiado",
    "Pizza",
    "Carne do sol",
  ];

  for (const sabor of saboresEscondidinho) {
    await prisma.produto.create({
      data: {
        nome: `Escondidinho - ${sabor}`,
        descricao: "Escondidinho cremoso com purê.",
        preco: 30.0,
        categoriaId: categoriasCriadas["Escondidinho"],
      },
    });
  }

  // --- LASANHA (R$ 25,00) ---
  const saboresLasanha = [
    "Camarão",
    "Carne moída",
    "Calabresa",
    "Frango desfiado",
    "Pizza",
    "Carne do sol",
  ];

  for (const sabor of saboresLasanha) {
    await prisma.produto.create({
      data: {
        nome: `Lasanha - ${sabor}`,
        descricao: "Lasanha caseira.",
        preco: 25.0,
        categoriaId: categoriasCriadas["Lasanha"],
      },
    });
  }

  // --- JANTINHA (R$ 15,00 / R$ 20,00) ---
  // Aqui está o pulo do gato: A jantinha tem opções e acompanhamentos.
  // Vamos criar um produto para cada opção de carne e colocar os acompanhamentos na descrição.

  const opcoesJantinha = [
    { nome: "Peixe cozido", preco: 20.0 },
    { nome: "Costelinha suína assada", preco: 20.0 },
    { nome: "Frango grelhado", preco: 15.0 }, // Exemplo de preço menor
    { nome: "Frango assado", preco: 15.0 },
    { nome: "Salada de vinagrete", preco: 15.0 },
  ];

  const acompanhamentos =
    "Acompanhamentos: Feijão caldo ou farofa, Feijão forte, Arroz branco, Abóbora, Macarrão alho e óleo.";

  for (const opcao of opcoesJantinha) {
    await prisma.produto.create({
      data: {
        nome: `Jantinha - ${opcao.nome}`,
        descricao: acompanhamentos,
        preco: opcao.preco,
        categoriaId: categoriasCriadas["Jantinha"],
      },
    });
  }

  console.log("Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });*/
