import { ExcluirOpcaoQuentinhaService } from "./excluirOpcaoQuentinhaService.js";

class ProcessarComandoExcluirQuentinha {
  private excluirQuentinha: ExcluirOpcaoQuentinhaService;

  constructor() {
    this.excluirQuentinha = new ExcluirOpcaoQuentinhaService();
  }

  async execulte(texto: string) {
    const textoNormalizado = texto
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (textoNormalizado.startsWith("#deleta-item ")) {
      const comando = texto.trim();
      const conteudo = comando.slice("#deletar-item ".length).trim();
      const partes = conteudo.split(/\s+/);

      if (partes.length < 2) {
        return (
          "❌ Formato inválido.\n\n" +
          "Use:\n" +
          "*#deletar-item frando assado*"
        );
      }

      const taxaTexto = partes.pop()!;
      const nome = partes.join(" ");

      const taxaEntrega = Number(taxaTexto.replace(",", "."));

      if (!nome || !Number.isFinite(taxaEntrega) || taxaEntrega < 0) {
        return (
          "❌ Dados inválidos.\n\n" + "Use:\n" + "*#deletar-item frando assado*"
        );
      }

      try {
        console.log("📍 CADASTRANDO BAIRRO");
        console.log("Nome:", nome);
        console.log("Taxa:", taxaEntrega);

        const bairro = await this.excluirQuentinha.executar(nome);

        console.log("✅ item excluido:", bairro.id);

        return (
          "✅ *Item excluido!*\n\n" +
          `📍 *${bairro.nome}*\n
            .toFixed(2)
            .replace(".", ",")}`
        );
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "O Item nao esta na lista."
        ) {
          return "⚠️ Este item nao existe.";
        }

        console.error("❌ Erro ao cadastrar bairro:", error);

        return "❌ Não consegui excluir.\n" + "Verifique o erro no servidor.";
      }
    }
    return null;
  }
}

export { ProcessarComandoExcluirQuentinha };
