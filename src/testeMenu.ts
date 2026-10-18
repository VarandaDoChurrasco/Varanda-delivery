import "dotenv/config";
import { GetMenuService } from "./services/menuService/getMenuService.js";

async function main() {
  try {
    console.log("🔎 Consultando cardápio disponível...");

    const service = new GetMenuService();
    const cardapio = await service.execute();

    console.log("\n📋 CARDÁPIO:");
    console.log(JSON.stringify(cardapio, null, 2));

    console.log("\n✅ Consulta realizada com sucesso!");
  } catch (error) {
    console.error("\n❌ Erro ao consultar cardápio:");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  }
}

main();
