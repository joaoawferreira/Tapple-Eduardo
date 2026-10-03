import { mkdir, copyFile, cp, readdir, readFile, writeFile } from "node:fs/promises";
import { extname } from "node:path";
import { build } from "esbuild";
const clientModules = (await readdir("dist")).filter(name => name.endsWith(".js"));
await mkdir("build/dist", { recursive: true });
await copyFile("index.html", "build/index.html");
for (const folder of ["css", "assets"]) await cp(folder, `build/${folder}`, { recursive: true });
for (const name of clientModules) await copyFile(`dist/${name}`, `build/dist/${name}`);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml" };
const assets = {};
async function collect(directory, prefix = "") {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) await collect(`${directory}/${entry.name}`, `${prefix}/${entry.name}`);
    else if (types[extname(entry.name)]) assets[prefix + "/" + entry.name] = { body: await readFile(`${directory}/${entry.name}`, "utf8"), type: types[extname(entry.name)] };
  }
}
await collect("build");
await writeFile("server/generatedAssets.ts", "export const publicAssets: Record<string, { body: string; type: string }> = " + JSON.stringify(assets) + ";\n");
await mkdir("dist/server", { recursive: true });
await build({ entryPoints: ["server/index.ts"], outfile: "dist/server/index.js", bundle: true, format: "esm", platform: "browser", target: "es2022" });
await mkdir("dist/client", { recursive: true });
await cp("build", "dist/client", { recursive: true });
await mkdir("dist/.openai", { recursive: true });
await copyFile(".openai/hosting.json", "dist/.openai/hosting.json");
console.log("Interface e servidor compilados. Modo presencial e salas online prontos.");
