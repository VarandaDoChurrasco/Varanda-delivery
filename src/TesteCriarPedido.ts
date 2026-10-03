import "dotenv/config";
import { executarCriarPedido } from "./services/helia/tools/criarPedido.tool.js";

async function main() {
  const resultado = await executarCriarPedido({
    carrinhoId: "cc3f1010-e10b-493e-b316-d95e727553c2",
    tipo: "RETIRADA",
    formaPagamento: "PIX",
  });

  console.log(JSON.stringify(resultado, null, 2));
}

main().catch((error) => {
  console.error("ERRO:", error);
});
