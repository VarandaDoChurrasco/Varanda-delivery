import "dotenv/config";

import { executarAdicionarQuentinha } from "./services/helia/tools/adicionarQuentinha.tool.js";

async function teste() {
  const resultado = await executarAdicionarQuentinha({
    carrinhoId: "cc3f1010-e10b-493e-b316-d95e727553c2",
    tamanhoQuentinhaId: "2eefbb9b-8c80-42f8-9f13-e7314c4106ed",
    quantidade: 1,
  });

  console.log(JSON.stringify(resultado, null, 2));
}

teste().catch((erro) => {
  console.error(erro);
});
