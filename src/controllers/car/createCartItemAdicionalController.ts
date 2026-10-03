import { Request, Response } from "express";
import { CarrinhoItemAdicionalCreateRequest } from "../../type/type.js";
import { createCartItemAdditionalService } from "../../services/carService/createCartItemAdicionalService.js";

class createCartItemAdditionalController {
  async handle(req: Request, res: Response) {
    const dados: CarrinhoItemAdicionalCreateRequest = req.body;

    try {
      const createCartItemAdditional = new createCartItemAdditionalService();

      const adicional = await createCartItemAdditional.execulte(dados);

      return res.status(201).json(adicional);
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

export { createCartItemAdditionalController };
