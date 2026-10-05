import * as googleTTS from "@sefinek/google-tts-api";

class GerarAudioPedidoService {
  async execute(pedido: any): Promise<Buffer> {
    const total = Number(pedido.total).toFixed(2).replace(".", ",");

    const texto =
      `Novo pedido confirmado. ` +
      `Pedido número ${pedido.numero}. ` +
      `Total de ${total} reais.`;

    console.log("🔊 Gerando áudio:");
    console.log(texto);

    const base64 = await googleTTS.getAudioBase64(texto, {
      lang: "pt",
      slow: false,
      timeout: 10000,
    });

    return Buffer.from(base64, "base64");
  }
}

export { GerarAudioPedidoService };
