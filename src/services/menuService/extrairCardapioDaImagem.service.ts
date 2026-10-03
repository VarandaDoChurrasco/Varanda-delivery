import { DeepSeekService } from "../helia/deepseek.service.js";

export type CardapioExtraido = {
  acompanhamentos: string[];
  proteinas: string[];
  saladas: string[];
  alertas: string[];
};

class ExtrairCardapioDaImagemService {
  private deepSeekService: DeepSeekService;

  constructor() {
    this.deepSeekService = new DeepSeekService();
  }

  async execute(imagemBase64: string): Promise<CardapioExtraido> {
    if (!imagemBase64) {
      throw new Error("Imagem do cardápio não informada.");
    }

    const prompt = `
Você é responsável por interpretar imagens de cardápios
do restaurante Varanda do Churrasco J.H.

Sua tarefa é ler a imagem e identificar os itens do cardápio.

Classifique os itens SOMENTE nestas categorias:

- acompanhamentos
- proteinas
- saladas

REGRAS OBRIGATÓRIAS:

1. NÃO invente nenhum item.
2. NÃO invente preços.
3. NÃO invente ingredientes.
4. NÃO altere os nomes dos itens sem necessidade.
5. Ignore logotipo.
6. Ignore slogans.
7. Ignore frases de propaganda.
8. Ignore textos institucionais.
9. Ignore imagens decorativas.
10. "Marmitas 15 | 20 | 26" NÃO é uma lista de produtos.
11. Não coloque os preços das marmitas em nenhuma categoria.
12. Se uma categoria não tiver itens claramente identificáveis,
    retorne um array vazio.
13. Se algum texto estiver ilegível ou houver dúvida,
    NÃO tente adivinhar.
14. Quando houver dúvida, coloque a dúvida no array "alertas".
15. Retorne SOMENTE JSON válido.
16. Não use markdown.
17. Não coloque texto antes ou depois do JSON.

Formato obrigatório:

{
  "acompanhamentos": [],
  "proteinas": [],
  "saladas": [],
  "alertas": []
}
`;

    const resposta = await this.deepSeekService.analisarImagem(
      imagemBase64,
      prompt,
    );

    console.log("🖼️ RESPOSTA BRUTA DA IA:");
    console.log(resposta);

    let resultado: unknown;

    try {
      resultado = JSON.parse(resposta);
    } catch {
      throw new Error("A IA não retornou um JSON válido.");
    }

    return this.validarResultado(resultado);
  }

  private validarResultado(resultado: unknown): CardapioExtraido {
    if (
      !resultado ||
      typeof resultado !== "object" ||
      Array.isArray(resultado)
    ) {
      throw new Error("Resposta da IA inválida.");
    }

    const dados = resultado as Record<string, unknown>;

    return {
      acompanhamentos: this.normalizarLista(dados.acompanhamentos),

      proteinas: this.normalizarLista(dados.proteinas),

      saladas: this.normalizarLista(dados.saladas),

      alertas: this.normalizarLista(dados.alertas),
    };
  }

  private normalizarLista(valor: unknown): string[] {
    if (!Array.isArray(valor)) {
      return [];
    }

    return valor
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

export { ExtrairCardapioDaImagemService };
