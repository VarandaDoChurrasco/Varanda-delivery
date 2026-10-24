export interface ScheduledOrder {
  id: string;
  tipo: string;
  status: string;
  confirmadoEm: Date | null;
  updatedAt: Date;
}

export interface OrderStatusRepository {
  pending(): Promise<ScheduledOrder[]>;
  get(id: string): Promise<ScheduledOrder | null>;
  transition(order: ScheduledOrder, status: "SAIU_PARA_ENTREGA" | "ENTREGUE"): Promise<void>;
}

export interface SchedulerClock {
  now(): number;
  set(callback: () => void, delay: number): unknown;
  clear(timer: unknown): void;
}

const systemClock: SchedulerClock = {
  now: () => Date.now(),
  set: (callback, delay) => setTimeout(callback, delay),
  clear: (timer) => clearTimeout(timer as ReturnType<typeof setTimeout>),
};
const MINUTE = 60_000;
const retryDelay = (attempt: number) => Math.min(5_000 * 2 ** Math.min(attempt, 6), 300_000);
type Task = { timer?: unknown; attempt: number };

// No database work while idle. Each timer belongs to one pending order.
export class AutomaticOrderStatusService {
  private tasks = new Map<string, Task>();
  private recoveryTimer?: unknown;
  private started = false;
  private stopped = false;
  private revision = 0;

  constructor(
    private repository: OrderStatusRepository,
    private clock: SchedulerClock = systemClock,
    private report: (operation: string) => void = (operation) =>
      console.error(`Falha no agendador (${operation}); nova tentativa agendada.`),
  ) {}

  start(): void {
    if (this.started || this.stopped) return;
    this.started = true;
    void this.recover(0);
  }

  synchronize(order: ScheduledOrder): void {
    this.revision++;
    this.remove(order.id);
    if (this.stopped) return;
    const deadline = this.deadline(order);
    if (deadline === null) return;
    const task: Task = { attempt: 0 };
    this.tasks.set(order.id, task);
    this.arm(order.id, task, deadline - this.clock.now());
  }

  stop(): void {
    this.stopped = true;
    this.clock.clear(this.recoveryTimer);
    for (const id of this.tasks.keys()) this.remove(id);
  }

  private deadline(order: ScheduledOrder): number | null {
    if (order.tipo !== "DELIVERY" || !order.confirmadoEm) return null;
    const minutes = order.status === "PRONTO" ? 20 :
      order.status === "SAIU_PARA_ENTREGA" ? 60 : null;
    return minutes === null ? null : order.confirmadoEm.getTime() + minutes * MINUTE;
  }

  private remove(id: string): void {
    const task = this.tasks.get(id);
    if (task) this.clock.clear(task.timer);
    this.tasks.delete(id);
  }

  private arm(id: string, task: Task, delay: number): void {
    task.timer = this.clock.set(() => { void this.run(id, task); },
      Math.min(Math.max(0, delay), 2_147_483_647));
  }

  private async recover(attempt: number): Promise<void> {
    const revision = this.revision;
    try {
      const orders = await this.repository.pending();
      if (this.stopped) return;
      // A confirmation/manual change during the read invalidates its snapshot.
      if (revision !== this.revision) {
        this.recoveryTimer = this.clock.set(() => { void this.recover(0); }, 0);
        return;
      }
      for (const order of orders) {
        if (!this.tasks.has(order.id)) this.synchronize(order);
      }
    } catch {
      if (this.stopped) return;
      this.report("recuperação");
      this.recoveryTimer = this.clock.set(() => { void this.recover(attempt + 1); }, retryDelay(attempt));
    }
  }

  private async run(id: string, task: Task): Promise<void> {
    const current = () => !this.stopped && this.tasks.get(id) === task;
    try {
      // At most two overdue transitions, including recovery after downtime.
      for (let step = 0; step < 2; step++) {
        const order = await this.repository.get(id);
        if (!current()) return;
        const deadline = order && this.deadline(order);
        if (!order || deadline === null) { this.remove(id); return; }
        if (deadline > this.clock.now()) {
          task.attempt = 0;
          this.arm(id, task, deadline - this.clock.now());
          return;
        }
        await this.repository.transition(order,
          order.status === "PRONTO" ? "SAIU_PARA_ENTREGA" : "ENTREGUE");
        if (!current()) return;
      }
      // Re-read even after a conditional write loses a race or its result is uncertain.
      const order = await this.repository.get(id);
      if (!current()) return;
      if (order) this.synchronize(order);
      else this.remove(id);
    } catch {
      if (!current()) return;
      this.report("pedido");
      this.arm(id, task, retryDelay(task.attempt++));
    }
  }
}
