import { Router } from "express";
import {
  PrintRequestError,
  PrintRequestService,
} from "../services/printService/printRequestService.js";

export const printRequestsRouter = Router();
const service = new PrintRequestService();
printRequestsRouter.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
printRequestsRouter.get("/", async (_req, res) => {
  try {
    res.json(await service.pending());
  } catch (error) {
    console.error("Falha ao consultar impressões", error);
    res.status(500).json({ error: "Não foi possível consultar impressões" });
  }
});
printRequestsRouter.post("/:id", async (req, res) => {
  try {
    const { action, attempt } = req.body ?? {};
    res.json(await service.action(String(req.params.id), action, attempt));
  } catch (error) {
    if (error instanceof PrintRequestError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error("Falha ao registrar impressão", error);
      res.status(500).json({ error: "Não foi possível registrar impressão" });
    }
  }
});
