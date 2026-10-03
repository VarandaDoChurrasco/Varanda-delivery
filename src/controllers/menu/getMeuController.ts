import { Request, Response } from "express";
import { GetMenuService } from "../../services/menuService/getMenuService.js";

class getMenuController {
  async handle(req: Request, res: Response) {
    try {
      const getMenu = new GetMenuService();

      const menu = await getMenu.execute();

      return res.status(200).json(menu);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor.",
      });
    }
  }
}

export { getMenuController };
