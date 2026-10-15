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

  const clientesConectados = io.sockets.sockets.size;

  console.log("📊 Clientes Socket.IO conectados:", clientesConectados);
  console.log("📤 Emitindo evento novo_pedido:", pedido);

  io.emit("novo_pedido", pedido);

  console.log("📡 Novo pedido enviado para o VarandaPrint.");
}
