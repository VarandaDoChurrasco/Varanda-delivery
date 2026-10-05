import { Request, Response } from "express";
import { SaiuEntregaOrderService } from "../../services/orderService/outForDeliveryOrderController.js";

class saiuEntregaOrderController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;

    try {
      if (Array.isArray(id)) {
        return res.status(400).json({
          error: "ID inválido.",
        });
      }
      const startPreparation = new SaiuEntregaOrderService();

      const pedido = await startPreparation.execute(id);

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

export { saiuEntregaOrderController };
