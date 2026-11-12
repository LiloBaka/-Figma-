import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(await readFile(resolve(root, "spec/assets.json"), "utf8"));
const expectedVariants = ["large_main", "large_background", "small_main", "small_background"];

if (manifest.assetCount !== 10 || manifest.assets.length !== 10) {
  throw new Error("Catalog must contain exactly 10 named assets");
}

for (const asset of manifest.assets) {
  for (const variant of expectedVariants) {
    const record = asset.variants[variant];
    if (!record) throw new Error(`${asset.id} is missing ${variant}`);
    await access(resolve(root, record.file));
  }
}

const matchesSearch = (asset, query) =>
  [asset.name, asset.id, ...asset.tags].join(" ").toLocaleLowerCase().includes(query.toLocaleLowerCase());

if (manifest.assets.filter((asset) => matchesSearch(asset, "finance")).length !== 2) {
  throw new Error("Tag search must find the two finance illustrations");
}
if (manifest.assets.filter((asset) => matchesSearch(asset, "телефон")).length !== 1) {
  throw new Error("Name search must find Телефон");
}

console.log("Catalog check passed: 10 assets, 40 variant files, name/tag search.");
