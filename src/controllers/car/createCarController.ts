import { Request, Response } from "express";
import { CarrinhoCreateRequest } from "../../type/type.js";
import { createCartService } from "../../services/carService/createCarService.js";

class createCartController {
  async handle(req: Request, res: Response) {
    const dados: CarrinhoCreateRequest = req.body;

    try {
      const createCart = new createCartService();

      const cart = await createCart.execulte(dados);

      return res.status(200).json(cart);
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

export { createCartController };
