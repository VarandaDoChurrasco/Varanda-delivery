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

app.get("/whatsapp/qr", (_req, res) => {
  const qr = whatsapp.getQrCode();

  if (!qr) {
    return res.status(404).send(`
      <h1>QR Code não disponível</h1>
      <p>O WhatsApp já está conectado ou ainda não gerou um QR Code.</p>
    `);
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Varanda - WhatsApp</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 40px;
          }

          h1 {
            margin-bottom: 20px;
          }

          img {
            max-width: 90vw;
            width: 400px;
          }
        </style>
      </head>

      <body>
        <h1>Conecte o WhatsApp</h1>

        <p>Abra o WhatsApp → Dispositivos conectados → Conectar dispositivo</p>

        <img
           src="${qr}"
          alt="QR Code do WhatsApp"
        />
      </body>
    </html>
  `);
});

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
