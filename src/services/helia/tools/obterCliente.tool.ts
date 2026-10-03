import { getClientService } from "../../clientService/getClientService.js";
import { CreateClientService } from "../../clientService/createClientService.js";

const getClient = new getClientService();
const createClient = new CreateClientService();

export const obterClienteTool = {
  type: "function" as const,

  function: {
    name: "obter_cliente",

    description:
      "Identifica o cliente pelo telefone recebido do WhatsApp. Se o cliente já existir, retorna seus dados. Se não existir, cria um novo cadastro usando o nome e telefone fornecidos pelo contexto da mensagem.",

    parameters: {
      type: "object",

      properties: {
        telefone: {
          type: "string",
          description: "Telefone do cliente recebido pelo Evolution API.",
        },

        nome: {
          type: "string",
          description:
            "Nome do cliente recebido pelo Evolution API. Pode ser usado para criar o cadastro caso o cliente ainda não exista.",
        },
      },

      required: ["telefone", "nome"],

      additionalProperties: false,
    },
  },
};

export async function executarObterCliente(args: {
  telefone: string;
  nome: string;
}) {
  const { telefone, nome } = args;

  if (!telefone) {
    throw new Error("Telefone do cliente não informado.");
  }

  // Primeiro procura pelo telefone
  const clienteExistente = await getClient.execute(telefone);

  if (clienteExistente) {
    return {
      encontrado: true,
      criado: false,
      cliente: clienteExistente,
    };
  }

  // Se não encontrou, cria o cliente
  const novoCliente = await createClient.execute({
    telefone,
    nome,
  });

  return {
    encontrado: false,
    criado: true,
    cliente: novoCliente,
  };
}
