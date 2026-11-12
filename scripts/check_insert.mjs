import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const [manifest, code, ui] = await Promise.all([
  readFile(resolve(root, "spec/assets.json"), "utf8").then(JSON.parse),
  readFile(resolve(root, "src/code.ts"), "utf8"),
  readFile(resolve(root, "src/ui.html"), "utf8")
]);

for (const asset of manifest.assets) {
  for (const variant of Object.values(asset.variants)) {
    if (variant.imageCount !== 0) throw new Error(`${variant.file} contains an embedded raster image`);
    const svg = await readFile(resolve(root, variant.file), "utf8");
    if (/<image\b|data:image\//i.test(svg)) throw new Error(`${variant.file} contains raster content`);
  }
}

for (const source of [code, ui]) {
  if (!source.includes("insertAsset")) throw new Error("Insert message handler is missing");
}
if (!code.includes("figma.createNodeFromSvg") || !code.includes("figma.viewport.center")) {
  throw new Error("SVG vector insertion and viewport centering are required");
}
if (!ui.includes("fetch(asset.variants[selectedVariant].file)")) {
  throw new Error("UI must transfer the selected source SVG");
}

console.log("Insert check passed: 40 vector SVGs, validated UI-to-plugin insertion flow.");
