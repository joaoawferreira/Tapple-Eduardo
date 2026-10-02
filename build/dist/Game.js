import { Player } from "./Player.js";
import { Timer } from "./Timer.js";
import { LetterManager } from "./LetterManager.js";
import { CategoryManager } from "./CategoryManager.js";
export class Game {
    events;
    state = "MENU";
    players = [];
    settings = null;
    round = 0;
    category = "";
    currentIndex = 0;
    history = [];
    result = null;
    letters = new LetterManager();
    timer;
    categories = new CategoryManager();
    lastWarning = 0;
    inputReadyAt = 0;
    now;
    constructor(events, clock) {
        this.events = events;
        this.now = clock?.now ?? (() => performance.now());
        this.timer = new Timer((seconds, fraction) => {
            events.tick(seconds, fraction);
            if (this.state === "PLAYING" && seconds > 0 && seconds <= 3 && seconds !== this.lastWarning) {
                this.lastWarning = seconds;
                events.sound("warning");
            }
        }, () => this.endRound("timeout"), clock);
    }
    get currentPlayer() { return this.players[this.currentIndex]; }
    get isLastRound() { return this.settings !== null && this.settings.roundCount > 0 && this.round >= this.settings.roundCount; }
    get leaders() {
        const highest = Math.max(...this.players.map(player => player.score));
        return this.players.filter(player => player.score === highest);
    }
    setup() { this.timer.stop(); this.state = "SETUP"; this.events.change(); }
    start(names, settings) {
        if (![2, 3, 4, 5, 6].includes(settings.playerCount) || names.length !== settings.playerCount ||
            ![5, 10, 15, 20, 30].includes(settings.turnTime) || ![0, 3, 5, 10].includes(settings.roundCount)) {
            throw new Error("Configuração de partida inválida.");
        }
        this.settings = { ...settings };
        this.players = names.map((name, index) => new Player(index, name.trim().slice(0, 24) || `Jogador ${index + 1}`));
        this.round = 0;
        this.history = [];
        this.nextRound();
    }
    nextRound() {
        if (!this.settings || (this.round > 0 && this.state !== "ROUND_END"))
            return;
        if (this.round > 0 && this.isLastRound) {
            this.finish();
            return;
        }
        this.round++;
        this.category = this.categories.draw();
        this.beginRound();
    }
    beginRound() {
        if (!this.settings)
            return;
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
    activate() {
        this.players.forEach((player, index) => { player.isActive = index === this.currentIndex; });
    }
    startTimer() {
        if (!this.settings)
            return;
        this.lastWarning = 0;
        this.timer.start(this.settings.turnTime);
    }
    selectLetter(raw) {
        if (this.state !== "PLAYING" || this.now() < this.inputReadyAt)
            return false;
        if (this.timer.isExpired()) {
            this.endRound("timeout");
            return false;
        }
        const letter = raw.toUpperCase();
        if (!this.currentPlayer || !this.letters.use(letter))
            return false;
        this.timer.stop();
        this.history.unshift({ playerId: this.currentPlayer.id, playerName: this.currentPlayer.name, letter, round: this.round });
        this.history = this.history.slice(0, 100);
        this.events.sound("letter");
        if (this.letters.remaining === 0) {
            this.endRound("all-letters");
            return true;
        }
        this.currentIndex = (this.currentIndex + 1) % this.players.length;
        this.inputReadyAt = this.now() + 250;
        this.activate();
        this.events.change();
        this.events.sound("turn");
        this.startTimer();
        return true;
    }
    endRound(reason) {
        if (this.state !== "PLAYING")
            return;
        this.timer.stop();
        const loser = reason === "timeout" ? this.currentPlayer : null;
        this.result = { reason, loserName: loser?.name ?? null };
        this.players.forEach(player => { if (player !== loser)
            player.awardPoint(); player.isActive = false; });
        this.state = "ROUND_END";
        this.events.sound(reason === "timeout" ? "timeout" : "victory");
        this.events.change();
    }
    pause() {
        if (this.state !== "PLAYING")
            return;
        if (this.timer.isExpired()) {
            this.endRound("timeout");
            return;
        }
        this.timer.pause();
        this.state = "PAUSED";
        this.events.change();
    }
    resume() {
        if (this.state !== "PAUSED")
            return;
        this.state = "PLAYING";
        this.inputReadyAt = this.now() + 250;
        this.events.change();
        this.timer.resume();
    }
    restartRound() {
        if (this.state !== "PAUSED")
            return;
        this.history = this.history.filter(move => move.round !== this.round);
        this.beginRound();
    }
    finish() {
        if (this.state !== "ROUND_END")
            return;
        this.timer.stop();
        this.state = "GAME_END";
        this.events.sound("victory");
        this.events.change();
    }
    replay() {
        if (this.settings)
            this.start(this.players.map(player => player.name), this.settings);
    }
    menu() {
        this.timer.stop();
        this.players.forEach(player => { player.isActive = false; });
        this.state = "MENU";
        this.events.change();
    }
}
