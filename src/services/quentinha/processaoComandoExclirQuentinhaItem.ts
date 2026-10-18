import { ExcluirOpcaoQuentinhaService } from "./excluirOpcaoQuentinhaService.js";

class ProcessarComandoExcluirQuentinha {
  private excluirQuentinha = new ExcluirOpcaoQuentinhaService();

  async execulte(texto: string) {
    const comando = "#deletar-item";

    const textoNormalizado = texto
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (
      textoNormalizado !== comando &&
      !textoNormalizado.startsWith(`${comando} `)
    ) {
      return null;
    }

    const nome = texto.trim().slice(comando.length).trim();

    if (!nome) {
      return (
        "❌ Formato inválido.\n\n" +
        "Use:\n" +
        "*#deletar-item Frango grelhado*\n" +
        "ou\n" +
        "*#deletar-item Lasanha*"
      );
    }

    try {
      const item = await this.excluirQuentinha.executar(nome);

      console.log("✅ Item removido do cardápio:", item);

      return (
        "✅ *Item removido do cardápio!*\n\n" +
        `📦 *${item.nome}*\n` +
        `🌙 Período: ${item.periodo}\n\n` +
        "O item não está mais disponível no cardápio atual."
      );
    } catch (error) {
      console.error("❌ Erro ao remover item:", error);

      if (error instanceof Error) {
        if (error.message === "Item não encontrado no cardápio ativo.") {
          return "⚠️ Este item não está disponível no cardápio atual.";
        }

        if (error.message === "Não existe cardápio ativo para este período.") {
          return "⚠️ Não existe cardápio ativo neste período.";
        }
      }

      return "❌ Não consegui remover o item. Verifique o servidor.";
    }
  }
}

export { ProcessarComandoExcluirQuentinha };
