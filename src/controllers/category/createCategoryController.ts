import { Request, Response } from "express";
import { CreateCategoryService } from "../../services/categoryService/createCategoryService.js";

class createCategoryController {
  async handle(req: Request, res: Response) {
    try {
      const { nome } = req.body;

      const createClientService = new CreateCategoryService();

      const cliente = await createClientService.execute({
        nome,
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
export { createCategoryController };
