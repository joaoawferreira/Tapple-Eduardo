export type OnlinePhase = "LOBBY" | "PLAYING" | "PAUSED" | "ROUND_END" | "GAME_END";
export interface OnlineSettings { turnTime: number; roundCount: number; }
export interface OnlinePlayer { id: string; name: string; score: number; ready: boolean; online: boolean; left: boolean; }
export interface OnlineMove { playerName: string; letter: string; round: number; }
export interface OnlineSnapshot {
  code: string; revision: number; phase: OnlinePhase; hostId: string; selfId: string;
  players: OnlinePlayer[]; settings: OnlineSettings; round: number; category: string;
  currentId: string; used: string[]; history: OnlineMove[]; endsAt: number; remainingMs: number;
  serverNow: number; expiresAt: number; message: string; turnId: string;
}
export interface OnlineSession { code: string; token: string; playerId: string; name: string; }
export interface OnlineResponse { room: OnlineSnapshot; session?: OnlineSession; }
