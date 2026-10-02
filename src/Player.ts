export class Player {
  score = 0;
  wins = 0;
  isActive = false;
  constructor(public readonly id: number, public readonly name: string) {}
  awardPoint(): void { this.score++; this.wins++; }
}
