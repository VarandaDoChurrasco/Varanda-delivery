import { DeepSeekService } from "./deepseek.service.js";
import {
  consultarCardapioTool,
  executarConsultarCardapio,
} from "./tools/consultarCardapio.tool.js";

import { executarObterCliente } from "./tools/obterCliente.tool.js";

import {
  obterCarrinhoTool,
  executarObterCarrinho,
} from "./tools/obterCarrinho.tool.js";

import {
  adicionarQuentinhaTool,
  executarAdicionarQuentinha,
} from "./tools/adicionarQuentinha.tool.js";

import {
  adicionarEscolhaTool,
  executarAdicionarEscolha,
} from "./tools/adicionarEscolha.tool.js";

import {
  calcularCheckoutTool,
  executarCalcularCheckout,
} from "./tools/calcularCheckout.tool.js";

import {
  criarPedidoTool,
  executarCriarPedido,
} from "./tools/criarPedido.tool.js";

import {
  confirmarPedidoTool,
  executarConfirmarPedido,
} from "./tools/confirmarPedido.tool.js";
import { GetClientRequest } from "../../type/type.js";
import {
  consultarBairrosTool,
  executarConsultarBairros,
} from "./tools/consultar_bairros.js";
import {
  consultarBairroPorIdTool,
  executarConsultarBairroPorId,
} from "./tools/consult_id_bairro.js";

import {
  consultarRefrigerantesTool,
  executarConsultarRefrigerantes,
} from "./tools/consultarRefrigerantes.tool.js";

import {
  adicionarRefrigeranteTool,
  executarAdicionarRefrigerante,
} from "./tools/adicionarRefrigerante.tool.js";

class HeliaService {
  private deepSeekService: DeepSeekService;
  private tools = [
    consultarCardapioTool,
    obterCarrinhoTool,
    adicionarQuentinhaTool,
    adicionarEscolhaTool,
    calcularCheckoutTool,
    consultarBairrosTool,
    consultarBairroPorIdTool,
    criarPedidoTool,
    confirmarPedidoTool,
    consultarRefrigerantesTool,
    adicionarRefrigeranteTool,
  ];

  constructor() {
    this.deepSeekService = new DeepSeekService();
  }

  private async executarTool(
    nome: string,
    args: any,
    //cliente?: GetClientRequest | null,
  ) {
    switch (nome) {
      case "consultar_cardapio":
        return await executarConsultarCardapio();

      //  case "obter_cliente":
      //  return await executarObterCliente(args);

      case "obter_carrinho":
        return await executarObterCarrinho(args);

      case "adicionar_quentinha":
        return await executarAdicionarQuentinha(args);

      case "adicionar_escolha":
        return await executarAdicionarEscolha(args);

      case "calcular_checkout":
        return await executarCalcularCheckout(args);

      case "consultar_refrigerantes":
        return await executarConsultarRefrigerantes();

      case "adicionar_refrigerante":
        return await executarAdicionarRefrigerante(args);

      case "criar_pedido":
        return await executarCriarPedido(args);

      case "confirmar_pedido":
        return await executarConfirmarPedido(args);

      case "consultar_bairro_por_id":
        return await executarConsultarBairroPorId(args.id);

      case "consultar_bairros":
        return await executarConsultarBairros();

      default:
        return {
          success: false,
          error: `Ferramenta desconhecida: ${nome}`,
        };
    }
  }

  async processarMensagem(
    mensagem: string,
    historico: any[] = [],
    cliente?: GetClientRequest | null,
  ) {
    const contextoCliente = cliente
      ? `
   
    CLIENTE ATUAL:
    Nome: ${cliente.nome ?? "Cliente"}
    Id: ${cliente.id}
    telefone: ${cliente.telefone}
    
O cliente já foi identificado pelo sistema.
Não peça nem tente descobrir o nome, telefone ou ID do cliente.
Use o ID do cliente fornecido acima quando uma ferramenta precisar de clienteId.

Use o nome do cliente naturalmente quando fizer sentido.
    
    `
      : "";

    const messages: any[] = [
      {
        role: "system",
        content: `
Você é Hélia, atendente da Varanda do Churrasco J.H.

Atenda o cliente de forma natural, simpática e objetiva,
em português do Brasil, como uma conversa pelo WhatsApp.

REGRAS:

- Nunca invente produtos, preços ou opções.
- Quando o cliente perguntar sobre o cardápio, consulte a ferramenta consultar_cardapio.
- O cardápio muda diariamente.
- Use somente informações retornadas pela ferramenta.
- Faça apenas uma pergunta por vez.
- Use mensagens curtas e naturais.
- Use emojis com moderação.
- Nunca diga que é uma inteligência artificial.
- Não converse sobre assuntos que não tenham relação com a Varanda do Churrasco J.H.

As quentinhas possuem:

- Pequena: R$ 15,00 e máximo de 1 proteína.
- Média: R$ 20,00 e máximo de 2 proteínas.
- Grande: R$ 26,00 e máximo de 2 proteínas.

Os acompanhamentos são escolhidos livremente pelo cliente.

O cliente pode escolher um ou vários acompanhamentos disponíveis no cardápio.

Não presuma que todos os acompanhamentos serão incluídos.

Quando chegar o momento de escolher os acompanhamentos,
mostre as opções disponíveis e pergunte quais o cliente deseja.

## REFRIGERANTES

A Varanda do Churrasco J.H. também oferece refrigerantes.

REGRAS:

  Os refrigerantes são opcionais e nunca devem ser adicionados automaticamente ao pedido.

 Depois que o cliente terminar de escolher a quentinha,
   proteínas, acompanhamentos e saladas, antes de finalizar o pedido,
   SEMPRE consulte a ferramenta 'consultar_refrigerantes'.

 Se houver refrigerantes disponíveis, ofereça-os ao cliente de forma
   natural, mesmo que ele não tenha perguntado sobre bebidas.

 Sempre consulte a ferramenta antes de informar nomes, tamanhos ou preços.

 Nunca invente refrigerantes, tamanhos ou preços.

 Mostre as opções disponíveis e seus respectivos preços.

 Se o cliente quiser um refrigerante, utilize a ferramenta apropriada
   para adicioná-lo ao carrinho.

 Se o cliente disser que não quer refrigerante, não insista e continue
   normalmente com a finalização do pedido.

Se não houver refrigerantes disponíveis, não ofereça.

 Refrigerante é um produto separado da quentinha. Não trate como
    acompanhamento, proteína ou salada.

 Nunca diga que um refrigerante foi adicionado ao pedido sem executar
    a ferramenta responsável por adicioná-lo ao carrinho.

Quando precisar saber as opções disponíveis hoje,
use a ferramenta consultar_cardapio.


${contextoCliente}
        `,
      },
      ...historico,
      {
        role: "user",
        content: mensagem,
      },
    ];

    let resposta = await this.deepSeekService.criarRespostaComTools(
      messages,
      this.tools,
    );

    while (true) {
      const message = resposta.choices[0]?.message;

      if (!message) {
        throw new Error("DeepSeek não retornou uma resposta.");
      }

      // Se não pediu nenhuma ferramenta,
      // finalmente temos a resposta para o cliente.
      if (!message.tool_calls || message.tool_calls.length === 0) {
        return message.content || "";
      }

      // Adiciona a mensagem do assistente que contém os tool_calls
      messages.push(message);

      console.log("🔧 TOOL CALLS:", message.tool_calls);

      // Executa todas as ferramentas solicitadas
      for (const toolCall of message.tool_calls) {
        if (toolCall.type !== "function") continue;

        const nome = toolCall.function.name;

        let args: any = {};

        try {
          args = JSON.parse(toolCall.function.arguments || "{}");
        } catch {
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              success: false,
              error: `Argumentos inválidos para a ferramenta ${nome}.`,
            }),
          });
          continue; // pula essa tool, segue o loop
        }

        //  if (!cliente?.id) {
        // throw new Error("Cliente não identificado.");
        // }

        if (!cliente?.id) {
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              success: false,
              error: "Cliente não identificado. Peça o nome e telefone.",
            }),
          });
          continue;
        }

        const argumentosComCliente = {
          ...args,
          clienteId: cliente.id,
        };

        console.log("🔧 TOOL:", nome);
        console.log("🔧 ARGUMENTOS:", argumentosComCliente);

        // const resultado = await this.executarTool(nome, argumentosComCliente);
        let resultado: any;

        try {
          resultado = await this.executarTool(nome, argumentosComCliente);
        } catch (error) {
          console.error(`Erro na tool ${nome}:`, error);
          resultado = {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Erro ao executar ferramenta",
          };
        }

        console.log("🔧 TOOL RESULT:", resultado);

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(resultado),
        });
      }

      // IMPORTANTE:
      // O DeepSeek pode pedir OUTRAS tools aqui.
      resposta = await this.deepSeekService.criarRespostaComTools(
        messages,
        this.tools,
      );
      //================================
    }
  }
}
export { HeliaService };
