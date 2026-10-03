import "dotenv/config";

import { executarObterCarrinho } from "./services/helia/tools/obterCarrinho.tool.js";

async function teste() {
  const resultado = await executarObterCarrinho({
    clienteId: "0fcbf805-cf51-4065-aa6b-b1e06b73429d",
  });

  console.log(JSON.stringify(resultado, null, 2));
}

teste().catch((erro) => {
  console.error(erro);
});
