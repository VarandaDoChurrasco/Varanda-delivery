import { CadastrarRefrigeranteService } from "./cadastrarRefrigeranteService.js";
import { ConsultarListRefrigerantesService } from "./consultarListRefrigerantesController.js";

class ProcessarComandoRefrigeranteService {
  private cadastrarRefrigeranteService: CadastrarRefrigeranteService;
  private consultarListaRefrigerantesService: ConsultarListRefrigerantesService;

  constructor() {
    this.cadastrarRefrigeranteService = new CadastrarRefrigeranteService();

    this.consultarListaRefrigerantesService =
      new ConsultarListRefrigerantesService();
  }

  async execute(texto: string): Promise<string | null> {
    console.log("🥤 COMANDO REFRIGERANTE RECEBIDO:", JSON.stringify(texto));
    const textoNormalizado = texto
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // ==========================================
    // LISTAR REFRIGERANTES
    // ==========================================

    if (
      textoNormalizado === "#refrigerantes" ||
      textoNormalizado === "#lista refrigerantes"
    ) {
      const refrigerantes =
        await this.consultarListaRefrigerantesService.execute();
      console.log("📋 COMANDO DE LISTAR REFRIGERANTES DETECTADO");
      if (refrigerantes.length === 0) {
        return "🥤 Nenhum refrigerante cadastrado.";
      }

      const lista = refrigerantes
        .map(
          (refrigerante) =>
            `🥤 *${refrigerante.nome}* — R$ ${Number(refrigerante.preco)
              .toFixed(2)
              .replace(".", ",")}`,
        )
        .join("\n");

      return "🥤 *Refrigerantes cadastrados:*\n\n" + lista;
    }

    // ==========================================
    // CADASTRAR REFRIGERANTE
    // ==========================================

    if (textoNormalizado.startsWith("#refrigerante ")) {
      const comando = texto.trim();

      const conteudo = comando.slice("#refrigerante ".length).trim();

      const partes = conteudo.split(/\s+/);

      if (partes.length < 2) {
        return (
          "❌ Formato inválido.\n\n" + "Use:\n" + "*#refrigerante Coca-Cola 10*"
        );
      }

      const precoTexto = partes.pop()!;
      const nome = partes.join(" ");

      const preco = Number(precoTexto.replace(",", "."));

      if (!nome || !Number.isFinite(preco) || preco <= 0) {
        return (
          "❌ Dados inválidos.\n\n" + "Use:\n" + "*#refrigerante Coca-Cola 10*"
        );
      }

      console.log("🥤 CADASTRANDO REFRIGERANTE");
      console.log("Nome:", nome);
      console.log("Preço:", preco);

      const refrigerante = await this.cadastrarRefrigeranteService.execute({
        nome,
        preco,
      });

      console.log("✅ Refrigerante cadastrado:", refrigerante.id);

      return (
        "✅ *Refrigerante cadastrado!*\n\n" +
        `🥤 *${refrigerante.nome}*\n` +
        `💰 R$ ${Number(refrigerante.preco).toFixed(2).replace(".", ",")}`
      );
    }

    return null;
  }
}

export { ProcessarComandoRefrigeranteService };
