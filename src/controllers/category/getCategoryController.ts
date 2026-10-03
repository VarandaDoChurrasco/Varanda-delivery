import { Request, Response } from "express";
import { getCategoryService } from "../../services/categoryService/getCategoryService.js";

class getCategoryController {
  async handle(req: Request, res: Response) {
    try {
      const getCategory = new getCategoryService();
      const category = await getCategory.execute();
      return res.status(200).json(category);
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
export { getCategoryController };
