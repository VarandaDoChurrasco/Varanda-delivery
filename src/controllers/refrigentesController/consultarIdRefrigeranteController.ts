import { Request, Response } from "express";
import { ConsultarIdRefrigerantesService } from "../../services/refrigente/consultarIdRefrigerantesService.js";

class ConsultarIdRefrigerantesController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (Array.isArray(id)) {
        return res.status(400).json({
          error: "ID inválido.",
        });
      }

      const service = new ConsultarIdRefrigerantesService();

      const refrigerante = await service.execute(id);

      return res.status(200).json({
        mensagem: "Refrigerante encontrado com sucesso.",
        refrigerante,
      });
    } catch (error) {
      console.error("❌ Erro ao consultar refrigerante:", error);

      return res.status(400).json({
        mensagem:
          error instanceof Error
            ? error.message
            : "Erro ao consultar refrigerante.",
      });
    }
  }
}

export { ConsultarIdRefrigerantesController };
