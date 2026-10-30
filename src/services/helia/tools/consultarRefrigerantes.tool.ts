import { ConsultarListRefrigerantesService } from "../../refrigente/consultarListRefrigerantesController.js";

const consultarRefrigerantesService = new ConsultarListRefrigerantesService();

export const consultarBebidasTool = {
  type: "function",
  function: {
    name: "consultar_bebidas",
    description:
      "Consulta as bebidas disponíveis para venda, incluindo nome e preço. " +
      "Deve ser utilizada sempre que o cliente perguntar sobre bebidas, valores ou disponibilidade. " +
      "Não deve oferecer bebidas esgotadas ou indisponíveis. " +
      "Utilize somente as bebidas retornadas pela ferramenta.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false,
    },
  },
};

export async function executarConsultarRefrigerantes() {
  const refrigerantes = await consultarRefrigerantesService.execute();

  return refrigerantes;
}
