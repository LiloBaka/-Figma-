import { build } from "esbuild";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const result = await build({ entryPoints: [resolve(root, "src/scene.ts")], bundle: true, format: "esm", platform: "node", write: false });
const scene = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
const initial = { format: "S", paletteId: "source", templateId: "compact_S", items: [{ id: "item-1", assetId: "book", role: "main", x: 10, y: 20, rotation: 0, zIndex: 0 }] };
const updated = scene.syncSceneItemTransform(initial, "item-1", { x: 40, y: 50, rotation: 30 });
if (!updated || updated.items[0].x !== 40 || updated.items[0].y !== 50 || updated.items[0].rotation !== 30 || initial.items[0].x !== 10) throw new Error("Canvas transform synchronization failed");
if (scene.syncSceneItemTransform(initial, "missing", { x: 1, y: 2, rotation: 3 }) !== null) throw new Error("Unknown canvas item must not change the scene");
console.log("Canvas sync check passed: item transform updates preserve scene data.");
