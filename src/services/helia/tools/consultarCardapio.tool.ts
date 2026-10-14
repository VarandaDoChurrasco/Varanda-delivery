import { GetMenuService } from "../../menuService/getMenuService.js";

const getMenuService = new GetMenuService();

export const consultarCardapioTool = {
  type: "function" as const,

  function: {
    name: "consultar_cardapio",

    description:
      "Consulta o cardápio correspondente ao horário atual. " +
      "Antes das 15h, consulta o cardápio de almoço e as regras " +
      "de montagem das quentinhas. A partir das 15h, consulta " +
      "o cardápio da noite, incluindo os produtos disponíveis, " +
      "suas categorias e preços. Use sempre esta ferramenta " +
      "antes de informar preços ou disponibilidade ao cliente.",
    // "Consulta o cardápio disponível para hoje. Deve ser usada sempre que o cliente perguntar sobre tamanhos, preços, acompanhamentos, proteínas ou saladas disponíveis.",

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
