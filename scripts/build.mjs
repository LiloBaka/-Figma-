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
const [uiTemplate, assetsManifest, templatesManifest] = await Promise.all([
  readFile(resolve(root, "src/ui.html"), "utf8"),
  readFile(resolve(root, "spec/assets.json"), "utf8"),
  readFile(resolve(root, "spec/templates.json"), "utf8")
]);
const metaphorBundle = await build({
  absWorkingDir: root,
  bundle: true,
  entryPoints: ["./src/metaphor.ts"],
  format: "iife",
  globalName: "metaphorPicker",
  platform: "browser",
  target: "es2017",
  write: false
});

await Promise.all([
  cp(resolve(root, "assets"), resolve(dist, "assets"), { recursive: true }),
  writeFile(
    resolve(dist, "ui.html"),
    uiTemplate.replace("/* ASSET_MANIFEST */", assetsManifest).replace("/* TEMPLATE_MANIFEST */", templatesManifest).replace("/* METAPHOR_PICKER */", metaphorBundle.outputFiles[0].text)
  )
]);
