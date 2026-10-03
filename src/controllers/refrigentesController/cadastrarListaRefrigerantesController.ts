import { Request, Response } from "express";
import { CadastrarListaRefrigerantesService } from "../../services/refrigente/cadastrarListaRefrigerantesService.js";

class CadastrarListaRefrigerantesController {
  async handle(req: Request, res: Response) {
    try {
      const { refrigerantes } = req.body;

      if (!Array.isArray(refrigerantes)) {
        return res.status(400).json({
          mensagem: "A lista de refrigerantes é obrigatória.",
        });
      }

      const service = new CadastrarListaRefrigerantesService();

      const cadastrados = await service.execute(refrigerantes);

      return res.status(201).json({
        mensagem: "Refrigerantes cadastrados com sucesso.",
        refrigerantes: cadastrados,
      });
    } catch (error) {
      console.error("❌ Erro ao cadastrar refrigerantes:", error);

      return res.status(400).json({
        mensagem:
          error instanceof Error
            ? error.message
            : "Erro ao cadastrar refrigerantes.",
      });
    }
  }
}

export { CadastrarListaRefrigerantesController };
