import { ConsultarListRefrigerantesService } from "../../refrigente/consultarListRefrigerantesController.js";

const consultarRefrigerantesService = new ConsultarListRefrigerantesService();

export const consultarRefrigerantesTool = {
  type: "function",
  function: {
    name: "consultar_refrigerantes",
    description:
      "Consulta os refrigerantes atualmente disponíveis para venda, incluindo nome e preço. Deve ser usada antes de informar ao cliente quais refrigerantes estão disponíveis ou seus preços.",

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
