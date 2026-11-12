import { build } from "esbuild";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const result = await build({ entryPoints: [resolve(root, "src/templates.ts")], bundle: true, format: "esm", platform: "node", write: false });
const module = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
if (module.canvas.width !== 1200 || module.canvas.height !== 630 || module.layouts.length !== 6) throw new Error("Template canvas or presets are incomplete.");
for (const layout of module.layouts) {
  const svg = await readFile(resolve(root, "references/templates", `${layout.id}.svg`), "utf8");
  if (!/<svg\b[^>]*\bviewBox="0 0 1200 630"/.test(svg)) throw new Error(`Unexpected canvas: ${layout.id}`);
  const referenceSlots = [...svg.matchAll(/<clipPath\b[^>]*>\s*<rect\b([^>]*)\/>/g)].map((match) => {
    const attributes = match[1];
    const width = Number(attributes.match(/\bwidth="([^"]+)"/)?.[1]);
    const height = Number(attributes.match(/\bheight="([^"]+)"/)?.[1]);
    const [, x, y] = attributes.match(/translate\(([^\s)]+)\s+([^\s)]+)\)/) ?? [];
    return { x: Number(x), y: Number(y), width, height };
  });
  if (referenceSlots.length !== layout.slots.length || referenceSlots.some((slot, index) => Object.entries(slot).some(([key, value]) => value !== layout.slots[index][key]))) throw new Error(`Reference slot mismatch: ${layout.id}`);
  if (!layout.slots.every((slot) => module.isWithinCanvas(slot.x, slot.y, slot.width, slot.height))) throw new Error(`Reference slot exits canvas: ${layout.id}`);
  if (!module.isInSafeArea(layout.id, layout.format, layout.positions[0].x, layout.positions[0].y)) throw new Error(`Unsafe preset: ${layout.id}`);
  if (module.isInSafeArea(layout.id, layout.format, 0, 0)) throw new Error(`Unsafe boundary accepted: ${layout.id}`);
}
if (!module.positionFor("headline_L", "L", 4) || module.layoutFor("headline_L", "S")) throw new Error("Template switching validation failed.");
if (module.layoutFor("compact_L", "L").slots.length !== 6 || module.layoutFor("compact_S", "S").slots.length !== 3) throw new Error("L/S slot counts were not preserved.");
console.log("Template check passed: six SVG viewBoxes, extracted L/S slots, safe-area bounds, and canvas containment.");
