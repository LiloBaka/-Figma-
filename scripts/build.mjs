import { build } from "esbuild";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");

await rm(dist, { force: true, recursive: true });
await mkdir(dist, { recursive: true });
await build({
  absWorkingDir: root,
  bundle: true,
  entryPoints: ["./src/code.ts"],
  loader: { ".html": "text" },
  outfile: "dist/code.js",
  platform: "browser",
  target: "es2017"
});
const [uiTemplate, assetsManifest] = await Promise.all([
  readFile(resolve(root, "src/ui.html"), "utf8"),
  readFile(resolve(root, "spec/assets.json"), "utf8")
]);

await Promise.all([
  cp(resolve(root, "assets"), resolve(dist, "assets"), { recursive: true }),
  writeFile(
    resolve(dist, "ui.html"),
    uiTemplate.replace("/* ASSET_MANIFEST */", assetsManifest)
  )
]);
