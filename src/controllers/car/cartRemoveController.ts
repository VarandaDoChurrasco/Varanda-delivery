import { Request, Response } from "express";
import { RemoveCartRequest } from "../../type/type.js";
import { cartRemocaoService } from "../../services/carService/cartRemoveService.js";

class cartRemoveController {
  async handle(req: Request, res: Response) {
    const dados: RemoveCartRequest = req.body;

    try {
      const cartRemocao = new cartRemocaoService();
      const remocao = await cartRemocao.execulte(dados);

      return res.status(201).json(remocao);
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

export { cartRemoveController };
