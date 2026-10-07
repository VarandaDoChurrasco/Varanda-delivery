import { prisma } from "../../lib/prisma.js";

class AlterarModoAtendimentoService {
  async voltarParaIA(clienteId: string) {
    const cliente = await prisma.cliente.findUnique({
      where: {
        id: clienteId,
      },
    });

    if (!cliente) {
      throw new Error("Cliente não encontrado.");
    }

    if (cliente.modoAtendimento === "IA") {
      return cliente;
    }

    const clienteAtualizado = await prisma.cliente.update({
      where: {
        id: clienteId,
      },
      data: {
        modoAtendimento: "IA",
        humanoAte: null,
      },
    });

    return clienteAtualizado;
  }
}

export { AlterarModoAtendimentoService };
