import { Request, Response } from "express";
import { DeleteCartItemService } from "../../services/carService/DeleteCartItemService.js";

class DeleteCartItem {
  async execute(req: Request, res: Response) {
    const { id } = req.body;

    try {
      if (!id || typeof id !== "string") {
        return res.status(400).json({
          error: "ID inválido.",
        });
      }

      const deletItemCart = new DeleteCartItemService();

      const deletedItem = await deletItemCart.execute(id);

      return res
        .status(200)
        .json({
          message: "Produto removido do carrinho com sucesso.",
          item: deletedItem,
        });
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

export { DeleteCartItem };
