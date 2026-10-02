import type { GameSettings, SavedPreferences } from "./types.js";
export const DEFAULT_SETTINGS: GameSettings = {
  playerCount: 2, turnTime: 10, roundCount: 5, soundEnabled: true, volume: 0.35
};
const KEY = "letra-rapida:preferences:v1";
export class StorageManager {
  static load(): SavedPreferences {
    const fallback = { names: ["Jogador 1", "Jogador 2"], settings: { ...DEFAULT_SETTINGS } };
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "null");
      if (!parsed || typeof parsed !== "object") return fallback;
      const data = parsed as Partial<SavedPreferences>;
      const settings = { ...DEFAULT_SETTINGS };
      const stored = data.settings;
      if (stored && typeof stored === "object") {
        if ([2,3,4,5,6].includes(stored.playerCount)) settings.playerCount = stored.playerCount;
        if ([5,10,15,20,30].includes(stored.turnTime)) settings.turnTime = stored.turnTime;
        if ([0,3,5,10].includes(stored.roundCount)) settings.roundCount = stored.roundCount;
        if (typeof stored.soundEnabled === "boolean") settings.soundEnabled = stored.soundEnabled;
        if (typeof stored.volume === "number" && Number.isFinite(stored.volume)) settings.volume = Math.min(1, Math.max(0, stored.volume));
      }
      const names = Array.from({ length: 6 }, (_, i) => {
        const name: unknown = Array.isArray(data.names) ? data.names[i] : null;
        return typeof name === "string" && name.trim() ? name.trim().slice(0,24) : `Jogador ${i+1}`;
      });
      return { names, settings };
    } catch { return fallback; }
  }
  static save(preferences: SavedPreferences): boolean {
    try { localStorage.setItem(KEY, JSON.stringify(preferences)); return true; }
    catch { return false; }
  }
}
