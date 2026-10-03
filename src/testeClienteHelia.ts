import "dotenv/config";

import { executarObterCliente } from "./services/helia/tools/obterCliente.tool.js";

async function teste() {
  const resultado = await executarObterCliente({
    telefone: "5521970280382",
    nome: "Flávio G Silva",
  });

  console.log(JSON.stringify(resultado, null, 2));
}

teste().catch((erro) => {
  console.error(erro);
});
