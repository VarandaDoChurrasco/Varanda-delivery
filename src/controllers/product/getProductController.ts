import { Request, Response } from "express";
import { getProductService } from "../../services/productSevice/getProductService.js";

class getProductController {
  async handle(req: Request, res: Response) {
    try {
      const getProducts = new getProductService();

      const produtos = await getProducts.execute();

      return res.status(200).json(produtos);
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

export { getProductController };
