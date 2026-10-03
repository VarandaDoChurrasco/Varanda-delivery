import { Request, Response } from "express";
import { CadastrarRefrigeranteService } from "../../services/refrigente/cadastrarRefrigeranteService.js";

class CadastrarRefrigeranteController {
  async handle(req: Request, res: Response) {
    try {
      const { nome, preco } = req.body;

      const service = new CadastrarRefrigeranteService();

      const refrigerante = await service.execute({
        nome,
        preco: Number(preco),
      });

      return res.status(201).json({
        mensagem: "Refrigerante cadastrado com sucesso.",
        refrigerante,
      });
    } catch (error) {
      console.error("❌ Erro ao cadastrar refrigerante:", error);

      return res.status(400).json({
        mensagem:
          error instanceof Error
            ? error.message
            : "Erro ao cadastrar refrigerante.",
      });
    }
  }
}

export { CadastrarRefrigeranteController };
