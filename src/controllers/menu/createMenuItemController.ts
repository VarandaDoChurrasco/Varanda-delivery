import { Request, Response } from "express";
import { CardapioItemCreateRequest } from "../../type/type.js";
import { createMenuItemService } from "../../services/menuService/CreateMenuItemService.js";

class createCardapioItemController {
  async handle(req: Request, res: Response) {
    const dados: CardapioItemCreateRequest = req.body;

    try {
      const createCardapioItem = new createMenuItemService();

      const cardapioItem = await createCardapioItem.execulte(dados);

      return res.status(201).json(cardapioItem);
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

export { createCardapioItemController };
