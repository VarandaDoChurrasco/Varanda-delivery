import { listNeighborhoodService } from "../../neighborhoodService/listNeighborhoodService.js";

export const consultarBairrosTool = {
  type: "function" as const,

  function: {
    name: "consultar_bairros",

    description:
      "Consulta os bairros disponíveis para entrega. Use quando o cliente informar ou perguntar sobre o bairro de entrega.",

    parameters: {
      type: "object",

      properties: {},

      required: [],

      additionalProperties: false,
    },
  },
};

export async function executarConsultarBairros() {
  try {
    const service = new listNeighborhoodService();
    const bairros = await service.execute();
    return { success: true, bairros };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
