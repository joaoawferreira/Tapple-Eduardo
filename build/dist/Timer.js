const defaultClock = {
    now: () => performance.now(),
    every: callback => setInterval(callback, 40),
    cancel: handle => clearInterval(handle)
};
export class Timer {
    onTick;
    onExpire;
    clock;
    handle = null;
    deadline = 0;
    remainingMs = 0;
    running = false;
    constructor(onTick, onExpire, clock = defaultClock) {
        this.onTick = onTick;
        this.onExpire = onExpire;
        this.clock = clock;
    }
    totalMs = 1;
    start(seconds) {
        this.stop();
        this.totalMs = seconds * 1000;
        this.remainingMs = this.totalMs;
        this.resume();
    }
    resume() {
        if (this.running || this.remainingMs <= 0)
            return;
        this.running = true;
        this.deadline = this.clock.now() + this.remainingMs;
        this.handle = this.clock.every(() => this.tick());
        this.tick();
    }
    tick() {
        if (!this.running)
            return;
        this.remainingMs = Math.max(0, this.deadline - this.clock.now());
        this.onTick(Math.ceil(this.remainingMs / 1000), this.remainingMs / this.totalMs);
        if (this.remainingMs <= 0) {
            this.stop();
            this.onExpire();
        }
    }
    // Conferir o prazo também no clique evita aceitar respostas após o fim do tempo.
    isExpired() {
        return this.running && this.clock.now() >= this.deadline;
    }
    pause() {
        if (!this.running)
            return;
        this.remainingMs = Math.max(0, this.deadline - this.clock.now());
        this.clearHandle();
    }
    stop() { this.clearHandle(); this.remainingMs = 0; }
    clearHandle() {
        if (this.handle !== null)
            this.clock.cancel(this.handle);
        this.handle = null;
        this.running = false;
    }
}
