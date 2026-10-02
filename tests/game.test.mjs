import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../dist/Game.js";
import { Timer } from "../dist/Timer.js";
import { CategoryManager } from "../dist/CategoryManager.js";
import { StorageManager, DEFAULT_SETTINGS } from "../dist/StorageManager.js";
function fakeClock() {
  let time = 0, serial = 0;
  const callbacks = new Map();
  return {
    now: () => time,
    every: callback => { callbacks.set(++serial, callback); return serial; },
    cancel: handle => callbacks.delete(handle),
    advance(ms, flush = true) {
      time += ms;
      if (flush) [...callbacks.values()].forEach(callback => callback());
    },
    get active() { return callbacks.size; }
  };
}
function match(overrides = {}, names = ["Ana", "Bia", "Caio"]) {
  const clock = fakeClock();
  const game = new Game({ change() {}, tick() {}, sound() {} }, clock);
  game.start(names, { ...DEFAULT_SETTINGS, playerCount: names.length, ...overrides });
  return { game, clock };
}
test("alterna jogadores, bloqueia letras e rejeita duplo acionamento", () => {
  const { game, clock } = match();
  clock.advance(300);
  assert.equal(game.selectLetter("a"), true);
  assert.equal(game.currentPlayer.name, "Bia");
  assert.equal(game.letters.remaining, 25);
  assert.equal(game.selectLetter("B"), false);
  clock.advance(300);
  assert.equal(game.selectLetter("A"), false);
  assert.equal(game.selectLetter("B"), true);
  assert.equal(game.currentPlayer.name, "Caio");
  clock.advance(300);
  assert.equal(game.selectLetter("C"), true);
  assert.equal(game.currentPlayer.name, "Ana");
  assert.equal(clock.active, 1);
});
test("expiração pontua apenas os demais e nunca duplica pontos", () => {
  const { game, clock } = match();
  clock.advance(10000);
  assert.equal(game.state, "ROUND_END");
  assert.deepEqual(game.players.map(player => player.score), [0,1,1]);
  clock.advance(10000);
  assert.deepEqual(game.players.map(player => player.wins), [0,1,1]);
  assert.equal(game.selectLetter("A"), false);
  assert.equal(clock.active, 0);
});
test("clique posterior ao prazo é recusado mesmo antes do callback", () => {
  const { game, clock } = match();
  clock.advance(11000, false);
  assert.equal(game.selectLetter("A"), false);
  assert.equal(game.state, "ROUND_END");
});
test("pausa preserva tempo e impede letras; retomar só expira no prazo restante", () => {
  const { game, clock } = match();
  clock.advance(3250);
  game.pause();
  clock.advance(30000);
  assert.equal(game.state, "PAUSED");
  assert.equal(game.selectLetter("A"), false);
  game.resume();
  clock.advance(6749);
  assert.equal(game.state, "PLAYING");
  clock.advance(1);
  assert.equal(game.state, "ROUND_END");
});
test("nova rodada libera letras, alterna início e troca categoria", () => {
  const { game, clock } = match();
  const category = game.category;
  clock.advance(300); game.selectLetter("A"); clock.advance(10000);
  game.nextRound();
  assert.equal(game.round, 2);
  assert.equal(game.currentPlayer.name, "Bia");
  assert.equal(game.letters.remaining, 26);
  assert.notEqual(game.category, category);
});
test("última rodada, empate e revanche com configurações iguais", () => {
  const { game, clock } = match({ roundCount: 3 });
  for (let i = 0; i < 3; i++) { clock.advance(10000); game.nextRound(); }
  assert.equal(game.state, "GAME_END");
  assert.equal(game.leaders.length, 3);
  assert.deepEqual(game.players.map(player => player.score), [2,2,2]);
  game.replay();
  assert.equal(game.state, "PLAYING");
  assert.equal(game.round, 1);
  assert.deepEqual(game.players.map(player => player.score), [0,0,0]);
  assert.equal(game.settings.roundCount, 3);
});
test("26 letras pontuam todos e modo ilimitado encerra manualmente", () => {
  const { game, clock } = match({ roundCount: 0, turnTime: 5 });
  for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") { clock.advance(300); assert.equal(game.selectLetter(letter), true); }
  assert.equal(game.result.reason, "all-letters");
  assert.deepEqual(game.players.map(player => player.score), [1,1,1]);
  game.nextRound();
  clock.advance(5000);
  assert.equal(game.isLastRound, false);
  game.finish();
  assert.equal(game.state, "GAME_END");
});
test("reiniciar rodada preserva placar e remove apenas jogadas atuais", () => {
  const { game, clock } = match();
  clock.advance(300); game.selectLetter("A"); clock.advance(10000);
  game.nextRound();
  const scores = game.players.map(player => player.score);
  clock.advance(300); game.selectLetter("B"); game.pause(); game.restartRound();
  assert.deepEqual(game.players.map(player => player.score), scores);
  assert.equal(game.history.length, 1);
  assert.equal(game.history[0].letter, "A");
  assert.equal(game.letters.remaining, 26);
  assert.equal(game.round, 2);
  assert.equal(game.currentPlayer.name, "Bia");
});
test("categorias não se repetem consecutivamente", () => {
  const categories = new CategoryManager(["A", "B", "C"], () => 0);
  let previous = "";
  for (let i = 0; i < 50; i++) { const current = categories.draw(); assert.notEqual(current, previous); previous = current; }
});
test("Timer usa tempo real, pausa e expira uma única vez", () => {
  const clock = fakeClock(); let expired = 0; let seconds = 0;
  const timer = new Timer(value => { seconds = value; }, () => expired++, clock);
  timer.start(10); clock.advance(4000); assert.equal(seconds, 6);
  timer.pause(); clock.advance(20000); timer.resume();
  clock.advance(6000); clock.advance(5000);
  assert.equal(expired, 1); assert.equal(clock.active, 0);
});
test("armazenamento inválido ou indisponível usa padrões seguros", () => {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: () => '{"settings":{"turnTime":-4,"playerCount":99,"volume":9},"names":["<script>"]}',
    setItem: () => { throw new Error("Sem acesso"); }
  } });
  const loaded = StorageManager.load();
  assert.equal(loaded.settings.turnTime, 10);
  assert.equal(loaded.settings.playerCount, 2);
  assert.equal(loaded.settings.volume, 1);
  assert.equal(StorageManager.save(loaded), false);
  delete globalThis.localStorage;
  assert.equal(StorageManager.load().settings.turnTime, 10);
});
test("menu para cronômetro e configuração inválida é rejeitada", () => {
  const { game, clock } = match();
  game.menu(); clock.advance(15000);
  assert.equal(game.state, "MENU");
  assert.equal(clock.active, 0);
  assert.throws(() => game.start(["A"], { ...DEFAULT_SETTINGS, playerCount: 1 }));
});
