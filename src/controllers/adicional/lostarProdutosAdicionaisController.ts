import { Request, Response } from "express";
import { ListarProdutosComAdicionaisService } from "../../services/adicionalService/listarProdutosComAdicionaisService.js";

class ListarProdutosComAdicionaisController {
  async handle(req: Request, res: Response) {
    try {
      const service = new ListarProdutosComAdicionaisService();

      const produtos = await service.execute();

      return res.status(200).json(produtos);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: "Erro ao buscar produtos.",
      });
    }
  }
}

export { ListarProdutosComAdicionaisController };
