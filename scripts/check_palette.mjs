import { build } from "esbuild";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const result = await build({ entryPoints: [resolve(root, "src/palette.ts")], bundle: true, format: "esm", platform: "node", write: false });
const palette = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
const sample = '<svg><defs><linearGradient id="g"><stop stop-color="#181817" stop-opacity="0.4"/></linearGradient></defs><path d="M0 0h1" fill="#F9ECB0" opacity="0.6"/></svg>';
const transformed = palette.transformSvgForPalette(sample, "observed-purple");
if (!transformed.includes('d="M0 0h1"') || !transformed.includes('stop-opacity="0.4"') || !transformed.includes('opacity="0.6"')) throw new Error("Palette transform changed geometry or transparency");
if (!transformed.includes('#7864D7') || !transformed.includes('#D7CDF5')) throw new Error("Observed color replacements were not applied");
if (palette.transformSvgForPalette(sample, "source") !== sample) throw new Error("Source palette must not alter SVG");
const ui = await readFile(resolve(root, "src/ui.html"), "utf8");
if (!ui.includes('id="palette"') || !ui.includes("transformSvgForPalette")) throw new Error("Palette selector or insertion transform is missing");
console.log("Palette check passed: exact observed colors are transformed without changing geometry or opacity.");
