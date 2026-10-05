import { Request, Response } from "express";
import { RemoverCarrinhoRefrigeranteService } from "../../services/refrigente/removerCarrinhoRefrigeranteService.js";

interface RemoverCarrinhoRefrigeranteData {
  carrinhoId: string;
  refrigeranteId: string;
}

class RemoverRefrigeranteController {
  async handle(req: Request, res: Response) {
    try {
      const { carrinhoId, refrigeranteId } = <RemoverCarrinhoRefrigeranteData>(
        req.body
      );

      const service = new RemoverCarrinhoRefrigeranteService();

      await service.execute({ carrinhoId, refrigeranteId });
      return res.status(200).json({
        mensagem: "Refrigerante removido com sucesso.",
      });
    } catch (error) {
      console.error("❌ Erro ao remover refrigerante:", error);

      return res.status(400).json({
        mensagem:
          error instanceof Error
            ? error.message
            : "Erro ao remover refrigerante.",
      });
    }
  }
}

export { RemoverRefrigeranteController };
