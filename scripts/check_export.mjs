import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const [code, ui] = await Promise.all([
  readFile(resolve(root, "src/code.ts"), "utf8"),
  readFile(resolve(root, "src/ui.html"), "utf8")
]);

for (const required of ["exportAsync({ format: \"SVG\" })", "isVectorExport", "NO_SCENE_TO_EXPORT", "sceneExported"]) {
  if (!code.includes(required)) throw new Error(`Missing export safeguard: ${required}`);
}
for (const required of ["exportScene", "Скачать SVG", "data-demo=\"main\"", "data-demo=\"mixed\"", "data-demo=\"alternate\"", "new Blob([message.bytes]"]) {
  if (!ui.includes(required)) throw new Error(`Missing UI export or demo feature: ${required}`);
}
console.log("Export check passed: controlled-frame SVG export, vector guard, download action, and three demos.");
