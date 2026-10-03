import { Request, Response } from "express";
import { getNeighborhoodService } from "../../services/neighborhoodService/getIdNeighborhoodService.js";

class getBairroController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;

    try {
      if (Array.isArray(id)) {
        return res.status(400).json({
          error: "ID inválido.",
        });
      }

      const getBairro = new getNeighborhoodService();

      const bairro = await getBairro.execute(id);

      return res.status(200).json(bairro);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(404).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor.",
      });
      // });
      //========================================
    }
  }
}
export { getBairroController };
