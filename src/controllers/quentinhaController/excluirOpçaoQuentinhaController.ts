import { prisma } from "../../lib/prisma.js";
import { Request, Response } from "express";
import { ExcluirOpcaoQuentinhaService } from "../../services/quentinha/excluirOpcaoQuentinhaService.js";

class excluirOpçaoQuentinhaController {
  async excluir(req: Request, res: Response) {
    try {
      const nome = String(req.body.nome ?? req.params.nome ?? req.query.nome);

      const service = new ExcluirOpcaoQuentinhaService();
      const resultado = service.executar(nome);

      return res.json(resultado);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
export { excluirOpçaoQuentinhaController };
