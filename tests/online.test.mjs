import test from "node:test";
import assert from "node:assert/strict";
import worker from "../dist/server/index.js";
import { openLocalDatabase } from "../scripts/local-database.mjs";

test("salas online: autoridade, concorrência, reconexão, pausa e transferência", async t => {
  const db = await openLocalDatabase(":memory:");
  const originalNow = Date.now;
  let now = 1800000000000;
  Date.now = () => now;
  const call = async (path, body, session, extraHeaders = {}) => {
    const response = await worker.fetch(new Request("https://game.test" + path, {
      method: body ? "POST" : "GET",
      headers: { "Content-Type": "application/json", "CF-Connecting-IP": "test", ...(session ? { Authorization: "Bearer " + session.token } : {}), ...extraHeaders },
      ...(body ? { body: JSON.stringify(body) } : {})
    }), { DB: db.adapter });
    return { status: response.status, data: await response.json() };
  };
  const action = (session, type, extra = {}) => call("/api/rooms/" + session.code + "/action", { type, actionId: crypto.randomUUID(), ...extra }, session);
  try {
    const created = await call("/api/rooms", { name: "Ana", settings: { turnTime: 5, roundCount: 3 } });
    assert.equal(created.status, 201);
    const host = created.data.session;
    const joined = await call("/api/rooms/" + host.code + "/join", { name: "Bia" });
    const guest = joined.data.session;
    const third = await call("/api/rooms/" + host.code + "/join", { name: "Caio" });
    const caio = third.data.session;
    await t.test("apelido único, sessão individual e dados públicos sem credenciais", async () => {
      assert.equal((await call("/api/rooms/" + host.code + "/join", { name: "ANA" })).status, 409);
      assert.equal((await call("/api/rooms/" + host.code)).status, 401);
      assert.equal((await call("/api/rooms/" + host.code, undefined, { ...guest, token: "0".repeat(64) })).status, 403);
      const data = (await call("/api/rooms/" + host.code, undefined, guest)).data;
      assert.equal(data.room.selfId, guest.playerId);
      assert.equal(JSON.stringify(data.room).includes("token"), false);
      assert.equal((await action(guest, "start")).status, 403);
      assert.equal((await action(host, "start")).status, 409);
    });
    await t.test("todos prontos e início sincronizado", async () => {
      for (const player of [host, guest, caio]) assert.equal((await action(player, "ready", { ready: true })).status, 200);
      const started = await action(host, "start");
      assert.equal(started.data.room.phase, "PLAYING");
      assert.equal(started.data.room.currentId, host.playerId);
      assert.equal(started.data.room.endsAt, now + 5000);
      assert.equal((await call("/api/rooms/" + host.code + "/join", { name: "Dani" })).status, 409);
    });
    let previousTurn;
    await t.test("letras concorrentes, identidade ignorada no corpo e ação idempotente", async () => {
      const current = (await call("/api/rooms/" + host.code, undefined, host)).data.room;
      previousTurn = current.turnId;
      assert.equal((await action(guest, "letter", { letter: "A", turnId: current.turnId, playerId: host.playerId })).status, 409);
      const id = crypto.randomUUID();
      const attempts = await Promise.all([
        action(host, "letter", { letter: "A", turnId: current.turnId, actionId: id }),
        action(host, "letter", { letter: "B", turnId: current.turnId })
      ]);
      assert.equal(attempts.filter(result => result.status === 200).length, 1);
      const room = (await call("/api/rooms/" + host.code, undefined, host)).data.room;
      assert.equal(room.used.length, 1);
      assert.equal(room.currentId, guest.playerId);
      if (room.used[0] === "A") assert.equal((await action(host, "letter", { letter: "A", turnId: current.turnId, actionId: id })).status, 200);
      assert.equal((await action(guest, "letter", { letter: "C", turnId: previousTurn })).status, 409);
    });
    await t.test("retomar com a mesma sessão não cria jogador duplicado", async () => {
      const room = (await call("/api/rooms/" + host.code, undefined, guest)).data.room;
      assert.equal(room.players.length, 3);
      assert.equal(room.selfId, guest.playerId);
      assert.equal(room.used.length, 1);
    });
    await t.test("pausa coletiva mantém milissegundos e respeita anfitrião", async () => {
      now += 1200;
      assert.equal((await action(guest, "pause")).status, 403);
      const paused = await action(host, "pause");
      assert.equal(paused.data.room.remainingMs, 3800);
      now += 10000;
      assert.equal((await call("/api/rooms/" + host.code, undefined, guest)).data.room.phase, "PAUSED");
      assert.equal((await action(guest, "letter", { letter: "D", turnId: previousTurn })).status, 409);
      assert.equal((await action(host, "resume")).data.room.endsAt, now + 3800);
    });
    await t.test("prazo do servidor rejeita resposta atrasada e não duplica pontos", async () => {
      const current = (await call("/api/rooms/" + host.code, undefined, guest)).data.room;
      now += 4000;
      assert.equal((await action(guest, "letter", { letter: "Z", turnId: current.turnId })).status, 409);
      const polls = await Promise.all([host,guest,caio].map(player => call("/api/rooms/" + host.code, undefined, player)));
      for (const poll of polls) {
        assert.equal(poll.data.room.phase, "ROUND_END");
        assert.deepEqual(poll.data.room.players.map(player => player.score), [1,0,1]);
      }
    });
    await t.test("rodada nova e reinício preservam pontuação", async () => {
      const next = await action(host, "next");
      assert.equal(next.data.room.round, 2);
      assert.equal(next.data.room.currentId, guest.playerId);
      assert.equal(next.data.room.used.length, 0);
      await action(host, "pause");
      const restart = await action(host, "restart");
      assert.deepEqual(restart.data.room.players.map(player => player.score), [1,0,1]);
      assert.equal(restart.data.room.round, 2);
    });
    await t.test("anfitrião desconectado é substituído e pode reconectar", async () => {
      now += 31000;
      const room = (await call("/api/rooms/" + host.code, undefined, guest)).data.room;
      assert.equal(room.hostId, guest.playerId);
      assert.equal((await call("/api/rooms/" + host.code, undefined, host)).data.room.hostId, guest.playerId);
    });
    await t.test("sair transfere anfitrião e bloqueia a sessão anterior", async () => {
      const left = await action(guest, "leave");
      assert.equal(left.status, 200);
      assert.equal(left.data.room.hostId, host.playerId);
      assert.equal((await call("/api/rooms/" + host.code, undefined, guest)).status, 403);
      await action(caio, "leave");
      assert.equal((await call("/api/rooms/" + host.code, undefined, host)).data.room.phase, "GAME_END");
    });
    await t.test("requisições de outra origem e salas expiradas", async () => {
      assert.equal((await call("/api/rooms", { name: "Dani", settings: { turnTime: 5, roundCount: 3 } }, null, { Origin: "https://evil.test" })).status, 403);
      now += 6 * 60 * 60 * 1000;
      assert.equal((await call("/api/rooms/" + host.code, undefined, host)).status, 410);
    });
  } finally { Date.now = originalNow; db.close(); }
});
