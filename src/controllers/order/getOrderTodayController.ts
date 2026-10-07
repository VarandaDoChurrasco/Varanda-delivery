import { Request, Response } from "express";
import { GetOrderTodayService } from "../../services/orderService/getOrderTodayService.js";

class GetOrderTodayController {
  async handle(req: Request, res: Response) {
    try {
      const orderToday = new GetOrderTodayService();

      const orders = await orderToday.execute();

      return res.status(200).json(orders);
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

export { GetOrderTodayController };
