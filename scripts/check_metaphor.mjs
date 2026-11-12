import { build } from "esbuild";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const result = await build({ entryPoints: [resolve(root, "src/metaphor.ts")], bundle: true, format: "esm", platform: "node", write: false });
const module = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
const catalog = new Map(JSON.parse(await readFile(resolve(root, "spec/assets.json"), "utf8")).assets.map((asset) => [asset.id, asset]));

const cases = [
  ["обучение", "book"],
  ["focus", "headphones"],
  ["решение задач", "puzzles"],
  ["совместная работа", "phone"],
  ["неизвестный текст", "book"]
];
for (const [text, expectedId] of cases) {
  const pick = module.pickMetaphor(text, "S");
  if (!pick.templateId.endsWith("_S") || pick.items.length < 1 || pick.items.length > 4 || !pick.items.some((item) => item.assetId === expectedId)) throw new Error(`Unexpected pick for ${text}`);
  for (const item of pick.items) {
    const asset = catalog.get(item.assetId);
    if (!asset || !asset.allowedRoles.includes(item.role)) throw new Error(`Invalid catalog item for ${text}: ${item.assetId}`);
  }
}
const unknown = module.pickMetaphor("неизвестный текст", "L");
if (!unknown.fallback || !unknown.explanation || unknown.templateId !== "compact_L") throw new Error("Unknown-query fallback is incomplete.");
console.log("Metaphor check passed: RU/EN recipes and unknown-query fallback.");
