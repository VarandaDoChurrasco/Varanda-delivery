import { Request, Response } from "express";
import { getClientService } from "../../services/clientService/getClientService.js";

class getClientController {
  async handle(req: Request, res: Response) {
    try {
      const { telefone } = req.body;

      const getClient = new getClientService();
      const clientPhone = await getClient.execute(telefone);

      return res.status(200).json(clientPhone);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(500).json({ error: "Erro interno do servidor." });
    }
  }
}
export { getClientController };
