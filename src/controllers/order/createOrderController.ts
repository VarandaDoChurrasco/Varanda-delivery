import { Request, Response } from "express";
import { CheckoutRequest } from "../../type/type.js";
import { createPedidoService } from "../../services/orderService/createOrderService.js";

class createPedidoController {
  async handle(req: Request, res: Response) {
    const dados: CheckoutRequest = req.body;

    try {
      const createPedido = new createPedidoService();

      const pedido = await createPedido.execute(dados);

      return res.status(201).json(pedido);
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

export { createPedidoController };
