import "dotenv/config";

import { HeliaService } from "./services/helia/helia.service.js";
import { clear } from "console";

async function main() {
  const helia = new HeliaService();

  const historico: any[] = [];

  // PRIMEIRA MENSAGEM

  const mensagem1 = "Quero a média";

  const resposta1 = await helia.processarMensagem(mensagem1, historico);

  console.log("\n========== CLIENTE ==========\n");
  console.log(mensagem1);

  console.log("\n========== HÉLIA ==========\n");
  console.log(resposta1);

  // Guardamos a conversa

  historico.push({
    role: "user",
    content: mensagem1,
  });

  historico.push({
    role: "assistant",
    content: resposta1,
  });

  // SEGUNDA MENSAGEM

  const mensagem2 = "Quero peixe e calabresa";

  const resposta2 = await helia.processarMensagem(mensagem2, historico);

  console.log("\n========== CLIENTE ==========\n");
  console.log(mensagem2);

  console.log("\n========== HÉLIA ==========\n");
  console.log(resposta2);

  // Guardamos a segunda conversa

  historico.push({
    role: "user",
    content: mensagem2,
  });

  historico.push({
    role: "assistant",
    content: resposta2,
  });

  // TERCEIRA MENSAGEM

  const mensagem3 = "Quero arroz e abóbora, e a salada também";

  const resposta3 = await helia.processarMensagem(mensagem3, historico);

  console.log("\n========== CLIENTE ==========\n");
  console.log(mensagem3);

  console.log("\n========== HÉLIA ==========\n");
  console.log(resposta3);

  console.log("\n=============================\n");

  historico.push({
    role: "user",
    content: mensagem3,
  });

  historico.push({
    role: "assistant",
    content: resposta3,
  });

  const mensagem4 = "Sim, pode confirmar";

  const resposta4 = await helia.processarMensagem(mensagem4, historico);

  console.log("\n========== CLIENTE ==========\n");
  console.log(mensagem4);

  console.log("\n========== HÉLIA ==========\n");
  console.log(resposta4);
}

main().catch((error) => {
  console.error("\nERRO:\n");
  console.error(error);
  process.exit(1);
});
