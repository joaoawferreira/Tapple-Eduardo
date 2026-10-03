import { publicAssets } from "./generatedAssets.js";
import { RoomStore, type Database } from "./database.js";
import { RoomError, type Room, type Member, newRoom, validateName, validateSettings, joinRoom, settleRoom, applyAction, snapshot } from "./room.js";
interface Environment { DB: Database; }
function json(value: unknown, status = 200): Response {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}
async function hash(value: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  return Array.from(bytes, byte => byte.toString(16).padStart(2,"0")).join("");
}
function secret(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2,"0")).join("");
}
function code(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(6)), value => alphabet[value % alphabet.length]).join("");
}
async function readBody(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new RoomError("Envie JSON.", 415);
  const body = await request.text();
  if (body.length > 2048) throw new RoomError("Requisição muito grande.", 413);
  try {
    const value: unknown = JSON.parse(body);
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch { throw new RoomError("Dados inválidos."); }
}
async function member(name: unknown, now: number): Promise<{ player: Member; token: string }> {
  const token = secret();
  return { token, player: { id: crypto.randomUUID(), name: validateName(name), tokenHash: await hash(token),
    score: 0, ready: false, lastSeen: now, left: false } };
}
async function rateLimit(store: RoomStore, request: Request, kind: string, limit: number): Promise<void> {
  const now = Date.now();
  const address = request.headers.get("CF-Connecting-IP") ?? "local";
  const key = kind + ":" + await hash(address) + ":" + Math.floor(now / 60000);
  if (!await store.allow(key, limit, now)) throw new RoomError("Muitas tentativas. Aguarde um minuto.", 429);
}
async function api(request: Request, env: Environment): Promise<Response> {
  const url = new URL(request.url);
  if (!env.DB) throw new RoomError("As salas estão temporariamente indisponíveis.", 503);
  if (request.method !== "GET" && request.method !== "POST") throw new RoomError("Método não permitido.", 405);
  if (request.method === "POST") {
    const origin = request.headers.get("Origin");
    if (origin && origin !== url.origin) throw new RoomError("Origem não autorizada.", 403);
  }
  const store = new RoomStore(env.DB);
  if (url.pathname === "/api/rooms" && request.method === "POST") {
    await rateLimit(store, request, "create", 8);
    const body = await readBody(request);
    const now = Date.now();
    const { player, token } = await member(body.name, now);
    const settings = validateSettings(body.settings);
    for (let i = 0; i < 5; i++) {
      const room = newRoom(code(), player, settings, now);
      if (await store.insert(room.code, JSON.stringify(room), room.expiresAt)) {
        await store.cleanup(now);
        return json({ room: snapshot(room, player.id, 1, now), session: { code: room.code, token, playerId: player.id, name: player.name } }, 201);
      }
    }
    throw new RoomError("Não foi possível criar a sala. Tente novamente.", 503);
  }
  const match = /^\/api\/rooms\/([A-Z2-9]{6})(?:\/(join|action))?$/.exec(url.pathname);
  if (!match) throw new RoomError("Sala não encontrada.", 404);
  const [, roomCode, operation] = match;
  if ((operation && request.method !== "POST") || (!operation && request.method !== "GET")) throw new RoomError("Método não permitido.", 405);
  const body = operation ? await readBody(request) : {};
  let joining: Awaited<ReturnType<typeof member>> | null = null;
  let tokenHash = "";
  if (operation === "join") {
    await rateLimit(store, request, "join", 20);
    joining = await member(body.name, Date.now());
  } else {
    const token = request.headers.get("Authorization")?.replace(/^Bearer /, "") ?? "";
    if (!/^[a-f0-9]{64}$/.test(token)) throw new RoomError("Entre na sala para continuar.", 401);
    tokenHash = await hash(token);
    if (operation === "action" && (typeof body.actionId !== "string" || !/^[a-zA-Z0-9-]{8,80}$/.test(body.actionId))) throw new RoomError("Identificação de ação inválida.");
  }
  // A versão condiciona a escrita: cliques e expirações concorrentes só pontuam uma vez.
  for (let attempt = 0; attempt < 8; attempt++) {
    const row = await store.read(roomCode);
    if (!row) throw new RoomError("Sala não encontrada. Confira o código.", 404);
    const room = JSON.parse(row.state) as Room;
    const now = Date.now();
    let player: Member;
    if (joining) player = joining.player;
    else {
      const found = room.players.find(candidate => candidate.tokenHash === tokenHash);
      if (!found || found.left) throw new RoomError("Sua sessão não está mais nesta sala.", 403);
      player = found;
      if (now - player.lastSeen > 5000 || operation === "action") player.lastSeen = now;
    }
    settleRoom(room, now);
    let actionError: RoomError | null = null;
    try {
      if (joining) joinRoom(room, player);
      else if (operation === "action") {
        const actionKey = player.id + ":" + String(body.actionId);
        if (!room.recentActions.includes(actionKey)) {
          applyAction(room, player, body, now);
          room.recentActions.push(actionKey);
          room.recentActions = room.recentActions.slice(-100);
        }
      }
    } catch (error) {
      if (!(error instanceof RoomError)) throw error;
      actionError = error;
    }
    const state = JSON.stringify(room);
    const changed = state !== row.state;
    if (changed && !await store.write(roomCode, state, row.version)) continue;
    const view = snapshot(room, player.id, row.version + (changed ? 1 : 0), now);
    if (actionError) return json({ error: actionError.message, room: view }, actionError.status);
    return json({ room: view, ...(joining ? { session: { code: roomCode, token: joining.token, playerId: player.id, name: player.name } } : {}) });
  }
  throw new RoomError("A sala recebeu várias ações. Tente novamente.", 409);
}
export default {
  async fetch(request: Request, env: Environment): Promise<Response> {
    const url = new URL(request.url);
    try {
      if (url.pathname.startsWith("/api/")) return await api(request, env);
      if (!["GET","HEAD"].includes(request.method)) return new Response("Método não permitido", { status: 405 });
      const asset = publicAssets[url.pathname === "/" ? "/index.html" : url.pathname];
      if (!asset) return new Response("Não encontrado", { status: 404 });
      return new Response(request.method === "HEAD" ? null : asset.body, { headers: {
        "Content-Type": asset.type, "Cache-Control": "no-cache", "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "same-origin"
      } });
    } catch (error) {
      if (error instanceof RoomError) return json({ error: error.message }, error.status);
      console.error("Falha na sala:", error instanceof Error ? error.message : "erro desconhecido");
      return json({ error: "Não foi possível falar com a sala. Tente novamente." }, 503);
    }
  }
};
