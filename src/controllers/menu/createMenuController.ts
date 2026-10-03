import { Request, Response } from "express";
import { CardapioCreateRequest } from "../../type/type.js";
import { CreateCardapioService } from "../../services/menuService/createMenuService.js";

class createCardapioController {
  async handle(req: Request, res: Response) {
    const dados: CardapioCreateRequest = req.body;

    try {
      const createCardapio = new CreateCardapioService();

      const cardapio = await createCardapio.execulte(dados);

      return res.status(201).json(cardapio);
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

export { createCardapioController };
