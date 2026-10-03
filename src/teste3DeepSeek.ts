import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
  timeout: 15000,
});

console.log("🚀 Iniciando teste...");

try {
  console.log("📡 Enviando requisição...");

  const resposta = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      {
        role: "user",
        content: "Responda apenas: OK",
      },
    ],
  });

  console.log("✅ Resposta recebida:");
  console.log(resposta.choices[0]?.message?.content);
} catch (error) {
  console.error("❌ ERRO:");
  console.error(error);
}
