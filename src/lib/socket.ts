import { Server } from "socket.io";

let io: Server | null = null;

export function configurarSocket(server: Server) {
  io = server;
}

export function emitirNovoPedido(pedido: unknown) {
  if (!io) {
    console.warn("⚠️ Socket.IO ainda não foi configurado.");
    return;
  }

  io.emit("novo_pedido", pedido);

  console.log("📡 Novo pedido enviado para o VarandaPrint.");
}
