import "dotenv/config";

import { executarConsultarCardapio } from "./services/helia/tools/consultarCardapio.tool.js";

async function teste() {
  const resultado = await executarConsultarCardapio();

  console.log(JSON.stringify(resultado, null, 2));
}

teste().catch((erro) => {
  console.error(erro);
});
