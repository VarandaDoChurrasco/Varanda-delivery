import { prisma } from "../../lib/prisma.js";
import { AlterarModoAtendimentoService } from "./alterarModoAtendimentoService.js";

class ProcessarComandoAtendimentoService {
  private alterarModoAtendimentoService: AlterarModoAtendimentoService;

  constructor() {
    this.alterarModoAtendimentoService = new AlterarModoAtendimentoService();
  }

  async execute(texto: string): Promise<string | null> {
    console.log("👤 COMANDO DE ATENDIMENTO RECEBIDO:", JSON.stringify(texto));

    const textoNormalizado = texto
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // ==========================================
    // DEVOLVER CLIENTE PARA IA
    // ==========================================

    if (textoNormalizado.startsWith("#ia ")) {
      const partes = textoNormalizado.split(/\s+/);

      if (partes.length !== 2) {
        return "❌ Formato inválido.\n\nUse:\n*#ia 557781200350*";
      }

      const telefone = partes[1];

      try {
        const cliente = await prisma.cliente.findUnique({
          where: {
            telefone,
          },
        });

        if (!cliente) {
          return `❌ Cliente com telefone ${telefone} não encontrado.`;
        }

        const clienteAtualizado =
          await this.alterarModoAtendimentoService.voltarParaIA(cliente.id);

        console.log(`🤖 CLIENTE DEVOLVIDO PARA IA: ${clienteAtualizado.nome}`);

        return (
          `🤖 *Atendimento devolvido para a Hélia!*\n\n` +
          `👤 Cliente: ${clienteAtualizado.nome}\n` +
          `📱 Telefone: ${clienteAtualizado.telefone}\n` +
          `📌 Modo: ${clienteAtualizado.modoAtendimento}`
        );
      } catch (error) {
        if (error instanceof Error) {
          return `❌ ${error.message}`;
        }

        return "❌ Não foi possível alterar o modo de atendimento.";
      }
    }

    return null;
  }
}

export { ProcessarComandoAtendimentoService };
