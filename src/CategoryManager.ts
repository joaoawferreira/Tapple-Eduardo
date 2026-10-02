import { CATEGORIES } from "./categories.js";
export class CategoryManager {
  private previous = "";
  constructor(private readonly categories: readonly string[] = CATEGORIES,
    private readonly random: () => number = Math.random) {
    if (categories.length < 2 || new Set(categories).size < 2) throw new Error("Cadastre ao menos duas categorias distintas.");
  }
  draw(): string {
    const choices = this.categories.filter(category => category !== this.previous);
    this.previous = choices[Math.min(choices.length - 1, Math.floor(this.random() * choices.length))];
    return this.previous;
  }
}
