import { Request, Response } from "express";
import { BairroCreateRequest } from "../../type/type.js";
import { createBairroService } from "../../services/neighborhoodService/createNeighborhoodService.js";

class createBairroController {
  async handle(req: Request, res: Response) {
    const dados: BairroCreateRequest = req.body;

    try {
      const createBairro = new createBairroService();

      const bairro = await createBairro.execute(dados);

      return res.status(201).json(bairro);
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

export { createBairroController };
