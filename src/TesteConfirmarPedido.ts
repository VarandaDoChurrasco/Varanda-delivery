import "dotenv/config";
import { executarConfirmarPedido } from "./services/helia/tools/confirmarPedido.tool.js";

async function main() {
  const resultado = await executarConfirmarPedido({
    pedidoId: "845926bb-4369-4f7a-aeb6-26faad800a11",
  });

  console.log(JSON.stringify(resultado, null, 2));
}

main().catch((error) => {
  console.error("ERRO:", error);
});
