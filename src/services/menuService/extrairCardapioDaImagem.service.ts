import { DeepSeekService } from "../helia/deepseek.service.js";

/*export type CardapioExtraido = {
  acompanhamentos: string[];
  proteinas: string[];
  saladas: string[];
  alertas: string[];
};
*/
//================================================

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
Você é responsável por interpretar imagens dos cardápios
do restaurante Varanda do Churrasco J.H.

Sua tarefa é ler a imagem e identificar todos os itens
comerciais e as opções alimentares apresentados no cardápio.

O restaurante possui dois tipos de cardápio:

1. QUENTINHAS:
   - acompanhamentos
   - proteínas
   - saladas
   - tamanhos e preços das quentinhas, quando estiverem legíveis

2. PRODUTOS INDIVIDUAIS:
   - pratos e alimentos vendidos individualmente,
     como lasanha, sopa de aipim e outros produtos
   - preço de cada produto, somente quando estiver claramente indicado
   - descrição do produto, somente quando estiver escrita na imagem

REGRAS OBRIGATÓRIAS:

1. NÃO invente itens, preços, ingredientes ou descrições.
2. NÃO altere os nomes dos itens sem necessidade.
3. NÃO transforme acompanhamentos, proteínas ou saladas
   em produtos individuais sem evidência na imagem.
4. Itens apresentados como opções para montar uma quentinha
   devem ficar nas categorias acompanhamentos, proteinas ou saladas.
5. Alimentos apresentados como pratos ou produtos vendidos
   individualmente devem entrar no array produtos.
6. NÃO considere os valores dos tamanhos das quentinhas
   como preços de produtos individuais.
7. Ignore logotipos, slogans, propagandas e textos institucionais.
8. Ignore imagens decorativas que não permitam identificar um item.
9. Se um produto estiver claramente identificado, mas seu preço
   não estiver visível, use null no campo preco.
10. Se uma descrição não estiver informada, use null no campo descricao.
11. Se uma categoria não tiver itens identificáveis,
    retorne um array vazio.
12. Se algum texto estiver ilegível ou houver dúvida,
    NÃO tente adivinhar. Registre a dúvida em alertas.
13. Evite cadastrar o mesmo item mais de uma vez na mesma categoria.
14. Preserve os nomes conforme aparecem na imagem.
15. Retorne SOMENTE JSON válido.
16. NÃO use markdown.
17. NÃO coloque texto antes ou depois do JSON.

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

O campo preco deve ser um número, sem símbolo de moeda,
ou null quando o preço não estiver claramente informado.

O campo descricao deve ser uma string ou null.

Os arrays acompanhamentos, proteinas e saladas devem conter
somente strings com os nomes dos itens.

Se não houver produtos individuais, retorne "produtos": [].
`;

    //==================================================================================
    /* const prompt = `
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
`;   */
    //======================================================

    /*   const resposta = await this.deepSeekService.analisarImagem(
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
}*/

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
          typeof (item as Record<string, unknown>).nome === "string",
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

    return valor
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

export { ExtrairCardapioDaImagemService };
