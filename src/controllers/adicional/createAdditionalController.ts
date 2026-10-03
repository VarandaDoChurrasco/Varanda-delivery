import { Request, Response } from "express";
import { AdicionalCreateRequest } from "../../type/type.js";
import { createAdditionalService } from "../../services/adicionalService/createAdditionalService.js";

class createAdditionalController {
  async handle(req: Request, res: Response) {
    const dados: AdicionalCreateRequest = req.body;

    try {
      const createAdditional = new createAdditionalService();

      const adicional = await createAdditional.execulte(dados);

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

export { createAdditionalController };
