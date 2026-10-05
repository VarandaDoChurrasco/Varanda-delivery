import PDFDocument from "pdfkit";

class GerarComprovantePedidoService {
  async execute(pedido: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      // 58mm aproximadamente = 164 pontos
      const largura = 164;

      const doc = new PDFDocument({
        size: [largura, 900],
        margins: {
          top: 10,
          bottom: 10,
          left: 8,
          right: 8,
        },
      });

      doc.on("data", (chunk) => {
        chunks.push(chunk);
      });

      doc.on("end", () => {
        resolve(Buffer.concat(chunks));
      });

      doc.on("error", reject);

      // ------------------------------------------
      // FUNÇÕES AUXILIARES
      // ------------------------------------------

      const linha = () => {
        doc
          .font("Helvetica")
          .fontSize(7)
          .text("--------------------------------", {
            align: "center",
          });
      };

      const dinheiro = (valor: any) => {
        return Number(valor).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
      };

      // ------------------------------------------
      // CABEÇALHO
      // ------------------------------------------

      doc.font("Helvetica-Bold").fontSize(11).text("VARANDA DO", {
        align: "center",
      });

      doc.fontSize(11).text("CHURRASCO J.H.", {
        align: "center",
      });

      doc.moveDown(0.3);

      doc.fontSize(10).text(`PEDIDO #${pedido.numero}`, {
        align: "center",
      });

      doc.moveDown(0.3);

      linha();

      // ------------------------------------------
      // CLIENTE
      // ------------------------------------------

      doc.font("Helvetica-Bold").fontSize(8).text("CLIENTE");

      doc
        .font("Helvetica")
        .fontSize(8)
        .text(pedido.cliente?.nome ?? "Não informado");

      if (pedido.cliente?.telefone) {
        doc.text(`Tel: ${pedido.cliente.telefone}`);
      }

      doc.moveDown(0.3);

      linha();

      // ------------------------------------------
      // ITENS
      // ------------------------------------------

      doc.font("Helvetica-Bold").fontSize(8).text("ITENS");

      doc.moveDown(0.2);

      for (const item of pedido.itens ?? []) {
        // Nome da quentinha
        doc
          .font("Helvetica-Bold")
          .fontSize(8)
          .text(`${item.quantidade}x ${item.produtoNome}`);

        // Preço
        doc
          .font("Helvetica")
          .fontSize(8)
          .text(
            `Valor: ${dinheiro(Number(item.precoUnitario) * item.quantidade)}`,
          );

        // ----------------------------------------
        // ESCOLHAS
        // ----------------------------------------

        if (item.escolhas?.length) {
          doc.font("Helvetica-Bold").fontSize(7).text("Escolhas:");

          for (const escolha of item.escolhas) {
            doc.font("Helvetica").fontSize(7).text(`  • ${escolha.nome}`);
          }
        }

        // ----------------------------------------
        // ADICIONAIS
        // ----------------------------------------

        if (item.adicionais?.length) {
          doc.font("Helvetica-Bold").fontSize(7).text("Adicionais:");

          for (const adicional of item.adicionais) {
            doc.font("Helvetica").fontSize(7).text(`  + ${adicional.nome}`);
          }
        }

        // ----------------------------------------
        // REMOÇÕES
        // ----------------------------------------

        if (item.remocoes?.length) {
          doc.font("Helvetica-Bold").fontSize(7).text("Sem:");

          for (const remocao of item.remocoes) {
            doc.font("Helvetica").fontSize(7).text(`  - ${remocao.nome}`);
          }
        }

        // ----------------------------------------
        // OBSERVAÇÃO
        // ----------------------------------------

        if (item.observacao) {
          doc.font("Helvetica-Bold").fontSize(7).text("Observação:");

          doc.font("Helvetica").fontSize(7).text(item.observacao);
        }

        doc.moveDown(0.4);
      }

      // ------------------------------------------
      // REFRIGERANTES
      // ------------------------------------------

      if (pedido.refrigerantes?.length) {
        linha();

        doc.font("Helvetica-Bold").fontSize(8).text("REFRIGERANTES");

        for (const refrigerante of pedido.refrigerantes) {
          const nome = refrigerante.refrigerante?.nome ?? "Refrigerante";

          const quantidade = refrigerante.quantidade ?? 1;

          const preco = Number(refrigerante.precoUnitario ?? 0) * quantidade;

          doc
            .font("Helvetica")
            .fontSize(8)
            .text(`${quantidade}x ${nome} - ${dinheiro(preco)}`);
        }
      }

      // ------------------------------------------
      // ENTREGA / RETIRADA
      // ------------------------------------------

      linha();

      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .text(pedido.tipo === "DELIVERY" ? "ENTREGA" : "RETIRADA");

      if (pedido.tipo === "DELIVERY") {
        if (pedido.bairro?.nome) {
          doc
            .font("Helvetica")
            .fontSize(8)
            .text(`Bairro: ${pedido.bairro.nome}`);
        }

        if (pedido.endereco) {
          doc.text(`Endereço: ${pedido.endereco}`);
        }

        if (pedido.complemento) {
          doc.text(`Complemento: ${pedido.complemento}`);
        }

        if (pedido.referencia) {
          doc.text(`Referência: ${pedido.referencia}`);
        }
      }

      // ------------------------------------------
      // PAGAMENTO
      // ------------------------------------------

      linha();

      doc.font("Helvetica-Bold").fontSize(8).text("PAGAMENTO");

      if (pedido.formaPagamento) {
        doc
          .font("Helvetica")
          .fontSize(8)
          .text(`Forma: ${pedido.formaPagamento}`);
      }

      if (pedido.trocoPara) {
        doc.text(`Troco para: ${dinheiro(pedido.trocoPara)}`);
      }

      // ------------------------------------------
      // VALORES
      // ------------------------------------------

      linha();

      doc
        .font("Helvetica")
        .fontSize(8)
        .text(`Subtotal: ${dinheiro(pedido.subtotal)}`);

      if (Number(pedido.taxaEntrega) > 0) {
        doc.text(`Entrega: ${dinheiro(pedido.taxaEntrega)}`);
      }

      doc.moveDown(0.2);

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(`TOTAL: ${dinheiro(pedido.total)}`, {
          align: "center",
        });

      doc.moveDown(0.4);

      linha();

      // ------------------------------------------
      // STATUS
      // ------------------------------------------

      doc.font("Helvetica-Bold").fontSize(9).text("PEDIDO CONFIRMADO", {
        align: "center",
      });

      doc.moveDown(0.2);

      doc
        .font("Helvetica")
        .fontSize(7)
        .text(new Date().toLocaleString("pt-BR"), {
          align: "center",
        });

      doc.moveDown(0.5);

      doc.fontSize(7).text("Obrigado pela preferência!", {
        align: "center",
      });

      doc.end();
    });
  }
}

export { GerarComprovantePedidoService };
