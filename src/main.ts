import { OnlineGame } from "./OnlineGame.js";
import { Game } from "./Game.js";
import { ALPHABET } from "./LetterManager.js";
import { SoundManager } from "./SoundManager.js";
import { StorageManager } from "./StorageManager.js";
import type { Player } from "./Player.js";
import type { GameState } from "./types.js";

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Elemento ausente: ${id}`);
  return found as T;
}
const preferences = StorageManager.load();
const sound = new SoundManager();
let previousState: GameState | null = null;
let pendingConfirmation: (() => void) | null = null;
let toastHandle: ReturnType<typeof setTimeout> | undefined;
let lastSeconds = -1;
const dialogs = {
  help: element<HTMLDialogElement>("help-dialog"),
  settings: element<HTMLDialogElement>("settings-dialog"),
  pause: element<HTMLDialogElement>("pause-dialog"),
  confirm: element<HTMLDialogElement>("confirm-dialog")
};
const screens: Record<Exclude<GameState, "PAUSED">, HTMLElement> = {
  MENU: element("menu-screen"), SETUP: element("setup-screen"),
  PLAYING: element("game-screen"), ROUND_END: element("round-screen"), GAME_END: element("end-screen")
};
const game = new Game({
  change: render,
  tick: (seconds, fraction) => {
    element("timer-number").textContent = String(seconds);
    document.getElementById("timer-progress")?.setAttribute("stroke-dashoffset", String((1 - fraction) * 100));
    element("timer").classList.toggle("urgent", seconds > 0 && seconds <= 3);
    if (seconds !== lastSeconds) {
      element("timer").setAttribute("aria-label", `${seconds} segundos restantes`);
      lastSeconds = seconds;
    }
  },
  sound: name => sound.play(name)
});
function announce(message: string): void {
  const toast = element("status-message");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastHandle);
  toastHandle = setTimeout(() => toast.classList.remove("visible"), 4500);
}
function save(): void {
  if (!StorageManager.save(preferences)) announce("Não foi possível salvar preferências neste navegador. Você ainda pode jogar.");
}
function syncSound(): void {
  sound.enabled = preferences.settings.soundEnabled;
  sound.volume = preferences.settings.volume;
  element<HTMLInputElement>("sound-toggle").checked = sound.enabled;
  element<HTMLInputElement>("volume").value = String(Math.round(sound.volume * 100));
  element("volume-output").textContent = `${Math.round(sound.volume * 100)}%`;
  element("sound-button").textContent = sound.enabled ? "♪" : "♪̸";
  element("sound-button").setAttribute("aria-pressed", String(sound.enabled));
  element("sound-button").setAttribute("aria-label", sound.enabled ? "Desligar sons" : "Ligar sons");
}
function openDialog(dialog: HTMLDialogElement): void { if (!dialog.open) dialog.showModal(); }
function closeAllDialogs(): void { Object.values(dialogs).forEach(dialog => { if (dialog.open) dialog.close(); }); }
function showHelp(): void {
  if (game.state === "PLAYING") game.pause();
  openDialog(dialogs.help);
}
function confirmAction(title: string, description: string, buttonText: string, action: () => void): void {
  pendingConfirmation = action;
  element("confirm-title").textContent = title;
  element("confirm-description").textContent = description;
  element("confirm-accept").textContent = buttonText;
  openDialog(dialogs.confirm);
  element("confirm-cancel").focus();
}
function requestMenu(): void {
  if (game.state === "PLAYING") game.pause();
  if (["PAUSED", "ROUND_END"].includes(game.state)) {
    confirmAction("Abandonar a partida?", "O placar desta partida será perdido. Os nomes e as configurações continuarão salvos.",
      "Sim, voltar ao menu", () => { closeAllDialogs(); game.menu(); });
  } else { closeAllDialogs(); game.menu(); }
}
function collectNames(): void {
  document.querySelectorAll<HTMLInputElement>("#player-fields input").forEach((input, i) => {
    preferences.names[i] = input.value.slice(0,24);
  });
}
function renderPlayerFields(): void {
  const container = element("player-fields");
  container.replaceChildren();
  for (let i = 0; i < preferences.settings.playerCount; i++) {
    const label = document.createElement("label");
    label.textContent = `Jogador ${i+1}`;
    const input = document.createElement("input");
    input.id = `player-name-${i}`;
    input.name = `player-${i}`;
    input.maxLength = 24;
    input.autocomplete = "off";
    input.placeholder = `Jogador ${i+1}`;
    input.value = preferences.names[i] ?? `Jogador ${i+1}`;
    input.addEventListener("change", () => { collectNames(); save(); });
    label.append(input);
    container.append(label);
  }
  document.querySelectorAll<HTMLButtonElement>("[data-count]").forEach(button => {
    button.setAttribute("aria-pressed", String(Number(button.dataset.count) === preferences.settings.playerCount));
  });
}
function populateSetup(): void {
  renderPlayerFields();
  element<HTMLSelectElement>("turn-time").value = String(preferences.settings.turnTime);
  element<HTMLSelectElement>("round-count").value = String(preferences.settings.roundCount);
  element("setup-error").textContent = "";
}
function renderScores(target: string, players: Player[], highlight: boolean): void {
  const list = element(target);
  list.replaceChildren();
  const ordered = highlight ? players : [...players].sort((a,b) => b.score - a.score || a.id - b.id);
  ordered.forEach(player => {
    const row = document.createElement("li");
    if (highlight && player.isActive) row.classList.add("active");
    const avatar = document.createElement("span");
    avatar.className = `avatar color-${player.id}`;
    avatar.textContent = Array.from(player.name)[0]?.toUpperCase() ?? "?";
    avatar.setAttribute("aria-hidden", "true");
    const name = document.createElement("span");
    name.className = "score-name";
    name.textContent = player.name;
    if (highlight && player.isActive) {
      const badge = document.createElement("small"); badge.textContent = "Sua vez"; name.append(badge);
    }
    const score = document.createElement("span");
    score.className = "score-points";
    score.textContent = String(player.score);
    score.setAttribute("aria-label", `${player.score} pontos`);
    row.append(avatar, name, score);
    list.append(row);
  });
}
function renderHistory(): void {
  const list = element("move-history");
  list.replaceChildren();
  if (game.history.length === 0) {
    const empty = document.createElement("li");
    empty.className = "history-empty";
    empty.textContent = "A primeira letra está esperando por vocês.";
    list.append(empty);
  }
  game.history.slice(0,5).forEach(move => {
    const item = document.createElement("li");
    const letter = document.createElement("span");
    letter.className = "history-letter";
    letter.textContent = move.letter;
    const description = document.createElement("span");
    description.className = "history-description";
    description.textContent = move.playerName;
    const round = document.createElement("small");
    round.textContent = `Rodada ${move.round}`;
    description.append(round);
    item.append(letter, description);
    list.append(item);
  });
}
function render(): void {
  const displayState = game.state === "PAUSED" ? "PLAYING" : game.state;
  Object.entries(screens).forEach(([state, screen]) => { screen.hidden = state !== displayState; });
  if (game.state === "PLAYING" || game.state === "PAUSED") {
    const limit = game.settings?.roundCount || "∞";
    element("round-label").textContent = `RODADA ${game.round} DE ${limit}`;
    element("category-title").textContent = game.category;
    const turn = element("turn-label");
    turn.replaceChildren("Vez de ");
    const name = document.createElement("strong");
    name.textContent = game.currentPlayer?.name ?? "";
    turn.append(name);
    turn.classList.remove("changing");
    void turn.offsetWidth;
    turn.classList.add("changing");
    element("letters-remaining").textContent = String(game.letters.remaining);
    document.querySelectorAll<HTMLButtonElement>("[data-letter]").forEach(button => {
      const used = game.letters.isUsed(button.dataset.letter ?? "");
      button.disabled = used || game.state !== "PLAYING";
      button.classList.toggle("used", used);
      button.setAttribute("aria-label", `Letra ${button.dataset.letter}${used ? ", já utilizada" : ""}`);
    });
    renderScores("live-score", game.players, true);
    renderHistory();
  }
  if (game.state === "PAUSED") openDialog(dialogs.pause);
  else if (dialogs.pause.open) dialogs.pause.close();
  if (game.state === "ROUND_END") {
    element("round-end-label").textContent = `FIM DA RODADA ${game.round}`;
    element("round-end-title").textContent = game.result?.reason === "all-letters" ? "Alfabeto completo!" : "O tempo acabou!";
    element("round-result-message").textContent = game.result?.reason === "all-letters"
      ? "Vocês usaram todas as letras! Cada jogador ganha 1 ponto."
      : `${game.result?.loserName} não respondeu a tempo. Os demais ganham 1 ponto!`;
    renderScores("round-score", game.players, false);
    element("next-category").hidden = game.isLastRound;
    element("next-round-button").textContent = game.isLastRound ? "VER RESULTADO FINAL" : "PRÓXIMA RODADA";
    element("finish-unlimited").hidden = game.settings?.roundCount !== 0;
  }
  if (game.state === "GAME_END") {
    element("winner-label").textContent = game.leaders.length > 1 ? "VITÓRIA COMPARTILHADA" : "VENCEDOR";
    element("end-title").textContent = game.leaders.map(player => player.name).join(" + ");
    element("winner-description").textContent = `${game.leaders[0]?.score ?? 0} pontos · ${game.round} rodadas de boas ideias.`;
    renderScores("final-score", game.players, false);
  }
  if (previousState !== game.state) {
    if (game.state === "SETUP") populateSetup();
    if (game.state !== "PAUSED" && previousState !== "PAUSED") {
      const heading = screens[displayState].querySelector<HTMLElement>("h1");
      if (heading && previousState !== null) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }
  previousState = game.state;
}
function selectLetter(letter: string): void {
  sound.unlock();
  if (game.selectLetter(letter)) {
    const button = document.querySelector<HTMLButtonElement>(`[data-letter="${letter}"]`);
    button?.classList.add("just-used");
  }
}
for (const letter of ALPHABET) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = letter;
  button.dataset.letter = letter;
  button.className = "letter-button";
  button.setAttribute("aria-label", `Letra ${letter}`);
  button.addEventListener("click", () => selectLetter(letter));
  button.addEventListener("animationend", () => button.classList.remove("just-used"));
  element("letter-board").append(button);
}
const online = new OnlineGame(sound, () => { closeAllDialogs(); game.menu(); });
element("play-button").addEventListener("click", () => game.setup());
element("setup-back").addEventListener("click", () => { collectNames(); save(); game.menu(); });
element("brand-home").addEventListener("click", event => { event.preventDefault(); if (online.active) online.requestExit(); else requestMenu(); });
element("help-button").addEventListener("click", showHelp);
element("menu-help").addEventListener("click", showHelp);
element("settings-button").addEventListener("click", () => openDialog(dialogs.settings));
document.querySelectorAll<HTMLButtonElement>("[data-close]").forEach(button => {
  button.addEventListener("click", () => element<HTMLDialogElement>(button.dataset.close ?? "").close());
});
element("player-count").addEventListener("click", event => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-count]");
  if (!button) return;
  collectNames();
  preferences.settings.playerCount = Number(button.dataset.count);
  renderPlayerFields();
  save();
});
element("turn-time").addEventListener("change", () => {
  preferences.settings.turnTime = Number(element<HTMLSelectElement>("turn-time").value); save();
});
element("round-count").addEventListener("change", () => {
  preferences.settings.roundCount = Number(element<HTMLSelectElement>("round-count").value); save();
});
element("setup-form").addEventListener("submit", event => {
  event.preventDefault();
  collectNames();
  const names = Array.from({ length: preferences.settings.playerCount }, (_, i) => preferences.names[i]?.trim() || `Jogador ${i+1}`);
  if (new Set(names.map(name => name.toLocaleLowerCase("pt-BR"))).size !== names.length) {
    element("setup-error").textContent = "Escolha nomes diferentes para identificar cada jogador."; return;
  }
  names.forEach((name, i) => { preferences.names[i] = name; });
  save();
  sound.unlock();
  game.start(names, preferences.settings);
});
element("sound-button").addEventListener("click", () => {
  preferences.settings.soundEnabled = !preferences.settings.soundEnabled;
  syncSound(); sound.unlock(); save();
});
element("sound-toggle").addEventListener("change", () => {
  preferences.settings.soundEnabled = element<HTMLInputElement>("sound-toggle").checked;
  syncSound(); sound.unlock(); sound.play("letter"); save();
});
element("volume").addEventListener("input", () => {
  preferences.settings.volume = Number(element<HTMLInputElement>("volume").value) / 100;
  syncSound(); save();
});
element("volume").addEventListener("change", () => { sound.unlock(); sound.play("letter"); });
element("pause-button").addEventListener("click", () => game.pause());
element("resume-button").addEventListener("click", () => game.resume());
element("pause-menu-button").addEventListener("click", requestMenu);
element("restart-round-button").addEventListener("click", () => {
  confirmAction("Reiniciar esta rodada?", "As letras e jogadas desta rodada serão apagadas. O placar das rodadas anteriores será mantido.",
    "Sim, reiniciar rodada", () => game.restartRound());
});
element("confirm-cancel").addEventListener("click", () => { pendingConfirmation = null; dialogs.confirm.close(); });
element("confirm-accept").addEventListener("click", () => {
  const action = pendingConfirmation; pendingConfirmation = null; dialogs.confirm.close(); action?.();
});
dialogs.confirm.addEventListener("cancel", () => { pendingConfirmation = null; });
dialogs.pause.addEventListener("cancel", event => { event.preventDefault(); game.resume(); });
element("next-round-button").addEventListener("click", () => { sound.unlock(); game.nextRound(); });
element("finish-unlimited").addEventListener("click", () => game.finish());
element("replay-button").addEventListener("click", () => {
  if (game.settings) {
    game.settings.soundEnabled = preferences.settings.soundEnabled;
    game.settings.volume = preferences.settings.volume;
  }
  sound.unlock(); game.replay();
});
element("new-game-button").addEventListener("click", () => game.setup());
element("end-menu-button").addEventListener("click", () => game.menu());
const fullscreen = element<HTMLButtonElement>("fullscreen-button");
if (!document.fullscreenEnabled) { fullscreen.disabled = true; fullscreen.title = "Tela cheia indisponível neste navegador"; }
fullscreen.addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { announce("O navegador não permitiu ativar a tela cheia."); }
});
document.addEventListener("fullscreenchange", () => {
  fullscreen.setAttribute("aria-label", document.fullscreenElement ? "Sair da tela cheia" : "Ativar tela cheia");
});
document.addEventListener("keydown", event => {
  const target = event.target as HTMLElement | null;
  if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || target?.closest("input, select, textarea, [contenteditable=true]")) return;
  const blockingDialog = dialogs.help.open || dialogs.settings.open || dialogs.confirm.open;
  if (blockingDialog) return;
  if (event.code === "Space" && (game.state === "PLAYING" || game.state === "PAUSED")) {
    event.preventDefault();
    if (game.state === "PLAYING") game.pause(); else game.resume();
  } else if (event.key === "Escape" && game.state === "PLAYING") {
    event.preventDefault(); game.pause();
  } else if (game.state === "PLAYING" && /^[a-z]$/i.test(event.key)) {
    event.preventDefault(); selectLetter(event.key.toUpperCase());
  }
});
document.addEventListener("visibilitychange", () => { if (document.hidden) game.pause(); });
syncSound();
render();
