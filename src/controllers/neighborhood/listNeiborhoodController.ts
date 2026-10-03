import { Request, Response } from "express";
import { listNeighborhoodService } from "../../services/neighborhoodService/listNeighborhoodService.js";

class listBairroController {
  async handle(req: Request, res: Response) {
    try {
      const listBairro = new listNeighborhoodService();

      const bairros = await listBairro.execute();

      return res.status(200).json(bairros);
    } catch (error) {
      return res.status(500).json({
        error: "Erro interno do servidor.",
      });
    }
  }
}

export { listBairroController };
