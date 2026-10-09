import { ConsultarListRefrigerantesService } from "../../refrigente/consultarListRefrigerantesController.js";

const consultarRefrigerantesService = new ConsultarListRefrigerantesService();

export const consultarBebidasTool = {
  type: "function",
  function: {
    name: "consultar_bebidas",
    description:
      "Consulta todas as bebidas atualmente disponíveis para venda, incluindo nome e preço. Pode retornar refrigerantes, cervejas e outras bebidas cadastradas. Deve ser usada antes de informar ao cliente quais bebidas estão disponíveis ou seus preços.",

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
