import { Request, Response } from "express";
import { CalculateCartRequest } from "../../type/type.js";
import { calculateCartService } from "../../services/carService/calculateCartService.js";

class calculateCartController {
  async handle(req: Request, res: Response) {
    const dados: CalculateCartRequest = req.body;

    try {
      const calculateCart = new calculateCartService();

      const cart = await calculateCart.execute(dados);

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

export { calculateCartController };
