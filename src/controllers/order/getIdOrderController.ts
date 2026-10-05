import { Request, Response } from "express";
import { GetOrderService } from "../../services/orderService/getIdOrderService.js";

class getOrderController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;

    try {
      if (Array.isArray(id)) {
        return res.status(400).json({
          error: "ID inválido.",
        });
      }

      const getOrder = new GetOrderService();

      const pedido = await getOrder.execute(id);

      return res.status(200).json(pedido);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(404).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "Erro interno do servidor.",
      });
    }
  }
}
export { getOrderController };
