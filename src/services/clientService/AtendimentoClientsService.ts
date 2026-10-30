import { prisma } from "../../lib/prisma.js";

class TransferirAtendimentoService {
  async execute(clienteId: string) {
    if (!clienteId || typeof clienteId !== "string") {
      throw new Error("ID do cliente inválido.");
    }

    const cliente = await prisma.cliente.findUnique({
      where: {
        id: clienteId,
      },
    });

    if (!cliente) {
      throw new Error("Cliente não encontrado.");
    }

    const clienteAtualizado = await prisma.cliente.update({
      where: {
        id: clienteId,
      },
      data: {
        modoAtendimento: "HUMANO",
        humanoAte: new Date(Date.now() + 60 * 1000),
      },
    });

    console.log(`👤 Atendimento humano ativado para ${clienteAtualizado.nome}`);

    console.log(`⏳ Retorno previsto para: ${clienteAtualizado.humanoAte}`);

    return clienteAtualizado;
  }
}

export { TransferirAtendimentoService };
