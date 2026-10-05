import { createBairroService } from "./createNeighborhoodService.js";
import { listNeighborhoodService } from "./listNeighborhoodService.js";

class ProcessarComandoBairroService {
  private createBairroService: createBairroService;
  private listNeighborhoodService: listNeighborhoodService;

  constructor() {
    this.createBairroService = new createBairroService();
    this.listNeighborhoodService = new listNeighborhoodService();
  }

  async execute(texto: string): Promise<string | null> {
    const textoNormalizado = texto
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // ==========================================
    // LISTAR BAIRROS
    // ==========================================

    if (textoNormalizado === "#bairros") {
      const bairros = await this.listNeighborhoodService.execute();

      if (bairros.length === 0) {
        return "📍 Nenhum bairro cadastrado.";
      }

      const lista = bairros
        .map(
          (bairro) =>
            `📍 *${bairro.nome}* — R$ ${Number(bairro.taxaEntrega)
              .toFixed(2)
              .replace(".", ",")}`,
        )
        .join("\n");

      return "📍 *Bairros cadastrados:*\n\n" + lista;
    }

    // ==========================================
    // CADASTRAR BAIRRO
    // ==========================================

    if (textoNormalizado.startsWith("#bairro ")) {
      const comando = texto.trim();

      const conteudo = comando.slice("#bairro ".length).trim();

      const partes = conteudo.split(/\s+/);

      if (partes.length < 2) {
        return "❌ Formato inválido.\n\n" + "Use:\n" + "*#bairro Patagônia 5*";
      }

      const taxaTexto = partes.pop()!;
      const nome = partes.join(" ");

      const taxaEntrega = Number(taxaTexto.replace(",", "."));

      if (!nome || !Number.isFinite(taxaEntrega) || taxaEntrega < 0) {
        return "❌ Dados inválidos.\n\n" + "Use:\n" + "*#bairro Patagônia 5*";
      }

      try {
        console.log("📍 CADASTRANDO BAIRRO");
        console.log("Nome:", nome);
        console.log("Taxa:", taxaEntrega);

        const bairro = await this.createBairroService.execute({
          nome,
          taxaEntrega,
        });

        console.log("✅ Bairro cadastrado:", bairro.id);

        return (
          "✅ *Bairro cadastrado!*\n\n" +
          `📍 *${bairro.nome}*\n` +
          `🚚 Taxa de entrega: R$ ${Number(bairro.taxaEntrega)
            .toFixed(2)
            .replace(".", ",")}`
        );
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "Este bairro já está cadastrado."
        ) {
          return "⚠️ Este bairro já está cadastrado.";
        }

        console.error("❌ Erro ao cadastrar bairro:", error);

        return (
          "❌ Não consegui cadastrar o bairro.\n" +
          "Verifique o erro no servidor."
        );
      }
    }

    return null;
  }
}

export { ProcessarComandoBairroService };
