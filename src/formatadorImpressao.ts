// formatadorImpressao.ts

export interface PedidoImpressao {
  numero: number;
  createdAt: Date | string;
  subtotal: any; // Aceita Decimal do Prisma, string ou number
  taxaEntrega?: any;
  total: any;
  tipo: string;
  formaPagamento?: string | null;
  cliente?: {
    nome?: string | null;
    telefone?: string | null;
  } | null;
  itens?: any[];
}

export function gerarTextoImpressao(pedido: PedidoImpressao): string {
  const data = new Date(pedido.createdAt).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  let texto = `================================\n`;
  texto += `     VARANDA DO CHURRASCO      \n`;
  texto += `================================\n`;
  texto += `PEDIDO: #${pedido.numero}\n`;
  texto += `HORA:   ${data}\n`;
  texto += `CLIENTE: ${pedido.cliente?.nome || "Nao informado"}\n`;
  texto += `TEL:     ${pedido.cliente?.telefone || "Nao informado"}\n`;
  texto += `TIPO:    ${pedido.tipo}\n`;
  texto += `PAGTO:   ${pedido.formaPagamento || "Nao informado"}\n`;
  texto += `--------------------------------\n`;

  if (pedido.itens && pedido.itens.length > 0) {
    pedido.itens.forEach((item: any) => {
      const totalItem = (Number(item.precoUnitario) * item.quantidade).toFixed(
        2,
      );
      texto += `${item.quantidade}x ${item.produtoNome}\n`;
      texto += `   R$ ${totalItem}\n`;

      if (item.observacao) {
        texto += `   Obs: ${item.observacao}\n`;
      }
      if (item.remocoes && item.remocoes.length > 0) {
        item.remocoes.forEach((rem: any) => {
          texto += `   [SEM ${rem.ingrediente.toUpperCase()}]\n`;
        });
      }
      if (item.adicionais && item.adicionais.length > 0) {
        item.adicionais.forEach((add: any) => {
          texto += `   [+ ${add.nome.toUpperCase()}]\n`;
        });
      }
    });
  }

  texto += `--------------------------------\n`;
  texto += `SUBTOTAL:     R$ ${Number(pedido.subtotal).toFixed(2)}\n`;
  texto += `TAXA ENTREGA: R$ ${Number(pedido.taxaEntrega || 0).toFixed(2)}\n`;
  texto += `TOTAL:        R$ ${Number(pedido.total).toFixed(2)}\n`;
  texto += `================================\n\n\n\n`;
  console.log("texto para imprimir", texto);
  return texto;
}
