import { prisma } from "../../../lib/prisma.js";

export const voltarParaIATool = {
  type: "function" as const,

  function: {
    name: "voltar_para_ia",

    description:
      "Retorna o atendimento do cliente para a Hélia, alterando o modo de atendimento de HUMANO para IA.",

    parameters: {
      type: "object",

      properties: {
        clienteId: {
          type: "string",
          description:
            "ID do cliente que deve voltar para o atendimento da Hélia.",
        },
      },

      required: ["clienteId"],

      additionalProperties: false,
    },
  },
};

export async function executarVoltarParaIA(args: { clienteId: string }) {
  if (!args.clienteId) {
    throw new Error("clienteId não informado.");
  }

  const cliente = await prisma.cliente.findUnique({
    where: {
      id: args.clienteId,
    },
  });

  if (!cliente) {
    throw new Error("Cliente não encontrado.");
  }

  if (cliente.modoAtendimento === "IA") {
    return {
      sucesso: true,
      clienteId: cliente.id,
      modoAtendimento: "IA",
      mensagem: "O cliente já está sendo atendido pela Hélia.",
    };
  }

  const clienteAtualizado = await prisma.cliente.update({
    where: {
      id: cliente.id,
    },

    data: {
      modoAtendimento: "IA",
    },
  });

  return {
    sucesso: true,
    clienteId: clienteAtualizado.id,
    modoAtendimento: clienteAtualizado.modoAtendimento,
    mensagem: "Atendimento devolvido para a Hélia.",
  };
}
