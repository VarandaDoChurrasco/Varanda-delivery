import { Request, Response } from "express";
import { confirmOrderService } from "../../services/orderService/confirmOrderService.js";
import { gerarTextoImpressao } from "../../formatadorImpressao.js";

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

      // 2. Gera o texto formatado do comprovante a partir do pedido
      const textoComprovante = gerarTextoImpressao(pedido);

      // 3. IP do telemóvel onde o Termux está a rodar o servidor Express
      const TERMUX_PRINT_URL = "http://192.168.1.6:3000/imprimir";

      // 4. Dispara a impressão para o Termux em segundo plano
      fetch(TERMUX_PRINT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          texto: textoComprovante,
        }),
      })
        .then((response) => response.json())
        .then((data) =>
          console.log("[TERMUX] Impressão enviada com sucesso:", data),
        )
        .catch((err) =>
          console.error("[TERMUX] Erro ao enviar para o Termux:", err.message),
        );

      // 5. Retorna a resposta de sucesso para o n8n / cliente
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
