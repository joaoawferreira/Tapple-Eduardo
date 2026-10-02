import { CATEGORIES } from "./categories.js";
export class CategoryManager {
    categories;
    random;
    previous = "";
    constructor(categories = CATEGORIES, random = Math.random) {
        this.categories = categories;
        this.random = random;
        if (categories.length < 2 || new Set(categories).size < 2)
            throw new Error("Cadastre ao menos duas categorias distintas.");
    }
    draw() {
        const choices = this.categories.filter(category => category !== this.previous);
        this.previous = choices[Math.min(choices.length - 1, Math.floor(this.random() * choices.length))];
        return this.previous;
    }
}
