export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export class LetterManager {
  private used = new Set<string>();
  get remaining(): number { return ALPHABET.length - this.used.size; }
  isUsed(letter: string): boolean { return this.used.has(letter); }
  use(letter: string): boolean {
    if (!ALPHABET.includes(letter) || this.used.has(letter)) return false;
    this.used.add(letter);
    return true;
  }
  reset(): void { this.used.clear(); }
}
