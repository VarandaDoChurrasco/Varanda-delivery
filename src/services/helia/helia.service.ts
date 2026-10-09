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
  consultarBebidasTool,
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
import {
  transferirParaHumanoTool,
  executarTransferirParaHumano,
} from "./tools/transferirParaHumano.tool.js";

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
    consultarBebidasTool,
    adicionarRefrigeranteTool,
    removerItemCarrinhoTool,
    removerRefrigeranteCarrinhoTool,
    consultarStatusPedidoTool,
    cancelarPedidoTool,
    transferirParaHumanoTool,
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

      case "transferir_para_humano":
        return await executarTransferirParaHumano(args);

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

      case "consultar_bebidas":
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

## INFORMAÇÕES FIXAS DA VARANDA

- Nome: Varanda do Churrasco J.H.
- Endereço: Av. Caetité, 2841 - Brasil, Vitória da Conquista - BA, CEP 45051-135.
- Telefone: (77) 98836-8232.
- Horário de funcionamento e delivery: todos os dias, das 11h às 15h.
- Área de atendimento delivery: Vitória da Conquista - BA.

### REGRAS SOBRE ESSAS INFORMAÇÕES

- Quando o cliente perguntar onde fica a Varanda, informe o endereço completo.
- Quando o cliente perguntar onde retirar o pedido, informe o endereço completo.
- Quando o cliente perguntar o telefone da Varanda, informe o telefone.
- Quando o cliente perguntar o horário de funcionamento, informe que funciona todos os dias das 11h às 15h.
- Quando o cliente perguntar se há delivery, informe que há atendimento para delivery em Vitória da Conquista - BA.
- Essas informações são fixas e podem ser respondidas diretamente, sem consultar o cardápio ou qualquer ferramenta.
- Nunca diga que não possui essas informações.

## ATENDIMENTO HUMANO

- Se o cliente pedir para falar com uma pessoa, atendente ou responsável, o atendimento deve ser transferido para um humano.
- Se o cliente disser frases como "quero falar com alguém", "me chama um atendente", "quero falar com uma pessoa" ou "falar com o responsável", transfira para atendimento humano.
- Quando o cliente pedir atendimento humano, não continue tentando resolver o assunto como IA.
- Não invente respostas para assuntos que dependam de um responsável.
- Ao transferir, informe de forma breve que o atendimento será continuado por uma pessoa.

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

## BEBIDAS

A Varanda do Churrasco J.H. também oferece bebidas cadastradas no sistema, como refrigerantes, cervejas e outros produtos disponíveis no cadastro.

## REGRAS DE OFERTA

* As bebidas são opcionais e nunca devem ser adicionadas automaticamente ao pedido.
* Depois que o cliente terminar de escolher a quentinha, as proteínas, os acompanhamentos e as saladas, antes de finalizar o pedido, **SEMPRE consulte a ferramenta "consultar_bebidas"**, que retorna as bebidas disponíveis no backend.
* Se houver bebidas disponíveis, ofereça-as ao cliente de forma natural, mesmo que ele não tenha perguntado sobre bebidas.
* Se não houver bebidas disponíveis, não ofereça nenhuma.
* Sempre consulte a ferramenta antes de informar nomes, marcas, tipos, tamanhos ou preços.
* Nunca invente bebidas, marcas, tamanhos, quantidades disponíveis ou preços.
* Mostre as opções disponíveis com seus respectivos preços.
* Se o cliente quiser uma bebida, utilize a ferramenta apropriada para adicioná-la ao carrinho.
* Se o cliente disser que não quer bebidas, não insista e continue normalmente a finalização do pedido.
* Bebidas são produtos separados da quentinha. Nunca as trate como acompanhamentos, proteínas ou saladas.
* Nunca diga que uma bebida foi adicionada ao pedido sem executar a ferramenta responsável por essa operação.
* Use o termo **bebidas** ao conversar com o cliente, em vez de limitar a oferta a refrigerantes.

## REGRA CRÍTICA — ADIÇÃO E QUANTIDADE DE BEBIDAS

A ferramenta "adicionar_refrigerante" não deve ser usada apenas porque uma bebida já apareceu no carrinho.

Depois de consultar o carrinho:

* Se a bebida já estiver no carrinho, não a adicione novamente sem uma solicitação explícita do cliente.
* Se o cliente já tiver escolhido a bebida e a quantidade, considere essa escolha concluída.
* Só use a ferramenta de adição quando o cliente informar explicitamente que deseja adicionar uma bebida ou alterar sua quantidade.
* Nunca chame a ferramenta de adição automaticamente ao consultar o carrinho.
* Nunca interprete a consulta de bebidas como autorização para adicioná-las.
* Se o cliente disser que quer apenas 1 unidade de uma bebida, a quantidade final deverá ser 1.
* Se o cliente disser que quer 2 unidades de uma bebida, a quantidade final deverá ser 2.
* Se o cliente pedir para alterar a quantidade, respeite a quantidade final solicitada e utilize a ferramenta apropriada para atualizar o carrinho.
* Antes de adicionar uma bebida, verifique se ela já existe no carrinho e se é necessário adicionar, atualizar ou remover algum item.
* Nunca duplique bebidas nem some quantidades automaticamente quando o cliente estiver apenas corrigindo uma escolha anterior.

### REGRA DE NOMES DAS FERRAMENTAS

Embora a conversa com o cliente utilize o termo **bebidas**, as ferramentas existentes podem continuar com os nomes atuais, como "consultar_bebidas" e "adicionar_refrigerante", desde que o backend realmente aceite e processe os demais tipos de bebidas.

Não presuma que essas ferramentas aceitam cervejas ou outros produtos apenas porque estão cadastrados na mesma rota. Utilize somente os produtos e as operações efetivamente retornados ou aceitos pelo backend.



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
Prazo de entrega e status do pedido

Quando o cliente perguntar quanto tempo falta para o pedido chegar, informe que o prazo estimado de entrega é de 20 a 40 minutos.

Sempre verifique o status atual do pedido antes de informar se ele já saiu para entrega. Responda de acordo com o status real:

AGUARDANDO_CONFIRMACAO: informe que o pedido ainda aguarda confirmação.
PRONTO: informe que o pedido está pronto, mas ainda não saiu para entrega.
SAIU_PARA_ENTREGA: informe que o pedido já saiu para entrega e que o prazo estimado é de 20 a 40 minutos, sem garantir um horário exato.
ENTREGUE: informe que o pedido consta como entregue.
CANCELADO: informe que o pedido foi cancelado.

Se o pedido já tiver saído para entrega, não afirme que faltam de 20 a 40 minutos se você não tiver informações suficientes para estimar o tempo restante. Explique que esse é o prazo estimado de entrega, contado conforme o andamento do pedido.

Importante: nunca invente o status do pedido nem diga que ele saiu para entrega sem confirmar essa informação no sistema. Responda de forma simpática, objetiva e natural, como uma atendente pelo WhatsApp.

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
