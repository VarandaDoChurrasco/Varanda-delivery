import { GetAllOrderService } from "./getAllOrderService.js";
import { GetOrderByNumberService } from "./getOrderByNumberService.js";
import { SaiuEntregaOrderService } from "./outForDeliveryOrderController.js";
import { entregueOrderService } from "./deliveredOrderService.js";

class ProcessarComandoStatusService {
  private getAllOrderService: GetAllOrderService;
  private getOrderByNumberService: GetOrderByNumberService;
  private saiuEntregaOrderService: SaiuEntregaOrderService;
  private entregamosOrderService: entregueOrderService;

  constructor() {
    this.getAllOrderService = new GetAllOrderService();
    this.getOrderByNumberService = new GetOrderByNumberService();
    this.saiuEntregaOrderService = new SaiuEntregaOrderService();
    this.entregamosOrderService = new entregueOrderService();
  }

  async execute(texto: string): Promise<string | null> {
    console.log("📦 COMANDO DE STATUS RECEBIDO:", JSON.stringify(texto));

    const textoNormalizado = texto
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // ==========================================
    // LISTAR PEDIDOS
    // ==========================================

    if (textoNormalizado === "#pedidos") {
      console.log("📋 COMANDO DE LISTAR PEDIDOS DETECTADO");

      const pedidos = await this.getAllOrderService.execute();

      const lista = pedidos
        .map(
          (pedido) =>
            `📦 *Pedido #${pedido.numero}*\n` +
            `👤 ${pedido.cliente.nome}\n` +
            `🚚 ${pedido.tipo === "DELIVERY" ? "Delivery" : "Retirada"}\n` +
            `📌 Status: ${pedido.status}\n` +
            `💰 Total: R$ ${Number(pedido.total).toFixed(2).replace(".", ",")}`,
        )
        .join("\n\n");

      return `📋 *Pedidos:*\n\n${lista}`;
    }
    // ==========================================
    // CONSULTAR PEDIDO POR NÚMERO
    // ==========================================

    if (textoNormalizado.startsWith("#pedido ")) {
      const partes = textoNormalizado.split(/\s+/);

      if (partes.length !== 2) {
        return "❌ Formato inválido.\n\n" + "Use:\n" + "*#pedido 25*";
      }

      const numero = Number(partes[1]);

      if (!Number.isInteger(numero) || numero <= 0) {
        return "❌ Número do pedido inválido.\n\n" + "Use:\n" + "*#pedido 25*";
      }

      try {
        const pedido = await this.getOrderByNumberService.execute(numero);

        const tipo = pedido.tipo === "DELIVERY" ? "🚚 Delivery" : "🏠 Retirada";

        const itens = pedido.itens
          .map((item) => {
            const escolhas = item.escolhas
              .map((escolha) => `   • ${escolha.nome}`)
              .join("\n");

            return (
              `🍱 *${item.produtoNome}* — R$ ${Number(item.precoUnitario)
                .toFixed(2)
                .replace(".", ",")}\n` +
              `   Quantidade: ${item.quantidade}\n` +
              (escolhas ? `   Escolhas:\n${escolhas}\n` : "")
            );
          })
          .join("\n");

        const refrigerantes =
          pedido.refrigerantes.length > 0
            ? pedido.refrigerantes
                .map(
                  (refrigerante) =>
                    `🥤 ${refrigerante.quantidade}x ${refrigerante.refrigerante.nome} — R$ ${Number(
                      refrigerante.precoUnitario,
                    )
                      .toFixed(2)
                      .replace(".", ",")}`,
                )
                .join("\n")
            : "Nenhum";

        let endereco = "";

        if (pedido.tipo === "DELIVERY") {
          endereco =
            `\n📍 *Endereço:* ${pedido.endereco || "Não informado"}\n` +
            `🏘️ *Bairro:* ${pedido.bairro?.nome || "Não informado"}\n`;

          if (pedido.complemento) {
            endereco += `🏠 *Complemento:* ${pedido.complemento}\n`;
          }

          if (pedido.referencia) {
            endereco += `📌 *Referência:* ${pedido.referencia}\n`;
          }
        }

        const pagamento = pedido.formaPagamento || "Não informado";

        const troco =
          pedido.trocoPara !== null
            ? `\n💵 Troco para: R$ ${Number(pedido.trocoPara)
                .toFixed(2)
                .replace(".", ",")}`
            : "";

        return (
          `📦 *Pedido #${pedido.numero}*\n\n` +
          `👤 *Cliente:* ${pedido.cliente.nome}\n` +
          `📱 *Telefone:* ${pedido.cliente.telefone}\n` +
          `${tipo}\n` +
          `📌 *Status:* ${pedido.status}\n\n` +
          `*Itens:*\n${itens}\n` +
          `*Refrigerantes:*\n${refrigerantes}\n\n` +
          `💰 *Subtotal:* R$ ${Number(pedido.subtotal)
            .toFixed(2)
            .replace(".", ",")}\n` +
          `🚚 *Taxa de entrega:* R$ ${Number(pedido.taxaEntrega)
            .toFixed(2)
            .replace(".", ",")}\n` +
          `💵 *Total:* R$ ${Number(pedido.total)
            .toFixed(2)
            .replace(".", ",")}\n` +
          `💳 *Pagamento:* ${pagamento}` +
          `${troco}\n` +
          `${endereco}`
        );
      } catch (error) {
        if (error instanceof Error) {
          return `❌ ${error.message}`;
        }

        return "❌ Não foi possível consultar o pedido.";
      }
    }

    // ==========================================
    // PEDIDO SAIU PARA ENTREGA
    // ==========================================

    if (textoNormalizado.startsWith("#saiuentrega ")) {
      const partes = textoNormalizado.split(/\s+/);

      if (partes.length !== 2) {
        return "❌ Formato inválido.\n\n" + "Use:\n" + "*#saiuentrega 25*";
      }

      const numero = Number(partes[1]);

      if (!Number.isInteger(numero) || numero <= 0) {
        return (
          "❌ Número do pedido inválido.\n\n" + "Use:\n" + "*#saiuentrega 25*"
        );
      }

      try {
        const pedido = await this.getOrderByNumberService.execute(numero);

        const pedidoAtualizado = await this.saiuEntregaOrderService.execute(
          pedido.id,
        );

        return (
          `🚚 *Pedido #${pedidoAtualizado.numero} saiu para entrega!*\n\n` +
          `👤 Cliente: ${pedidoAtualizado.clienteId ? pedido.clienteId : "Não informado"}\n` +
          `📌 Status: ${pedidoAtualizado.status}`
        );
      } catch (error) {
        if (error instanceof Error) {
          return `❌ ${error.message}`;
        }

        return "❌ Não foi possível atualizar o pedido.";
      }
    }
    //===============================Entregue ========================================
    if (textoNormalizado.startsWith("#entregue ")) {
      const partes = textoNormalizado.split(/\s+/);

      if (partes.length !== 2) {
        return "❌ Formato inválido.\n\nUse:\n*#entregue 25*";
      }

      const numero = Number(partes[1]);

      if (!Number.isInteger(numero) || numero <= 0) {
        return "❌ Número do pedido inválido.";
      }

      console.log("📦 MARCANDO PEDIDO COMO ENTREGUE:", numero);

      const pedido = await this.getOrderByNumberService.execute(numero);

      const pedidoEntregue = await this.entregamosOrderService.execute(
        pedido.id,
      );

      console.log("✅ PEDIDO MARCADO COMO ENTREGUE:", pedidoEntregue.numero);

      return (
        `✅ *Pedido #${pedidoEntregue.numero} entregue!*\n\n` +
        `📌 Status: ${pedidoEntregue.status}`
      );
    }
    return null;
  }
}

export { ProcessarComandoStatusService };
