export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export class LetterManager {
    used = new Set();
    get remaining() { return ALPHABET.length - this.used.size; }
    isUsed(letter) { return this.used.has(letter); }
    use(letter) {
        if (!ALPHABET.includes(letter) || this.used.has(letter))
            return false;
        this.used.add(letter);
        return true;
    }
    reset() { this.used.clear(); }
}
