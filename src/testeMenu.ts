import "dotenv/config";
import { GetMenuService } from "./services/menuService/getMenuService.js";

async function main() {
  const service = new GetMenuService();

  const menu = await service.execute();

  console.log(JSON.stringify(menu, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
