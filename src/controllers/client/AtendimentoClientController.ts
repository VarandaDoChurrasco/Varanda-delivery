import { Request, Response } from "express";
import { TransferirAtendimentoService } from "../../services/clientService/AtendimentoClientsService.js";

class TransferirAtendimento {
  async handle(req: Request, res: Response) {
    try {
      const { clienteId } = req.body;

      if (!clienteId || typeof clienteId !== "string") {
        return res.status(400).json({
          error: "ID do cliente inválido.",
        });
      }

      const transferirAtendimentoService = new TransferirAtendimentoService();

      const cliente = await transferirAtendimentoService.execute(clienteId);

      return res.status(200).json({
        message: "Atendimento transferido para humano.",
        cliente,
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

export { TransferirAtendimento };
