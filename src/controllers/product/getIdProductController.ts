import { Request, Response } from "express";
import { getIdProduct } from "../../services/productSevice/getIdProductService.js";

class getIdProductController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;

    try {
      if (Array.isArray(id)) {
        return res.status(400).json({
          error: "ID inválido.",
        });
      }

      const getProduct = new getIdProduct();

      const product = await getProduct.execute(id);

      return res.status(200).json(product);
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
export { getIdProductController };
