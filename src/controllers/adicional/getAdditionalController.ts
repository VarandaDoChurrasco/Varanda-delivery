import { Request, Response } from "express";
import { getAdditionalService } from "../../services/adicionalService/getAdditionalService.js";

class getAdditionalController {
  async handle(req: Request, res: Response) {
    try {
      const additionalService = new getAdditionalService();
      const additional = await additionalService.execute();
      return res.status(200).json(additional);
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
export { getAdditionalController };
