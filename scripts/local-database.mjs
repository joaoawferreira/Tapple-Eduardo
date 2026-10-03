import { DatabaseSync } from "node:sqlite";
import { mkdir, readdir, readFile } from "node:fs/promises";
export async function openLocalDatabase(filename = ".sites-runtime/rooms.sqlite") {
  await mkdir(".sites-runtime", { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY)");
  for (const name of (await readdir("drizzle")).filter(name => name.endsWith(".sql")).sort()) {
    if (!db.prepare("SELECT name FROM _migrations WHERE name = ?").get(name)) {
      db.exec("BEGIN");
      try {
        db.exec(await readFile("drizzle/" + name, "utf8"));
        db.prepare("INSERT INTO _migrations(name) VALUES (?)").run(name);
        db.exec("COMMIT");
      } catch (error) { db.exec("ROLLBACK"); throw error; }
    }
  }
  const adapter = {
    prepare(sql) {
      let values = [];
      return {
        bind(...args) { values = args; return this; },
        async first() { return db.prepare(sql).get(...values) ?? null; },
        async run() { const result = db.prepare(sql).run(...values); return { meta: { changes: Number(result.changes) } }; }
      };
    }
  };
  return { adapter, close: () => db.close() };
}
