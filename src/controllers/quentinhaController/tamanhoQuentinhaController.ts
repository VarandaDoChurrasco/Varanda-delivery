import { Request, Response } from "express";
import { TamanhoQuentinhaData } from "../../type/type.js";
import { TamanhoQuentinhaService } from "../../services/quentinha/tamanhoQuentinhaService.js";

class tamanhoQuentinhaController {
  async create(req: Request, res: Response) {
    try {
      const { nome, preco, maxProteinas } = <TamanhoQuentinhaData>req.body;

      if (!nome || !preco || !maxProteinas) {
        return res.status(400).json({
          error: "Nome, preco e maxProteinas são obrigatórios",
        });
      }
      const criarTamanho = await new TamanhoQuentinhaService().create({
        nome,
        preco,
        maxProteinas,
      });
      return res.status(200).json(criarTamanho);
    } catch (error) {}
  }

  async buscar() {
    const buscarTamanho = await new TamanhoQuentinhaService().get();
  }
}
export { tamanhoQuentinhaController };
