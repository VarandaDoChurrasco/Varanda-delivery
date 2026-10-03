import { GetMenuService } from "../../menuService/getMenuService.js";

const getMenuService = new GetMenuService();

export const consultarCardapioTool = {
  type: "function" as const,

  function: {
    name: "consultar_cardapio",

    description:
      "Consulta o cardápio disponível para hoje. Deve ser usada sempre que o cliente perguntar sobre tamanhos, preços, acompanhamentos, proteínas ou saladas disponíveis.",

    parameters: {
      type: "object",

      properties: {},

      required: [],

      additionalProperties: false,
    },
  },
};
export async function executarConsultarCardapio() {
  return await getMenuService.execute();
}
