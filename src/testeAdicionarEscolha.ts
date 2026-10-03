import "dotenv/config";

import { executarAdicionarEscolha } from "./services/helia/tools/adicionarEscolha.tool.js";

async function teste() {
  const resultado = await executarAdicionarEscolha({
    carrinhoItemId: "968fa393-d99c-44af-ba30-a732848f0d45",
    tipo: "ACOMPANHAMENTO",
    nome: "Arroz branco",
    opcaoId: "f9559ed5-485d-46e8-bb4c-2215248019bf",
  });

  console.log(JSON.stringify(resultado, null, 2));
}

teste().catch((erro) => {
  console.error(erro);
});
