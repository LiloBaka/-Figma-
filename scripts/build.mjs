import { build } from "esbuild";
import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");

await rm(dist, { force: true, recursive: true });
await mkdir(dist, { recursive: true });
await build({
  absWorkingDir: root,
  bundle: true,
  entryPoints: [resolve(root, "src/code.ts")],
  loader: { ".html": "text" },
  outfile: resolve(dist, "code.js"),
  platform: "browser",
  target: "es2017"
});
await cp(resolve(root, "src/ui.html"), resolve(dist, "ui.html"));
