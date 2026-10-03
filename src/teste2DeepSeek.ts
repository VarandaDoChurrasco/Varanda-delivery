import "dotenv/config";
import OpenAI from "openai";

const apiKey = process.env.DEEPSEEK_API_KEY;

if (!apiKey) {
  throw new Error("DEEPSEEK_API_KEY não configurada.");
}

const client = new OpenAI({
  apiKey,
  baseURL: "https://api.deepseek.com",
});

console.log("🚀 Testando conexão com DeepSeek...");

try {
  const resposta = await client.chat.completions.create({
    model: process.env.DEEPSEEK_MODEL || "deepseek-flash",
    messages: [
      {
        role: "user",
        content: "Responda apenas: OK",
      },
    ],
  });

  console.log("\n✅ DeepSeek respondeu:");
  console.log(resposta.choices[0]?.message?.content);
} catch (error) {
  console.error("\n❌ Erro no DeepSeek:");
  console.error(error);
}
