import "dotenv/config";
import { DeepSeekService } from "./services/helia/deepseek.service.js";

async function teste() {
  try {
    const deepSeek = new DeepSeekService();

    const resposta = await deepSeek.enviarMensagem(
      "Olá Hélia, quais quentinhas vocês têm hoje?",
    );

    console.log("\nResposta da Hélia:\n");
    console.log(resposta);
  } catch (error) {
    console.error("Erro ao testar DeepSeek:", error);
  }
}

teste();
