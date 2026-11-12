import { build } from "esbuild";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const result = await build({ entryPoints: [resolve(root, "src/templates.ts")], bundle: true, format: "esm", platform: "node", write: false });
const module = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
if (module.canvas.width !== 1200 || module.canvas.height !== 630 || module.layouts.length !== 6) throw new Error("Template canvas or presets are incomplete.");
for (const layout of module.layouts) {
  if (!module.isInSafeArea(layout.id, layout.format, layout.positions[0].x, layout.positions[0].y)) throw new Error(`Unsafe preset: ${layout.id}`);
  if (module.isInSafeArea(layout.id, layout.format, 0, 0)) throw new Error(`Unsafe boundary accepted: ${layout.id}`);
}
if (!module.positionFor("headline_L", "L", 4) || module.layoutFor("headline_L", "S")) throw new Error("Template switching validation failed.");
console.log("Template check passed: 3 layouts, L/S presets, and safe-area bounds.");
