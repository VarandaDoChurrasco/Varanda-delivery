import "dotenv/config";
import fs from "fs";
import { ExtrairCardapioDaImagemService } from "../backend/src/services/menuService/extrairCardapioDaImagem.service.js";

console.log("1. Iniciando teste...");

try {
  console.log("2. Lendo imagem...");

  const imagem = fs.readFileSync("../backend/src/testex.jpeg");

  console.log("3. Imagem lida:", imagem.length, "bytes");

  const base64 = `data:image/jpeg;base64,${imagem.toString("base64")}`;

  console.log("4. Base64 criado:", base64.length, "caracteres");

  console.log("5. Criando service...");

  const service = new ExtrairCardapioDaImagemService();

  console.log("6. Executando service...");

  const resultado = await service.execute(base64);

  console.log("7. Resultado recebido:");

  console.log(JSON.stringify(resultado, null, 2));

  console.log("8. Teste finalizado.");
} catch (error) {
  console.error("ERRO NO TESTE:");
  console.error(error);
}
