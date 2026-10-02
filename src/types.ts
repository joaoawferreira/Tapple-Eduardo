export type GameState = "MENU" | "SETUP" | "PLAYING" | "ROUND_END" | "GAME_END" | "PAUSED";
export interface GameSettings {
  playerCount: number;
  turnTime: number;
  roundCount: number; // 0 representa uma partida ilimitada.
  soundEnabled: boolean;
  volume: number;
}
export interface SavedPreferences { names: string[]; settings: GameSettings; }
export interface Move { playerId: number; playerName: string; letter: string; round: number; }
export type RoundReason = "timeout" | "all-letters";
export interface RoundResult { reason: RoundReason; loserName: string | null; }
export type SoundName = "letter" | "turn" | "warning" | "timeout" | "victory";
