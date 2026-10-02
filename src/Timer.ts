export interface TimerClock {
  now(): number;
  every(callback: () => void): ReturnType<typeof setInterval>;
  cancel(handle: ReturnType<typeof setInterval>): void;
}
const defaultClock: TimerClock = {
  now: () => performance.now(),
  every: callback => setInterval(callback, 40),
  cancel: handle => clearInterval(handle)
};
export class Timer {
  private handle: ReturnType<typeof setInterval> | null = null;
  private deadline = 0;
  private remainingMs = 0;
  private running = false;
  constructor(private readonly onTick: (seconds: number, fraction: number) => void,
    private readonly onExpire: () => void,
    private readonly clock: TimerClock = defaultClock) {}
  private totalMs = 1;
  start(seconds: number): void {
    this.stop();
    this.totalMs = seconds * 1000;
    this.remainingMs = this.totalMs;
    this.resume();
  }
  resume(): void {
    if (this.running || this.remainingMs <= 0) return;
    this.running = true;
    this.deadline = this.clock.now() + this.remainingMs;
    this.handle = this.clock.every(() => this.tick());
    this.tick();
  }
  private tick(): void {
    if (!this.running) return;
    this.remainingMs = Math.max(0, this.deadline - this.clock.now());
    this.onTick(Math.ceil(this.remainingMs / 1000), this.remainingMs / this.totalMs);
    if (this.remainingMs <= 0) {
      this.stop();
      this.onExpire();
    }
  }
  // Conferir o prazo também no clique evita aceitar respostas após o fim do tempo.
  isExpired(): boolean {
    return this.running && this.clock.now() >= this.deadline;
  }
  pause(): void {
    if (!this.running) return;
    this.remainingMs = Math.max(0, this.deadline - this.clock.now());
    this.clearHandle();
  }
  stop(): void { this.clearHandle(); this.remainingMs = 0; }
  private clearHandle(): void {
    if (this.handle !== null) this.clock.cancel(this.handle);
    this.handle = null;
    this.running = false;
  }
}
