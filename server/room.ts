import { CATEGORIES } from "../src/categories.js";
import type { OnlineSettings, OnlinePhase, OnlineMove, OnlineSnapshot } from "../src/onlineTypes.js";
export class RoomError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export interface Member {
  id: string; name: string; tokenHash: string; score: number; ready: boolean; lastSeen: number; left: boolean;
}
export interface Room {
  code: string; phase: OnlinePhase; hostId: string; players: Member[]; settings: OnlineSettings;
  round: number; category: string; currentId: string; used: string[]; history: OnlineMove[];
  endsAt: number; remainingMs: number; expiresAt: number; message: string; turnId: string;
  recentActions: string[];
}
export const ROOM_TTL = 6 * 60 * 60 * 1000;
export const ONLINE_WINDOW = 20000;
export function validateName(value: unknown): string {
  if (typeof value !== "string") throw new RoomError("Informe seu apelido.");
  const name = value.trim().replace(/\s+/g, " ");
  if (name.length < 1 || name.length > 24 || /[\u0000-\u001f]/.test(name)) throw new RoomError("Use um apelido de 1 a 24 caracteres.");
  return name;
}
export function validateSettings(value: unknown): OnlineSettings {
  if (!value || typeof value !== "object") throw new RoomError("Configurações inválidas.");
  const settings = value as Record<string, unknown>;
  if (![5,10,15,20,30].includes(Number(settings.turnTime)) || ![0,3,5,10].includes(Number(settings.roundCount))) throw new RoomError("Tempo ou número de rodadas inválido.");
  return { turnTime: Number(settings.turnTime), roundCount: Number(settings.roundCount) };
}
export function newRoom(code: string, host: Member, settings: OnlineSettings, now: number): Room {
  return { code, phase: "LOBBY", hostId: host.id, players: [host], settings, round: 0,
    category: "", currentId: "", used: [], history: [], endsAt: 0, remainingMs: 0,
    expiresAt: now + ROOM_TTL, message: "", turnId: "", recentActions: [] };
}
export function members(room: Room): Member[] { return room.players.filter(player => !player.left); }
export function drawCategory(previous: string): string {
  const choices = CATEGORIES.filter(category => category !== previous);
  return choices[Math.floor(Math.random() * choices.length)];
}
function endRound(room: Room, loserId: string | null): void {
  const loser = room.players.find(player => player.id === loserId);
  for (const player of members(room)) if (player.id !== loserId) player.score++;
  room.phase = "ROUND_END";
  room.endsAt = 0;
  room.remainingMs = 0;
  room.message = loser ? `${loser.name} não respondeu a tempo. Os demais ganham 1 ponto!` : "Alfabeto completo! Todos ganham 1 ponto.";
}
function startTurn(room: Room, now: number): void {
  room.endsAt = now + room.settings.turnTime * 1000;
  room.remainingMs = room.settings.turnTime * 1000;
  room.turnId = crypto.randomUUID();
}
function beginRound(room: Room, now: number, restart = false): void {
  const active = members(room);
  if (active.length < 2) throw new RoomError("São necessários pelo menos 2 jogadores.");
  if (!restart) { room.round++; room.category = drawCategory(room.category); }
  room.used = [];
  room.currentId = active[(room.round - 1) % active.length].id;
  room.phase = "PLAYING";
  room.message = "";
  startTurn(room, now);
}
export function settleRoom(room: Room, now: number): void {
  if (room.expiresAt <= now) throw new RoomError("Esta sala expirou. Crie uma nova sala.", 410);
  const host = room.players.find(player => player.id === room.hostId);
  if (!host || host.left || now - host.lastSeen > 30000) {
    const replacement = members(room).find(player => now - player.lastSeen <= ONLINE_WINDOW);
    if (replacement) room.hostId = replacement.id;
  }
  if (room.phase === "PLAYING" && now >= room.endsAt) endRound(room, room.currentId);
}
export function joinRoom(room: Room, member: Member): void {
  if (room.phase !== "LOBBY") throw new RoomError("A partida já começou. Aguarde uma nova sala.", 409);
  if (members(room).length >= 6) throw new RoomError("Esta sala está cheia.", 409);
  if (members(room).some(player => player.name.toLocaleLowerCase("pt-BR") === member.name.toLocaleLowerCase("pt-BR"))) throw new RoomError("Este apelido já está em uso.", 409);
  // Lugares deixados no lobby não precisam permanecer na sala.
  room.players = members(room);
  room.players.push(member);
}
export function applyAction(room: Room, player: Member, body: Record<string, unknown>, now: number): void {
  const type = body.type;
  if (player.left && type !== "leave") throw new RoomError("Você já saiu desta sala.", 403);
  const hostOnly = ["start", "pause", "resume", "restart", "next", "finish", "replay"];
  if (hostOnly.includes(String(type)) && room.hostId !== player.id) throw new RoomError("Somente o anfitrião pode fazer isso.", 403);
  switch (type) {
    case "ready":
      if (room.phase !== "LOBBY") throw new RoomError("A partida já começou.", 409);
      player.ready = body.ready === true;
      break;
    case "start":
      if (room.phase !== "LOBBY") throw new RoomError("A partida já começou.", 409);
      if (members(room).length < 2 || members(room).some(member => !member.ready || now - member.lastSeen > ONLINE_WINDOW)) throw new RoomError("Aguarde pelo menos 2 jogadores conectados e todos prontos.", 409);
      beginRound(room, now);
      break;
    case "letter": {
      if (room.phase !== "PLAYING" || room.currentId !== player.id) throw new RoomError("Aguarde a sua vez.", 409);
      if (body.turnId !== room.turnId) throw new RoomError("Esta jogada pertence a um turno anterior.", 409);
      const letter = typeof body.letter === "string" ? body.letter.toUpperCase() : "";
      if (!/^[A-Z]$/.test(letter) || room.used.includes(letter)) throw new RoomError("Esta letra não está disponível.", 409);
      room.used.push(letter);
      room.history.unshift({ playerName: player.name, letter, round: room.round });
      room.history = room.history.slice(0,30);
      if (room.used.length === 26) endRound(room, null);
      else {
        const active = members(room);
        room.currentId = active[(active.findIndex(member => member.id === player.id) + 1) % active.length].id;
        startTurn(room, now);
      }
      break;
    }
    case "pause":
      if (room.phase !== "PLAYING") throw new RoomError("A partida não está em andamento.", 409);
      room.remainingMs = Math.max(0, room.endsAt - now); room.endsAt = 0; room.phase = "PAUSED"; break;
    case "resume":
      if (room.phase !== "PAUSED") throw new RoomError("A partida não está pausada.", 409);
      room.endsAt = now + room.remainingMs; room.phase = "PLAYING"; break;
    case "restart":
      if (room.phase !== "PAUSED") throw new RoomError("Pause antes de reiniciar.", 409);
      room.history = room.history.filter(move => move.round !== room.round);
      beginRound(room, now, true); break;
    case "next":
      if (room.phase !== "ROUND_END") throw new RoomError("A rodada ainda não terminou.", 409);
      if (room.settings.roundCount > 0 && room.round >= room.settings.roundCount) room.phase = "GAME_END";
      else beginRound(room, now);
      break;
    case "finish":
      if (room.phase !== "ROUND_END" || room.settings.roundCount !== 0) throw new RoomError("Encerre entre rodadas no modo ilimitado.", 409);
      room.phase = "GAME_END"; break;
    case "replay":
      if (room.phase !== "GAME_END") throw new RoomError("A partida ainda não terminou.", 409);
      room.players = members(room);
      room.players.forEach(member => { member.score = 0; member.ready = false; });
      room.phase = "LOBBY"; room.round = 0; room.history = []; room.used = []; room.message = ""; break;
    case "leave": {
      if (player.left) break;
      player.left = true; player.ready = false;
      const active = members(room);
      if (room.hostId === player.id && active.length) room.hostId = active[0].id;
      if (room.phase !== "LOBBY" && room.phase !== "GAME_END" && active.length < 2) {
        room.phase = "GAME_END"; room.endsAt = 0;
        room.message = "A partida terminou porque restou menos de 2 jogadores.";
      } else if (room.currentId === player.id && ["PLAYING", "PAUSED"].includes(room.phase)) {
        room.currentId = active[0].id;
        if (room.phase === "PLAYING") startTurn(room, now);
        else { room.remainingMs = room.settings.turnTime * 1000; room.turnId = crypto.randomUUID(); }
      }
      break;
    }
    default: throw new RoomError("Ação desconhecida.");
  }
}
export function snapshot(room: Room, selfId: string, revision: number, now: number): OnlineSnapshot {
  return { code: room.code, revision, phase: room.phase, hostId: room.hostId, selfId,
    players: room.players.map(({ id, name, score, ready, lastSeen, left }) => ({ id, name, score, ready, left, online: !left && now - lastSeen <= ONLINE_WINDOW })),
    settings: room.settings, round: room.round, category: room.category, currentId: room.currentId,
    used: room.used, history: room.history, endsAt: room.endsAt, remainingMs: room.remainingMs,
    serverNow: now, expiresAt: room.expiresAt, message: room.message, turnId: room.turnId };
}
