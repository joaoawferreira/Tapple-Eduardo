import { readdir, readFile, writeFile } from "node:fs/promises";
import { extname } from "node:path";
const excluded = new Set(["node_modules", ".git", ".sites-runtime", ".openai", "build", "CODIGO_COMPLETO.md", "package-lock.json"]);
async function list(directory = ".") {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (excluded.has(entry.name) || entry.name.endsWith(".zip") || entry.name.endsWith(".tar.gz")) continue;
    const path = directory === "." ? entry.name : `${directory}/${entry.name}`;
    if (entry.isDirectory()) result.push(...await list(path)); else result.push(path);
  }
  return result.sort();
}
let output = "# Letra Rápida — código completo\n\nArquivos integrais de implementação, JavaScript compilado, testes e instruções.\n\n";
for (const path of await list()) {
  const language = { ".ts": "typescript", ".js": "javascript", ".mjs": "javascript", ".css": "css", ".html": "html", ".json": "json", ".svg": "xml", ".md": "markdown" }[extname(path)] ?? "text";
  output += `## ${path}\n\n` + "````" + language + "\n" + await readFile(path, "utf8") + "\n````\n\n";
}
await writeFile("CODIGO_COMPLETO.md", output);
console.log("Código completo documentado em CODIGO_COMPLETO.md.");
