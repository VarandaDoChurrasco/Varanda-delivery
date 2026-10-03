import { Request, Response } from "express";
import { ConsultarListRefrigerantesService } from "../../services/refrigente/consultarListRefrigerantesController.js";

class ConsultarListRefrigerantesController {
  async handle(req: Request, res: Response) {
    try {
      const service = new ConsultarListRefrigerantesService();

      const refrigerantes = await service.execute();

      return res.status(200).json({
        mensagem: "Lista de refrigerantes consultada com sucesso.",
        refrigerantes,
      });
    } catch (error) {
      console.error("❌ Erro ao consultar lista de refrigerantes:", error);

      return res.status(400).json({
        mensagem:
          error instanceof Error
            ? error.message
            : "Erro ao consultar lista de refrigerantes.",
      });
    }
  }
}

export { ConsultarListRefrigerantesController };
