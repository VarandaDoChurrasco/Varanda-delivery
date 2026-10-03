import { Request, Response } from "express";
import { cancelOrderService } from "../../services/orderService/cancelOrderService.js";

class cancelOrderController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;

    try {
      if (Array.isArray(id)) {
        return res.status(400).json({
          error: "ID inválido.",
        });
      }
      const cancelOrder = new cancelOrderService();

      const pedido = await cancelOrder.execute(id);

      return res.status(200).json(pedido);
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

export { cancelOrderController };
