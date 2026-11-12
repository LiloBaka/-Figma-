import { build } from "esbuild";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const result = await build({ entryPoints: [resolve(root, "src/scene.ts")], bundle: true, format: "esm", platform: "node", write: false });
const module = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
let state = { scene: module.emptyScene(), selectedItemId: null };
state = module.reduceScene(state, { type: "add", id: "item-1", item: { assetId: "book", role: "main", x: 10, y: 20, rotation: 0 } });
state = module.reduceScene(state, { type: "duplicate", id: "item-1", newId: "item-2" });
state = module.reduceScene(state, { type: "move", id: "item-2", x: 50, y: 60 });
state = module.reduceScene(state, { type: "rotate", id: "item-2", rotation: 45 });
state = module.reduceScene(state, { type: "reorder", id: "item-2", direction: "backward" });
if (state.scene.items.length !== 2 || state.scene.items[0].id !== "item-2" || state.scene.items[0].rotation !== 45) throw new Error("Reducer actions failed");
state = module.reduceScene(state, { type: "select", id: "item-2" });
state = module.reduceScene(state, { type: "delete", id: "item-1" });
if (state.selectedItemId !== "item-2" || state.scene.items.length !== 1) throw new Error("Selection or deletion failed");
const roundtrip = module.parseScene(module.serializeScene(state.scene));
if (JSON.stringify(roundtrip) !== module.serializeScene(roundtrip)) throw new Error("Scene serialization roundtrip failed");
console.log("Scene check passed: reducer actions and serialization roundtrip.");
