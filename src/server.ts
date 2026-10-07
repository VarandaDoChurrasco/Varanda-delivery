{
  /*import "dotenv/config";
import express from "express";
import cors from "cors";
import { router } from "./routes/routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "Varanda Delivery API funcionando",
  });
});

app.use(router);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});  */
}

import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { router } from "./routes/routes.js";
import { configurarSocket } from "./lib/socket.js";
import { WhatsAppService } from "./services/whatsapp/whatsapp.service.js";
import { AutomaticOrderStatusService } from "./services/orderService/automaticOrderStatusService.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "Varanda Delivery API funcionando",
  });
});

app.use(router);

const PORT = process.env.PORT || 3333;

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

configurarSocket(io);
io.on("connection", (socket) => {
  console.log(`🟢 VarandaPrint conectado: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`🔴 Cliente desconectado: ${socket.id}`);
  });
});

const whatsapp = new WhatsAppService();

whatsapp.iniciar();

const automaticOrderStatusService = new AutomaticOrderStatusService();

setInterval(async () => {
  try {
    await automaticOrderStatusService.execute();
  } catch (error) {
    console.error("❌ Erro na atualização automática dos pedidos:", error);
  }
}, 60 * 1000);

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
