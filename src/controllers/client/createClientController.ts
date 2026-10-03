import { Request, Response } from "express";
import { CreateClientService } from "../../services/clientService/createClientService.js";

export class CreateClientController {
  async handle(req: Request, res: Response) {
    try {
      const { nome, telefone } = req.body;

      const createClientService = new CreateClientService();

      const cliente = await createClientService.execute({
        nome,
        telefone,
      });

      return res.status(201).json(cliente);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(500).json({ error: "Erro interno do servidor." });
    }
  }
}
