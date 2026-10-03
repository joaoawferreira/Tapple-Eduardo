import { createServer } from "node:http";
import worker from "../dist/server/index.js";
import { openLocalDatabase } from "./local-database.mjs";
const database = await openLocalDatabase(process.env.LETRA_TEST_DATABASE ?? ".sites-runtime/rooms.sqlite");
const port = Number(process.env.PORT ?? 4173);
const server = createServer(async (incoming, outgoing) => {
  try {
    const chunks = [];
    let size = 0;
    for await (const chunk of incoming) {
      size += chunk.length;
      if (size > 4096) { outgoing.writeHead(413).end(); return; }
      chunks.push(chunk);
    }
    const url = new URL(incoming.url ?? "/", `http://${incoming.headers.host ?? "127.0.0.1:" + port}`);
    const request = new Request(url, { method: incoming.method, headers: incoming.headers,
      ...(!["GET","HEAD"].includes(incoming.method ?? "GET") ? { body: Buffer.concat(chunks) } : {}) });
    const response = await worker.fetch(request, { DB: database.adapter });
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    outgoing.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) { console.error(error); outgoing.writeHead(500).end("Falha no servidor local."); }
});
server.listen(port, "127.0.0.1", () => console.log(`Letra Rápida: http://127.0.0.1:${port}`));
server.on("error", error => { console.error(error.message); database.close(); process.exitCode = 1; });
