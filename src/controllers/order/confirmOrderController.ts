import { Request, Response } from "express";
import { confirmOrderService } from "../../services/orderService/confirmOrderService.js";

class confirmOrderController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;

    try {
      if (Array.isArray(id)) {
        return res.status(400).json({
          error: "ID inválido.",
        });
      }

      const confirmOrder = new confirmOrderService();

      // 1. O service atualiza o pedido no banco e devolve os dados completos
      const pedido = await confirmOrder.execute(id);

      // Confirmation persists the print request and emits the immediate notice.
      return res.status(200).json({
        message: "Pedido confirmado com sucesso!",
        pedido,
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

export { confirmOrderController };
