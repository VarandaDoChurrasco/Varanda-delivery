import { Request, Response } from "express";
import { CarrinhoItemEscolhaService } from "../../services/quentinha/itemCarrinhoQuentinhaService.js";

const service = new CarrinhoItemEscolhaService();

export class CarrinhoItemEscolhaController {
  async criar(req: Request, res: Response) {
    try {
      const { carrinhoItemId, tipo, nome, opcaoId } = req.body;

      if (!carrinhoItemId || !tipo || !nome) {
        return res.status(400).json({
          error: "carrinhoItemId, tipo e nome são obrigatórios",
        });
      }

      const escolha = await service.criar({
        carrinhoItemId,
        tipo,
        nome,
        opcaoId,
      });

      return res.status(201).json(escolha);
    } catch (error: any) {
      return res.status(400).json({
        error: error.message,
      });
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const carrinhoItemId = Array.isArray(req.params.carrinhoItemId)
        ? req.params.carrinhoItemId[0]
        : req.params.carrinhoItemId;

      const escolhas = await service.listarPorCarrinhoItem(carrinhoItemId);

      return res.json(escolhas);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const escolha = await service.buscarPorId(id);

      if (!escolha) {
        return res.status(404).json({
          error: "Escolha não encontrada.",
        });
      }

      return res.json(escolha);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  async excluir(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const escolha = await service.excluir(id);
      return res.status(200).json(escolha);
    } catch (error: any) {
      return res.status(400).json({
        error: error.message,
      });
    }
  }
}
