export interface QueryResult { meta?: { changes?: number }; }
export interface Statement {
  bind(...values: unknown[]): Statement;
  first<T>(): Promise<T | null>;
  run(): Promise<QueryResult>;
}
export interface Database { prepare(sql: string): Statement; }
export interface RoomRow { state: string; version: number; }
export class RoomStore {
  constructor(private readonly database: Database) {}
  read(code: string): Promise<RoomRow | null> {
    return this.database.prepare("SELECT state, version FROM rooms WHERE code = ?").bind(code).first<RoomRow>();
  }
  async insert(code: string, state: string, expiresAt: number): Promise<boolean> {
    const result = await this.database.prepare("INSERT OR IGNORE INTO rooms (code, state, version, expires_at) VALUES (?, ?, 1, ?)").bind(code, state, expiresAt).run();
    return result.meta?.changes === 1;
  }
  async write(code: string, state: string, version: number): Promise<boolean> {
    const result = await this.database.prepare("UPDATE rooms SET state = ?, version = version + 1 WHERE code = ? AND version = ?").bind(state, code, version).run();
    return result.meta?.changes === 1;
  }
  async allow(key: string, limit: number, now: number): Promise<boolean> {
    const result = await this.database.prepare("INSERT INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = count + 1 RETURNING count").bind(key, now + 120000).first<{count: number}>();
    return (result?.count ?? limit + 1) <= limit;
  }
  async cleanup(now: number): Promise<void> {
    await this.database.prepare("DELETE FROM rooms WHERE expires_at < ?").bind(now).run();
    await this.database.prepare("DELETE FROM rate_limits WHERE expires_at < ?").bind(now).run();
  }
}
