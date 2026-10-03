import { Request, Response } from "express";
import { getIdCategoryService } from "../../services/categoryService/geIdCategoryService.js";

class getIdCategoryController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;

    try {
      if (Array.isArray(id)) {
        return res.status(400).json({
          error: "ID inválido.",
        });
      }

      const getIdCategory = new getIdCategoryService();
      const category = await getIdCategory.execute(id);

      return res.status(200).json(category);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json("Erro interno");
    }
  }
}
export { getIdCategoryController };
