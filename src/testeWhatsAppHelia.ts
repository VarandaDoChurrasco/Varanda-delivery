import "dotenv/config";
import { HeliaService } from "./services/helia/helia.service.js";

const helia = new HeliaService();

console.log("🤖 Testando Hélia...");

try {
  const resposta = await helia.processarMensagem("Ola");

  console.log("\n✅ RESPOSTA DA HÉLIA:");
  console.log(resposta);
} catch (error) {
  console.error("\n❌ ERRO:");
  console.error(error);
}
