import { prisma } from "../../../lib/prisma.js";

export const transferirParaHumanoTool = {
  type: "function" as const,

  function: {
    name: "transferir_para_humano",

    description:
      "Transfere o atendimento do cliente para uma pessoa. Deve ser usada quando o cliente pedir para falar com um atendente, pessoa, responsável ou atendimento humano.",

    parameters: {
      type: "object",

      properties: {
        clienteId: {
          type: "string",
          description:
            "ID do cliente que será transferido para atendimento humano.",
        },
      },

      required: ["clienteId"],

      additionalProperties: false,
    },
  },
};

export async function executarTransferirParaHumano(args: {
  clienteId: string;
}) {
  if (!args.clienteId) {
    throw new Error("clienteId não informado.");
  }

  const cliente = await prisma.cliente.update({
    where: {
      id: args.clienteId,
    },

    data: {
      modoAtendimento: "HUMANO",
      humanoAte: new Date(Date.now() + 60 * 1000),
    },
  });

  return {
    sucesso: true,
    clienteId: cliente.id,
    modoAtendimento: cliente.modoAtendimento,
  };
}
