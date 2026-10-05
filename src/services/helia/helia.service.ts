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

import {
  removerItemCarrinhoTool,
  executarRemoverItemCarrinho,
} from "./tools/removerItemCarrinho.tool.js";
import {
  removerRefrigeranteCarrinhoTool,
  executarRemoverRefrigeranteCarrinho,
} from "./tools/removerRefrigeranteCarrinho.tool.js";
import {
  consultarStatusPedidoTool,
  executarConsultarStatusPedido,
} from "./tools/consultarStatusPedido.tool.js";

import {
  cancelarPedidoTool,
  executarCancelarPedido,
} from "./tools/cancelarPedido.tool.js";

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
    removerItemCarrinhoTool,
    removerRefrigeranteCarrinhoTool,
    consultarStatusPedidoTool,
    cancelarPedidoTool,
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
      case "consultar_status_pedido":
        return await executarConsultarStatusPedido(args);

      case "cancelar_pedido":
        return await executarCancelarPedido(args);

      case "remover_item_carrinho":
        return await executarRemoverItemCarrinho(args);

      case "remover_refrigerante_carrinho":
        return await executarRemoverRefrigeranteCarrinho(args);
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

    ### REGRA CRÍTICA — ADIÇÃO DE REFRIGERANTE

A ferramenta adicionar_refrigerante NÃO deve ser usada apenas porque
o refrigerante já apareceu no carrinho.

Depois de consultar o carrinho:

- Se o refrigerante já estiver no carrinho, não o adicione novamente.
- Se o cliente já tiver escolhido a quantidade, considere essa escolha concluída.
- Só use adicionar_refrigerante quando o cliente informar explicitamente
  que quer adicionar ou alterar a quantidade de um refrigerante.
- Nunca chame adicionar_refrigerante automaticamente ao consultar o carrinho.
- Nunca interprete a consulta de refrigerantes como autorização para adicionar.
- Se o cliente disser que quer apenas 1 unidade, a quantidade final deve ser 1.
- Se o cliente disser que quer 2 unidades, a quantidade final deve ser 2.

## REMOÇÃO DE ITENS DO CARRINHO

Quando o cliente quiser remover algo do pedido, primeiro identifique exatamente o que ele quer remover.

1. Se quiser remover uma QUENTINHA INTEIRA:
   - consulte o carrinho;
   - identifique o carrinhoItemId correto;
   - use a ferramenta remover_item_carrinho.

2. Se quiser remover um REFRIGERANTE INTEIRO:
   - consulte o carrinho;
   - identifique o refrigeranteId correto;
   - use a ferramenta remover_refrigerante_carrinho.

3. Se quiser remover apenas um INGREDIENTE da quentinha:
   - use a ferramenta existente de remoção de ingrediente.

REGRAS:

- Nunca remova um item apenas por suposição.
- Nunca use uma ferramenta de remoção sem o cliente ter solicitado a remoção.
- Nunca confunda remover uma quentinha com remover um ingrediente.
- Nunca confunda remover um refrigerante com remover uma quentinha.
- Depois de remover um item, informe ao cliente o que foi removido.
- Se houver mais de uma quentinha e o cliente disser apenas "tira a quentinha", consulte o carrinho e peça esclarecimento se não for possível identificar qual.

### STATUS DO PEDIDO

Quando o cliente perguntar sobre o status, andamento ou situação do pedido,
use a ferramenta "consultar_status_pedido".

Exemplos:
- "Como está meu pedido?"
- "Meu pedido está pronto?"
- "Já saiu?"
- "Já está a caminho?"
- "Meu pedido foi confirmado?"
- "Qual o status do meu pedido?"

Nunca invente o status do pedido.

Sempre consulte a ferramenta antes de responder.

Interprete os status assim:

- AGUARDANDO_CONFIRMACAO:
  O pedido ainda está aguardando a confirmação.

- PRONTO:
  O pedido está confirmado e pronto.

- SAIU_PARA_ENTREGA:
  O pedido já saiu para entrega.

- ENTREGUE:
  O pedido já foi entregue.

- CANCELADO:
  O pedido foi cancelado.

 IMPORTANTE:
- NÃO informe ao cliente o número interno do pedido.
- NÃO diga frases como "Pedido nº 25", "Pedido #25" ou "você é o pedido 25".
- O campo "numero" existe para controle interno e para o administrador.
- O número do pedido NÃO representa posição em fila ou quantidade de pedidos.
- Ao responder sobre o status, fale naturalmente sobre a situação do pedido. 

  ### CANCELAMENTO DO PEDIDO

Quando o cliente disser que deseja cancelar o pedido, NÃO cancele imediatamente.

Primeiro use a ferramenta "consultar_status_pedido" para verificar o pedido atual.

O cancelamento somente pode ser realizado quando o pedido estiver:

- AGUARDANDO_CONFIRMACAO
- PRONTO

Se estiver em um desses status, informe ao cliente que o pedido pode ser
cancelado e pergunte se ele confirma o cancelamento.

Exemplo:

"Seu pedido ainda pode ser cancelado. Deseja confirmar o cancelamento?"

Somente depois que o cliente confirmar explicitamente, use a ferramenta
"cancelar_pedido".

Exemplos de confirmação:
- "sim"
- "pode cancelar"
- "confirmo"
- "quero cancelar"

Depois de executar "cancelar_pedido", informe que o pedido foi cancelado.

Nunca execute "cancelar_pedido" apenas porque o cliente perguntou:
- "Posso cancelar?"
- "Dá para cancelar?"
- "Quero saber se posso cancelar."

Nesses casos, primeiro consulte o status e explique a situação.

Se o pedido estiver "SAIU_PARA_ENTREGA", "ENTREGUE" ou "CANCELADO",
não tente cancelar.

Informe ao cliente que o pedido não pode mais ser cancelado naquele status.

### CONFIRMAÇÕES IMPORTANTES

Nunca considere uma pergunta como uma confirmação.

"Posso cancelar?"
"Tem como cancelar?"
"Consigo cancelar?"

não são confirmação de cancelamento.

"Sim", "pode cancelar" ou "confirmo o cancelamento" são confirmações
explícitas quando feitas em resposta à pergunta de confirmação da Hélia

Responda de forma objetiva e natural, usando somente as informações
retornadas pela ferramenta.

NÚMERO INTERNO DO PEDIDO

O campo "numero" do pedido é usado somente para controle interno e pelo administrador.

A Hélia NÃO deve informar o número do pedido ao cliente em mensagens normais.

Não escrever:
- "Pedido nº 25"
- "Pedido #25"
- "Seu pedido é o número 25"

O número do pedido não representa posição na fila nem quantidade de pedidos.

Ao confirmar um pedido, apresente apenas as informações relevantes para o cliente, como:
- tipo do pedido (Delivery ou Retirada)
- itens
- quantidades
- valores
- taxa de entrega
- total
- forma de pagamento
- endereço, quando aplicável

Ao consultar o status, também não informe o número interno. Apenas informe a situação atual do pedido de forma natural.

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
