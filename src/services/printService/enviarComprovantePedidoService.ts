import { getWhatsAppSocket } from "../../lib/whatsappSocket.js";
import { GerarComprovantePedidoService } from "./gerarComprovantePedidoService.js";
//import { GerarAudioPedidoService } from "./gerarAudioPedidoService.js";

class EnviarComprovantePedidoService {
  private gerarComprovantePedidoService = new GerarComprovantePedidoService();
  // private gerarAudioPedidoService = new GerarAudioPedidoService();
  async execute(pedido: any) {
    const sock = getWhatsAppSocket();

    const pdf = await this.gerarComprovantePedidoService.execute(pedido);

    const meuNumero = sock.user?.id?.split(":")[0];

    if (!meuNumero) {
      throw new Error(
        "Não foi possível identificar o WhatsApp do administrador.",
      );
    }

    const administradorJid = `${meuNumero}@s.whatsapp.net`;

    console.log("📤 Enviando comprovante para:", administradorJid);

    await sock.sendMessage(administradorJid, {
      document: pdf,
      mimetype: "application/pdf",
      fileName: `pedido-${pedido.numero}.pdf`,
      caption:
        `🔔 *NOVO PEDIDO CONFIRMADO!*\n\n` +
        `📋 Pedido #${pedido.numero}\n` +
        `💰 Total: R$ ${Number(pedido.total).toFixed(2).replace(".", ",")}`,
    });
    //======================================================================================
    // const audio = await this.gerarAudioPedidoService.execute(pedido);

    //  await sock.sendMessage(administradorJid, {
    // audio,
    //  mimetype: "audio/mpeg",
    //  ptt: true,
    //  });

    //============================================================================================
    console.log(
      `📄 Comprovante do pedido #${pedido.numero} enviado para o administrador.`,
    );
  }
}

export { EnviarComprovantePedidoService };
