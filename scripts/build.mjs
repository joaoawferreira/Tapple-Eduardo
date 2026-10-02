import { mkdir, copyFile, cp } from "node:fs/promises";
await mkdir("build", { recursive: true });
await copyFile("index.html", "build/index.html");
for (const folder of ["css", "assets", "dist"]) await cp(folder, `build/${folder}`, { recursive: true });
console.log("Compilado: dist/main.js. Site pronto em build/.");
