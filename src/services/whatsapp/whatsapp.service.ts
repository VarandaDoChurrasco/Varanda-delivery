//import makeWASocket, {
//useMultiFileAuthState,
//DisconnectReason,
//} from "@japofc/baileys";

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  downloadMediaMessage,
} from "@japofc/baileys";

import qrcode from "qrcode-terminal";
import { HeliaService } from "../helia/helia.service.js";
import { getClientService } from "../clientService/getClientService.js";
import { CreateClientService } from "../clientService/createClientService.js";
import { GetClientRequest } from "../../type/type.js";
import { ExtrairCardapioDaImagemService } from "../menuService/extrairCardapioDaImagem.service.js";
import { CardapioPendenteService } from "../menuService/cardapioPendente.service.js";
import { CadastrarCardapioService } from "../menuService/cadastrarCardapioService.js";
import { CadastrarRefrigeranteService } from "../refrigente/cadastrarRefrigeranteService.js";
import { ProcessarComandoRefrigeranteService } from "../refrigente/processarComandoRefrigeranteService.js";
import { ProcessarComandoBairroService } from "../neighborhoodService/processarComandoBairroService.js";
import { ProcessarComandoStatusService } from "../orderService/processarComandoStatusService.js";
import { AlterarModoAtendimentoService } from "../clientService/alterarModoAtendimentoService.js";

import { setWhatsAppSocket } from "../../lib/whatsappSocket.js";

export class WhatsAppService {
  private heliaService: HeliaService;
  private historicos = new Map<string, any[]>();
  private getClientService: getClientService;
  private createClientService: CreateClientService;
  private extrairCardapioDaImagemService: ExtrairCardapioDaImagemService;
  private cardapioPendenteService: CardapioPendenteService;
  private cadastrarCardapioService: CadastrarCardapioService;
  private cadastrarRefrigeranteService: CadastrarRefrigeranteService;
  private processarComandoRefrigeranteService: ProcessarComandoRefrigeranteService;
  private processarComandoBairroService: ProcessarComandoBairroService;
  private processarComandoStatusService: ProcessarComandoStatusService;
  private alterarMOdoAtendimentoIaService: AlterarModoAtendimentoService;
  private qrCode: string | null = null;

  public getQrCode(): string | null {
    return this.qrCode;
  }

  // private getClient = new getClientService();
  // private createClient = new CreateClientService();

  // constructor(heliaService: HeliaService) {
  //  this.heliaService = heliaService;
  // }

  constructor() {
    this.heliaService = new HeliaService();
    this.getClientService = new getClientService();
    this.createClientService = new CreateClientService();
    this.extrairCardapioDaImagemService = new ExtrairCardapioDaImagemService();
    this.cardapioPendenteService = new CardapioPendenteService();
    this.cadastrarCardapioService = new CadastrarCardapioService();
    this.cadastrarRefrigeranteService = new CadastrarRefrigeranteService();
    this.processarComandoRefrigeranteService =
      new ProcessarComandoRefrigeranteService();
    this.processarComandoBairroService = new ProcessarComandoBairroService();
    this.processarComandoStatusService = new ProcessarComandoStatusService();
    this.alterarMOdoAtendimentoIaService = new AlterarModoAtendimentoService();
  }

  async iniciar() {
    const { state, saveCreds } = await useMultiFileAuthState(
      "./auth_info_baileys",
    );

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
    });
    setWhatsAppSocket(sock);

    console.log("📱 CONTA CONECTADA:", sock.user);

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async ({ messages }: { messages: any[] }) => {
      for (const message of messages) {
        if (!message.message) continue;
        //if (message.key.fromMe) continue;

        // if (message.key.fromMe) {
        //console.log("📤 MENSAGEM DA PRÓPRIA CONTA");
        //  console.log(message);
        //  continue;
        // }

        const remoteJid = message.key.remoteJid;

        const telefone = message.key.remoteJidAlt?.replace(
          "@s.whatsapp.net",
          "",
        );

        const nome = message.pushName?.trim() || "Cliente";

        if (!remoteJid || remoteJid === "status@broadcast") {
          continue;
        }

        const meuNumero = sock.user?.id?.split(":")[0];

        const telefoneRemetente =
          message.key.remoteJidAlt?.replace("@s.whatsapp.net", "") ||
          remoteJid.replace("@s.whatsapp.net", "");

        const ehMinhaConta =
          message.key.fromMe && telefoneRemetente === meuNumero;

        // ==========================================
        // ADMINISTRADOR - IMAGEM DO CARDÁPIO
        // ==========================================

        if (ehMinhaConta && message.message.imageMessage) {
          console.log("\n📷 IMAGEM RECEBIDA DO ADMINISTRADOR");

          try {
            const imagemBuffer = await downloadMediaMessage(
              message,
              "buffer",
              {},
              undefined!,
            );

            const imagemBase64 = `data:image/jpeg;base64,${imagemBuffer.toString(
              "base64",
            )}`;

            console.log("🖼️ Imagem baixada:", imagemBuffer.length, "bytes");

            console.log("🤖 Extraindo cardápio da imagem...");

            const resultado =
              await this.extrairCardapioDaImagemService.execute(imagemBase64);

            console.log("📋 CARDÁPIO EXTRAÍDO:");
            console.log(JSON.stringify(resultado, null, 2));

            await this.cardapioPendenteService.salvar(resultado);

            console.log("💾 Cardápio pendente salvo no banco.");

            let resposta = "";

            if (
              resultado.alertas.length > 0 &&
              resultado.acompanhamentos.length === 0 &&
              resultado.proteinas.length === 0 &&
              resultado.saladas.length === 0
            ) {
              resposta =
                `⚠️ ${resultado.alertas.join("\n")}\n\n` +
                `Envie uma foto do cardápio válido da Varanda do Churrasco J.H.`;
            } else {
              resposta =
                `📋 *Cardápio identificado*\n\n` +
                `🥩 *Proteínas:*\n` +
                `${
                  resultado.proteinas.length
                    ? resultado.proteinas.map((item) => `• ${item}`).join("\n")
                    : "Nenhuma identificada"
                }\n\n` +
                `🍚 *Acompanhamentos:*\n` +
                `${
                  resultado.acompanhamentos.length
                    ? resultado.acompanhamentos
                        .map((item) => `• ${item}`)
                        .join("\n")
                    : "Nenhum identificado"
                }\n\n` +
                `🥗 *Saladas:*\n` +
                `${
                  resultado.saladas.length
                    ? resultado.saladas.map((item) => `• ${item}`).join("\n")
                    : "Nenhuma identificada"
                }\n\n` +
                `Deseja cadastrar este cardápio para hoje?\n` +
                `Responda *SIM* para confirmar ou envie outra imagem.`;

              if (resultado.alertas.length > 0) {
                resposta +=
                  `\n\n⚠️ *Observação:*\n` +
                  resultado.alertas.map((item) => `• ${item}`).join("\n");
              }
            }

            await sock.sendMessage(remoteJid, {
              text: resposta,
            });

            console.log("📤 Prévia do cardápio enviada.");
          } catch (error) {
            console.error("❌ Erro ao processar imagem do cardápio:", error);

            await sock.sendMessage(remoteJid, {
              text:
                "❌ Não consegui analisar essa imagem. " +
                "Envie novamente uma foto nítida do cardápio.",
            });
          }

          // Muito importante:
          // não deixa a imagem cair no fluxo normal da Hélia.
          continue;
        }

        // ==========================================
        // CLIENTES NORMAIS
        // ==========================================

        if (ehMinhaConta) {
          console.log("🔎 DEBUG ADMIN:", {
            fromMe: message.key.fromMe,
            remoteJid,
            remoteJidAlt: message.key.remoteJidAlt,
            meuNumero,
            telefoneRemetente,
            ehMinhaConta,
          });
          //===============================================
          const textoAdmin =
            message.message.conversation ||
            message.message.extendedTextMessage?.text ||
            "";

          console.log("👑 TEXTO ADMIN:", textoAdmin);

          const textoNormalizado = textoAdmin
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          //=================Modo Ia ==============================================

          {
            /*}  if (textoNormalizado.startsWith("#ia")) {
            try {
              const partes = textoNormalizado.split(/\s+/);

              if (partes.length !== 2) {
                await sock.sendMessage(remoteJid, {
                  text:
                    "❌ Formato inválido.\n\n" +
                    "Use:\n" +
                    "*#ia 557781200350*",
                });

                continue;
              }

              const telefoneCliente = partes[1];

              const cliente =
                await this.getClientService.execute(telefoneCliente);

              if (!cliente) {
                await sock.sendMessage(remoteJid, {
                  text:
                    `❌ Não encontrei nenhum cliente com o telefone ` +
                    `*${telefoneCliente}*.`,
                });

                continue;
              }

              if (cliente.modoAtendimento === "IA") {
                await sock.sendMessage(remoteJid, {
                  text:
                    `🤖 O atendimento de *${cliente.nome}* ` +
                    `já está com a Hélia.`,
                });

                continue;
              }

              await this.alterarMOdoAtendimentoIaService.voltarParaIA(
                cliente.id,
              );

              await sock.sendMessage(remoteJid, {
                text:
                  `🤖 *Atendimento devolvido para a Hélia!*\n\n` +
                  `👤 Cliente: ${cliente.nome}\n` +
                  `📱 Telefone: ${cliente.telefone}\n` +
                  `📌 Modo: IA`,
              });

              console.log(
                `🤖 Atendimento de ${cliente.nome} devolvido para IA.`,
              );
            } catch (error) {
              console.error("❌ Erro ao devolver atendimento para IA:", error);

              await sock.sendMessage(remoteJid, {
                text: "❌ Não consegui devolver o atendimento para a Hélia.",
              });
            }

            continue;
          }  */
          }

          //================= fim modo IA ==========================================

          const respostaBairro =
            await this.processarComandoBairroService.execute(textoAdmin);

          if (respostaBairro) {
            await sock.sendMessage(remoteJid, {
              text: respostaBairro,
            });

            continue;
          }

          const respostaRefrigerante =
            await this.processarComandoRefrigeranteService.execute(textoAdmin);

          if (respostaRefrigerante) {
            await sock.sendMessage(remoteJid, {
              text: respostaRefrigerante,
            });

            continue;
          }

          const respostaStatus =
            await this.processarComandoStatusService.execute(textoAdmin);

          if (respostaStatus) {
            await sock.sendMessage(remoteJid, {
              text: respostaStatus,
            });
            continue;
          }

          //=======================================================
          //  const textoAdmin =
          //   message.message.conversation ||
          ///  message.message.extendedTextMessage?.text ||
          // "";

          //===========================================
          //  const textoNormalizado = textoAdmin
          //    .trim()
          //   .toLowerCase()
          //  .normalize("NFD")
          //  .replace(/[\u0300-\u036f]/g, "");
          //========================================

          // ==========================================
          // CADASTRAR REFRIGERANTE
          // ==============================================================================================================
          // ==========================================
          // CADASTRAR REFRIGERANTE
          // ==========================================

          if (textoNormalizado === "sim" || textoNormalizado === "cadastrar") {
            try {
              const pendente = await this.cardapioPendenteService.obter();

              if (!pendente) {
                await sock.sendMessage(remoteJid, {
                  text: "⚠️ Não existe nenhum cardápio pendente para cadastrar.",
                });

                continue;
              }

              console.log("💾 Cadastrando cardápio...");

              const cardapio = await this.cadastrarCardapioService.execute();

              await sock.sendMessage(remoteJid, {
                text:
                  "✅ *Cardápio cadastrado com sucesso!*\n\n" +
                  "O cardápio de hoje já está disponível para os clientes.",
              });

              console.log("✅ Cardápio cadastrado:", cardapio.cardapioId);
            } catch (error) {
              console.error("❌ Erro ao cadastrar cardápio:", error);

              await sock.sendMessage(remoteJid, {
                text:
                  "❌ Não consegui cadastrar o cardápio.\n" +
                  "Verifique o erro no servidor e tente novamente.",
              });
            }

            continue;
          }

          if (textoNormalizado === "nao" || textoNormalizado === "cancelar") {
            try {
              const pendente = await this.cardapioPendenteService.obter();

              if (!pendente) {
                await sock.sendMessage(remoteJid, {
                  text: "ℹ️ Não existe nenhum cardápio pendente.",
                });

                continue;
              }

              await this.cardapioPendenteService.excluir();

              await sock.sendMessage(remoteJid, {
                text: "🗑️ Cardápio descartado. Pode enviar uma nova foto.",
              });

              console.log("🗑️ Cardápio pendente descartado.");
            } catch (error) {
              console.error("❌ Erro ao descartar cardápio:", error);

              await sock.sendMessage(remoteJid, {
                text: "❌ Não consegui descartar o cardápio.",
              });
            }

            continue;
          }
        } // <--- ESTA CHAVE FECHA O if (ehMinhaConta)

        ///====================================fim modo ia ===========================
        if (message.key.fromMe) {
          continue;
        }

        const texto =
          message.message.conversation ||
          message.message.extendedTextMessage?.text ||
          "";

        if (!texto) continue;

        //  console.log("\n📩 MENSAGEM RECEBIDA");
        //  console.log("De:", remoteJid);
        //  console.log("Texto:", texto);

        //  console.log("👤 PUSH NAME:", message.pushName);
        //  console.log("🔑 KEY:", message.key);

        try {
          if (!telefone) {
            console.log(
              "❌ Não foi possível identificar o telefone do cliente.",
            );
            continue;
          }

          let cliente: GetClientRequest | null =
            await this.getClientService.execute(telefone);

          if (!cliente) {
            cliente = await this.createClientService.execute({
              telefone,
              nome,
            });

            console.log("👤 Cliente cadastrado:", cliente);
          } else {
            console.log("👤 Cliente encontrado:", cliente);
          }
          console.log("🤖 Hélia está processando...");
          console.log("📩 TEXTO PROCESSADO PELA HÉLIA:", texto);

          if (cliente.modoAtendimento === "HUMANO") {
            // console.log(`👤 Atendimento humano para ${cliente.nome}.`);
            //continue;
            const agora = new Date();

            // Atendimento humano ainda está dentro do prazo
            if (cliente.humanoAte && cliente.humanoAte > agora) {
              console.log(`👤 Atendimento humano para ${cliente.nome}.`);
              console.log(`⏳ Atendimento humano até: ${cliente.humanoAte}`);
              continue;
            }

            // Atendimento humano expirou
            if (cliente.humanoAte && cliente.humanoAte <= agora) {
              console.log(
                `⏰ Atendimento humano expirou para ${cliente.nome}. Voltando para IA.`,
              );

              cliente = await this.alterarMOdoAtendimentoIaService.voltarParaIA(
                cliente.id,
              );

              console.log(`🤖 Atendimento de ${cliente.nome} voltou para IA.`);
            }
          }

          const historico = this.historicos.get(remoteJid) || [];

          const resposta = await this.heliaService.processarMensagem(
            texto,
            historico,
            cliente,
          );

          console.log("🤖 Hélia:", resposta);

          historico.push(
            {
              role: "user",
              content: texto,
            },
            {
              role: "assistant",
              content: resposta,
            },
          );

          this.historicos.set(remoteJid, historico);

          await sock.sendMessage(remoteJid, {
            text: resposta,
          });

          console.log("📤 Resposta enviada!");
        } catch (error) {
          console.error("❌ Erro ao processar mensagem:", error);
        }
      }
    });

    sock.ev.on("connection.update", (update: any) => {
      const { connection, lastDisconnect, qr } = update;
      //=====================================================================
      //  if (qr) {
      // console.log("\n📱 Escaneie este QR Code com o WhatsApp:\n");

      // qrcode.generate(qr, { small: true });
      //  }
      //=========================================================================================
      if (qr) {
        this.qrCode = qr;

        console.log("\n📱 Novo QR Code gerado.\n");

        qrcode.generate(qr, { small: true });
      }
      if (connection === "open") {
        this.qrCode = null;
        console.log("\n✅ WhatsApp conectado com sucesso!\n");
      }

      if (connection === "close") {
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;

        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        console.log(
          "\n❌ WhatsApp desconectado.",
          `Reconectar: ${shouldReconnect}`,
        );

        if (shouldReconnect) {
          this.iniciar();
        }
      }
    });

    return sock;
  }
}
