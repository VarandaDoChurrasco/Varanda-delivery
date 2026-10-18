import { DeepSeekService } from "../helia/deepseek.service.js";

export type ProdutoExtraido = {
  nome: string;
  preco: number | null;
  descricao: string | null;
};

export type CardapioExtraido = {
  produtos: ProdutoExtraido[];
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
Você interpreta imagens dos cardápios do restaurante
Varanda do Churrasco J.H.

Extraia apenas informações que estejam presentes na imagem.

O restaurante trabalha com três formatos de refeições:

1. QUENTINHAS DO ALMOÇO
- São montadas com proteínas, acompanhamentos e saladas.
- Existem tamanhos e preços próprios.
- As opções de montagem devem ser separadas por categoria.
- Não transforme cada proteína em um produto individual.

2. JANTINHAS DA NOITE
- Também são montadas com proteínas, acompanhamentos e saladas.
- Jantinha P: R$ 15,00, até 1 proteína.
- Jantinha M: R$ 20,00, até 2 proteínas.
- As proteínas não possuem preços individuais por tipo de carne.
- Não transforme cada proteína ou salada em produto individual.
- Não cadastre Jantinha P e Jantinha M no array produtos.
- O sistema cadastra os dois tamanhos separadamente.

3. PRODUTOS INDIVIDUAIS
- São pratos vendidos separadamente, como lasanha,
  espaguete, sopa de aipim, batata recheada e escondidinho.
- Cada produto deve ter seu nome e preço quando visível.
- Não invente ingredientes, preços ou descrições.

REGRAS OBRIGATÓRIAS:

1. Não invente produtos, ingredientes ou preços.
2. Preserve os nomes conforme aparecem na imagem.
3. Não transforme opções de montagem em produtos individuais.
4. Não utilize o preço de uma jantinha como preço de uma proteína.
5. Não utilize preços de quentinhas como preços de produtos individuais.
6. Retorne proteínas, acompanhamentos e saladas em arrays separados.
7. Quando não houver preço legível de um produto, utilize null.
8. Quando não houver descrição, utilize null.
9. Não inclua imagens decorativas, propagandas ou logotipos.
10. Se houver texto ilegível, registre em alertas.
11. Não repita itens dentro da mesma categoria.
12. Se uma categoria não tiver itens, retorne um array vazio.
13. Não acrescente produtos apenas porque são exemplos deste prompt.
14. Retorne somente JSON válido, sem markdown.

FORMATO OBRIGATÓRIO:

{
  "produtos": [
    {
      "nome": "Nome do produto",
      "preco": null,
      "descricao": null
    }
  ],
  "acompanhamentos": [],
  "proteinas": [],
  "saladas": [],
  "alertas": []
}

O campo preco deve ser um número ou null.
O campo descricao deve ser uma string ou null.
Os arrays de acompanhamentos, proteínas e saladas
devem conter somente strings.

Se não houver produtos individuais, retorne "produtos": [].
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
      produtos: this.normalizarProdutos(dados.produtos),
      acompanhamentos: this.normalizarLista(dados.acompanhamentos),
      proteinas: this.normalizarLista(dados.proteinas),
      saladas: this.normalizarLista(dados.saladas),
      alertas: this.normalizarLista(dados.alertas),
    };
  }

  private normalizarProdutos(valor: unknown): ProdutoExtraido[] {
    if (!Array.isArray(valor)) {
      return [];
    }

    return valor
      .filter(
        (item): item is Record<string, unknown> =>
          typeof item === "object" &&
          item !== null &&
          !Array.isArray(item) &&
          typeof item.nome === "string",
      )
      .map((item) => {
        const preco = item.preco;
        const descricao = item.descricao;

        return {
          nome: (item.nome as string).trim(),

          preco:
            typeof preco === "number" && Number.isFinite(preco) && preco >= 0
              ? preco
              : null,

          descricao:
            typeof descricao === "string" && descricao.trim()
              ? descricao.trim()
              : null,
        };
      })
      .filter((produto) => produto.nome.length > 0);
  }

  private normalizarLista(valor: unknown): string[] {
    if (!Array.isArray(valor)) {
      return [];
    }

    return [
      ...new Set(
        valor
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    ];
  }
}

export { ExtrairCardapioDaImagemService };
