import { getNeighborhoodService } from "../../neighborhoodService/getIdNeighborhoodService.js";

export const consultarBairroPorIdTool = {
  type: "function" as const,
  function: {
    name: "consultar_bairro_por_id",
    description:
      "Busca os dados de um bairro específico pelo ID. Use somente depois de confirmar que o bairro existe na lista retornada por consultar_bairros.",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string", description: "ID do bairro" },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
};

export async function executarConsultarBairroPorId(id: string) {
  try {
    const service = new getNeighborhoodService();
    const bairro = await service.execute(id);
    return { success: true, bairro };
  } catch (error) {
    // ❌ NÃO relança. Retorna como resultado.
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
