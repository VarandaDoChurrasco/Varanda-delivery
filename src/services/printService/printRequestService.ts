import { prisma } from "../../lib/prisma.js";

const orderInclude = {
  cliente: true,
  bairro: true,
  itens: { include: { escolhas: true, adicionais: true, remocoes: true } },
  refrigerantes: { include: { refrigerante: true } },
} as const;

export class PrintRequestError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
  }
}

export class PrintRequestService {
  async pending() {
    // SENT rows are retained forever for deduplication, but never recovered as work.
    return prisma.printRequest.findMany({
      where: { status: { in: ["PENDING", "ATTEMPTED"] } },
      orderBy: { createdAt: "asc" },
    });
  }

  async action(pedidoId: string, action: string, attempt?: number) {
    if (action === "inspect" || action === "manual") {
      // Only an explicit manual print can create a request for an old order.
      const existing = await prisma.printRequest.findUnique({
        where: { pedidoId },
      });
      if (existing) return existing;
      if (action === "inspect")
        throw new PrintRequestError("Solicitação não encontrada", 404);
      const pedido = await prisma.pedido.findUnique({
        where: { id: pedidoId },
        include: orderInclude,
      });
      if (!pedido) throw new PrintRequestError("Pedido não encontrado", 404);
      return prisma.printRequest.upsert({
        where: { pedidoId },
        update: {},
        create: { pedidoId, payload: JSON.parse(JSON.stringify(pedido)) },
      });
    }
    if (
      !["start", "sent", "printed", "retry"].includes(action) ||
      !Number.isInteger(attempt) ||
      attempt! < 0
    ) {
      throw new PrintRequestError("Ação ou tentativa inválida", 400);
    }
    const expected = attempt!;
    const status =
      action === "start"
        ? ["PENDING" as const]
        : action === "retry"
        ? ["ATTEMPTED" as const, "SENT" as const]
        : ["ATTEMPTED" as const];
    const updated = await prisma.printRequest.updateMany({
      where: { pedidoId, attempt: expected, status: { in: status } },
      data:
        action === "start"
          ? {
              status: "ATTEMPTED",
              attempt: { increment: 1 },
              attemptedAt: new Date(),
              completedAt: null,
              confirmedByOperator: false,
            }
          : action === "retry"
          ? {
              // Invalidate old completion messages and repeated operator commands.
              status: "PENDING",
              attempt: { increment: 1 },
              attemptedAt: null,
              completedAt: null,
              confirmedByOperator: false,
            }
          : {
              status: "SENT",
              completedAt: new Date(),
              confirmedByOperator: action === "printed",
            },
    });
    const request = await prisma.printRequest.findUnique({
      where: { pedidoId },
    });
    if (!request)
      throw new PrintRequestError("Solicitação não encontrada", 404);
    // Completion is safe to resend after a response is lost. Start is NOT:
    // only the caller that won the PENDING transition may touch Bluetooth.
    if (
      !updated.count &&
      !(
        ["sent", "printed"].includes(action) &&
        request.status === "SENT" &&
        request.attempt === expected
      )
    ) {
      throw new PrintRequestError(
        "Solicitação já tentada ou alterada. Sincronize antes de continuar.",
        409
      );
    }
    return request;
  }
}
