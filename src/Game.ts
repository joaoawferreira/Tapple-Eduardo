import { Player } from "./Player.js";
import { Timer, type TimerClock } from "./Timer.js";
import { LetterManager } from "./LetterManager.js";
import { CategoryManager } from "./CategoryManager.js";
import type { GameSettings, GameState, Move, RoundResult, SoundName } from "./types.js";
interface GameEvents {
  change(): void;
  tick(seconds: number, fraction: number): void;
  sound(name: SoundName): void;
}
export class Game {
  state: GameState = "MENU";
  players: Player[] = [];
  settings: GameSettings | null = null;
  round = 0;
  category = "";
  currentIndex = 0;
  history: Move[] = [];
  result: RoundResult | null = null;
  readonly letters = new LetterManager();
  readonly timer: Timer;
  private readonly categories = new CategoryManager();
  private lastWarning = 0;
  private inputReadyAt = 0;
  private readonly now: () => number;
  constructor(private readonly events: GameEvents, clock?: TimerClock) {
    this.now = clock?.now ?? (() => performance.now());
    this.timer = new Timer((seconds, fraction) => {
      events.tick(seconds, fraction);
      if (this.state === "PLAYING" && seconds > 0 && seconds <= 3 && seconds !== this.lastWarning) {
        this.lastWarning = seconds;
        events.sound("warning");
      }
    }, () => this.endRound("timeout"), clock);
  }
  get currentPlayer(): Player | undefined { return this.players[this.currentIndex]; }
  get isLastRound(): boolean { return this.settings !== null && this.settings.roundCount > 0 && this.round >= this.settings.roundCount; }
  get leaders(): Player[] {
    const highest = Math.max(...this.players.map(player => player.score));
    return this.players.filter(player => player.score === highest);
  }
  setup(): void { this.timer.stop(); this.state = "SETUP"; this.events.change(); }
  start(names: string[], settings: GameSettings): void {
    if (![2,3,4,5,6].includes(settings.playerCount) || names.length !== settings.playerCount ||
      ![5,10,15,20,30].includes(settings.turnTime) || ![0,3,5,10].includes(settings.roundCount)) {
      throw new Error("Configuração de partida inválida.");
    }
    this.settings = { ...settings };
    this.players = names.map((name, index) => new Player(index, name.trim().slice(0,24) || `Jogador ${index+1}`));
    this.round = 0;
    this.history = [];
    this.nextRound();
  }
  nextRound(): void {
    if (!this.settings || (this.round > 0 && this.state !== "ROUND_END")) return;
    if (this.round > 0 && this.isLastRound) { this.finish(); return; }
    this.round++;
    this.category = this.categories.draw();
    this.beginRound();
  }
  private beginRound(): void {
    if (!this.settings) return;
    this.timer.stop();
    this.result = null;
    this.letters.reset();
    this.currentIndex = (this.round - 1) % this.players.length;
    this.state = "PLAYING";
    this.inputReadyAt = this.now() + 250;
    this.activate();
    this.events.change();
    this.startTimer();
  }
  private activate(): void {
    this.players.forEach((player, index) => { player.isActive = index === this.currentIndex; });
  }
  private startTimer(): void {
    if (!this.settings) return;
    this.lastWarning = 0;
    this.timer.start(this.settings.turnTime);
  }
  selectLetter(raw: string): boolean {
    if (this.state !== "PLAYING" || this.now() < this.inputReadyAt) return false;
    if (this.timer.isExpired()) { this.endRound("timeout"); return false; }
    const letter = raw.toUpperCase();
    if (!this.currentPlayer || !this.letters.use(letter)) return false;
    this.timer.stop();
    this.history.unshift({ playerId: this.currentPlayer.id, playerName: this.currentPlayer.name, letter, round: this.round });
    this.history = this.history.slice(0,100);
    this.events.sound("letter");
    if (this.letters.remaining === 0) { this.endRound("all-letters"); return true; }
    this.currentIndex = (this.currentIndex + 1) % this.players.length;
    this.inputReadyAt = this.now() + 250;
    this.activate();
    this.events.change();
    this.events.sound("turn");
    this.startTimer();
    return true;
  }
  private endRound(reason: RoundResult["reason"]): void {
    if (this.state !== "PLAYING") return;
    this.timer.stop();
    const loser = reason === "timeout" ? this.currentPlayer : null;
    this.result = { reason, loserName: loser?.name ?? null };
    this.players.forEach(player => { if (player !== loser) player.awardPoint(); player.isActive = false; });
    this.state = "ROUND_END";
    this.events.sound(reason === "timeout" ? "timeout" : "victory");
    this.events.change();
  }
  pause(): void {
    if (this.state !== "PLAYING") return;
    if (this.timer.isExpired()) { this.endRound("timeout"); return; }
    this.timer.pause();
    this.state = "PAUSED";
    this.events.change();
  }
  resume(): void {
    if (this.state !== "PAUSED") return;
    this.state = "PLAYING";
    this.inputReadyAt = this.now() + 250;
    this.events.change();
    this.timer.resume();
  }
  restartRound(): void {
    if (this.state !== "PAUSED") return;
    this.history = this.history.filter(move => move.round !== this.round);
    this.beginRound();
  }
  finish(): void {
    if (this.state !== "ROUND_END") return;
    this.timer.stop();
    this.state = "GAME_END";
    this.events.sound("victory");
    this.events.change();
  }
  replay(): void {
    if (this.settings) this.start(this.players.map(player => player.name), this.settings);
  }
  menu(): void {
    this.timer.stop();
    this.players.forEach(player => { player.isActive = false; });
    this.state = "MENU";
    this.events.change();
  }
}
