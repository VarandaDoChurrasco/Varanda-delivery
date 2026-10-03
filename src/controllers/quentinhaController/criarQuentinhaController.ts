import { Request, Response } from "express";
import { OpcaoQuentinhaService } from "../../services/quentinha/criarQuentinhaService.js";

const service = new OpcaoQuentinhaService();

export class OpcaoQuentinhaController {
  async criar(req: Request, res: Response) {
    try {
      const { nome, tipo } = req.body;

      if (!nome || !tipo) {
        return res.status(400).json({
          error: "nome e tipo são obrigatórios",
        });
      }

      const opcao = await service.criar({
        nome,
        tipo,
      });

      return res.status(201).json(opcao);
    } catch (error: any) {
      return res.status(400).json({
        error: error.message,
      });
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const { tipo } = req.query;

      if (tipo) {
        const opcoes = await service.listarPorTipo(
          String(tipo) as "PROTEINA" | "ACOMPANHAMENTO",
        );

        return res.json(opcoes);
      }

      const opcoes = await service.listar();

      return res.json(opcoes);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const id = String(req.params.id);

      const opcao = await service.buscarPorId(id);

      if (!opcao) {
        return res.status(404).json({
          error: "Opção não encontrada",
        });
      }

      return res.json(opcao);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const id = String(req.params.id);

      const opcao = await service.atualizar(id, req.body);

      return res.json(opcao);
    } catch (error: any) {
      return res.status(400).json({
        error: error.message,
      });
    }
  }

  async desativar(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const opcao = await service.desativar(String(id));

      return res.json(opcao);
    } catch (error: any) {
      return res.status(400).json({
        error: error.message,
      });
    }
  }
}
