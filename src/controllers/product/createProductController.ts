import { Request, Response } from "express";
import { ProdutoCreateRequest } from "../../type/type.js";
import { createProductService } from "../../services/productSevice/creaeProductService.js";

class createProductController {
  async handle(req: Request, res: Response) {
    const dados: ProdutoCreateRequest = req.body;

    try {
      const createProduct = new createProductService();

      const product = await createProduct.execulte(dados);

      return res.status(201).json(product);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(500).json({ error: "Erro interno do servidor." });
    }
  }
}

export { createProductController };
