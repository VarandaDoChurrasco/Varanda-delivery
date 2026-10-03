import { Request, Response } from "express";
import { GetAllOrderService } from "../../services/orderService/getAllOrderService.js";

class getAllOrderController {
  async handle(req: Request, res: Response) {
    try {
      const orderAll = new GetAllOrderService();
      const order = await orderAll.execute();
      res.status(200).json(order);
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
export { getAllOrderController };
