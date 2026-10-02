export class Player {
    id;
    name;
    score = 0;
    wins = 0;
    isActive = false;
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
    awardPoint() { this.score++; this.wins++; }
}
