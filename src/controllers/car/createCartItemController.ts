import { Request, Response } from "express";
import { CarrinhoItemCreateRequest } from "../../type/type.js";
import { CreateCartItemService } from "../../services/carService/createitemCartService.js";

class createCartItemController {
  async handle(req: Request, res: Response) {
    const dados: any = req.body;

    try {
      const createCartItem = new CreateCartItemService();

      const cartItem = await createCartItem.execute(dados);

      return res.status(201).json(cartItem);
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

export { createCartItemController };
