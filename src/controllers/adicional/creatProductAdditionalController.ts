import { Request, Response } from "express";
import { ProdutoAdicionalCreateRequest } from "../../type/type.js";
import { createProductAdditionalService } from "../../services/adicionalService/createProductAdditionalService.js";

class createProductAdditionalController {
  async handle(req: Request, res: Response) {
    const dados: ProdutoAdicionalCreateRequest = req.body;

    try {
      const createProductAdditional = new createProductAdditionalService();

      const produtoAdicional = await createProductAdditional.execulte(dados);

      return res.status(201).json(produtoAdicional);
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

export { createProductAdditionalController };
