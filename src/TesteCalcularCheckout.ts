import "dotenv/config";

import { executarCalcularCheckout } from "./services/helia/tools/calcularCheckout.tool.js";
async function teste() {
  const resultado = await executarCalcularCheckout({
    carrinhoId: "cc3f1010-e10b-493e-b316-d95e727553c2",
    tipo: "DELIVERY",
    bairroId: "fb0847d5-27be-4835-a318-3b60ba2f771b",
  });

  console.log(JSON.stringify(resultado, null, 2));
}

teste().catch((erro) => {
  console.error(erro);
});
