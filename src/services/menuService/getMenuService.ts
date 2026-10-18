import { prisma } from "../../lib/prisma.js";

class GetMenuService {
  async execute() {
    // Usa o horário oficial de Brasília, independentemente
    // do fuso horário configurado no servidor.
    const partesData = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date());

    const obterParte = (tipo: string) =>
      partesData.find((parte) => parte.type === tipo)?.value ?? "";

    const ano = Number(obterParte("year"));
    const mes = Number(obterParte("month"));
    const dia = Number(obterParte("day"));
    const hora = Number(obterParte("hour"));
    const minuto = Number(obterParte("minute"));

    // O campo Prisma usa @db.Date.
    // Criamos a data sem depender do fuso horário do servidor.
    const dataHoje = new Date(Date.UTC(ano, mes - 1, dia));

    //const periodo = hora < 15 ? "ALMOCO" : "NOITE";
    const periodo =
      hora < 14 || (hora === 14 && minuto < 30) ? "ALMOCO" : "NOITE";
    // A partir das 15h, desativa o cardápio do almoço de hoje.
    // Não apaga os registros do banco.
    if (periodo === "NOITE") {
      await prisma.cardapio.updateMany({
        where: {
          data: dataHoje,
          periodo: "ALMOCO",
          ativo: true,
        },
        data: {
          ativo: false,
        },
      });
    }

    // Busca o cardápio correspondente ao horário atual.
    const cardapio = await prisma.cardapio.findFirst({
      where: {
        data: dataHoje,
        periodo,
        ativo: true,
      },
      include: {
        cardapioOpcaoQuentinhas: {
          where: {
            disponivel: true,
            opcao: {
              ativo: true,
              disponivel: true,
            },
          },
          include: {
            opcao: true,
          },
          orderBy: {
            ordem: "asc",
          },
        },

        itens: {
          where: {
            disponivel: true,
            produto: {
              ativo: true,
              disponivel: true,
            },
          },
          include: {
            produto: true,
          },
          orderBy: {
            ordem: "asc",
          },
        },
      },
    });

    if (!cardapio) {
      throw new Error(
        periodo === "ALMOCO"
          ? "Não existe cardápio de almoço disponível para hoje."
          : "Não existe cardápio noturno disponível para hoje.",
      );
    }

    // Produtos individuais cadastrados no CardapioItem.
    const produtos = cardapio.itens
      .filter(
        (item) =>
          item.produto.tipo === "SIMPLES" ||
          (periodo === "NOITE" &&
            ["Jantinha P", "Jantinha M"].includes(item.produto.nome)),
      )
      .map((item) => ({
        id: item.produto.id,
        nome: item.produto.nome,
        descricao: item.produto.descricao,
        preco: Number(item.preco),
      }));
    // No almoço, disponibiliza os tamanhos de quentinha
    // e as opções para montar o prato.
    const acompanhamentos: { id: string; nome: string }[] = [];
    const proteinas: { id: string; nome: string }[] = [];
    const saladas: { id: string; nome: string }[] = [];

    for (const item of cardapio.cardapioOpcaoQuentinhas) {
      const opcao = {
        id: item.opcao.id,
        nome: item.opcao.nome,
      };

      if (item.tipo === "ACOMPANHAMENTO") {
        acompanhamentos.push(opcao);
      } else if (item.tipo === "PROTEINA") {
        proteinas.push(opcao);
      } else if (item.tipo === "SALADA") {
        saladas.push(opcao);
      }
    }

    const tamanhos =
      periodo === "ALMOCO"
        ? await prisma.tamanhoQuentinha.findMany({
            where: {
              ativo: true,
            },
            orderBy: {
              preco: "asc",
            },
          })
        : [];

    return {
      id: cardapio.id,
      data: `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`,
      periodo,

      produtos,

      tamanhos: tamanhos.map((tamanho) => ({
        id: tamanho.id,
        nome: tamanho.nome,
        preco: Number(tamanho.preco),
        maxProteinas: tamanho.maxProteinas,
      })),

      acompanhamentos,
      proteinas,
      saladas,
    };
  }
}

export { GetMenuService };

//=================================
//===============================
/*import { prisma } from "../../lib/prisma.js";

class GetMenuService {
  async execute() {
    const agora = new Date();

    const inicioDoDia = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate(),
    );

    const fimDoDia = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate() + 1,
    );

    // Busca o cardápio de hoje
    const cardapio = await prisma.cardapio.findFirst({
      where: {
        data: {
          gte: inicioDoDia,
          lt: fimDoDia,
        },
        ativo: true,
      },
      include: {
        cardapioOpcaoQuentinhas: {
          where: {
            disponivel: true,
            opcao: {
              ativo: true,
              disponivel: true,
            },
          },
          include: {
            opcao: true,
          },
          orderBy: {
            ordem: "asc",
          },
        },
      },
    });

    if (!cardapio) {
      throw new Error("Não existe cardápio disponível para hoje.");
    }

    // Busca os tamanhos disponíveis
    const tamanhos = await prisma.tamanhoQuentinha.findMany({
      where: {
        ativo: true,
      },
      orderBy: {
        preco: "asc",
      },
    });

    const acompanhamentos = [];
    const proteinas = [];
    const saladas = [];

    for (const item of cardapio.cardapioOpcaoQuentinhas) {
      const opcao = {
        id: item.opcao.id,
        nome: item.opcao.nome,
      };

      if (item.tipo === "ACOMPANHAMENTO") {
        acompanhamentos.push(opcao);
      }

      if (item.tipo === "PROTEINA") {
        proteinas.push(opcao);
      }

      if (item.tipo === "SALADA") {
        saladas.push(opcao);
      }
    }

    return {
      id: cardapio.id,

      data: cardapio.data.toISOString().split("T")[0],
      periodo,
      produtos,
      tamanhos: tamanhos.map((tamanho) => ({
        id: tamanho.id,
        nome: tamanho.nome,
        preco: Number(tamanho.preco),
        maxProteinas: tamanho.maxProteinas,
      })),

      acompanhamentos,
      proteinas,
      saladas,
    };
  }
}

export { GetMenuService };
*/
