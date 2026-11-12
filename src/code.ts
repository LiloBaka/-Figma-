declare const figma: {
  showUI(html: string, options: { width: number; height: number; title: string }): void;
  currentPage: {
    appendChild(node: SceneNode): void;
    findAll(callback: (node: SceneNode) => boolean): SceneNode[];
  };
  viewport: {
    center: { x: number; y: number };
  };
  createNodeFromSvg(svg: string): FrameNode;
  createFrame(): FrameNode;
  clientStorage: { getAsync(key: string): Promise<unknown>; setAsync(key: string, value: unknown): Promise<void> };
  ui: {
    onmessage: (message: unknown) => void;
    postMessage(message: unknown): void;
  };
};
import html from "./ui.html";
import assetManifest from "../spec/assets.json";
import { emptyScene, parseScene, serializeScene, type Scene } from "./scene";
import { canvas, isInSafeArea, layoutFor } from "./templates";

type SceneNode = {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  rotation: number;
  remove(): void;
  appendChild(node: SceneNode): void;
  getPluginData(key: string): string;
  setPluginData(key: string, value: string): void;
  resize(width: number, height: number): void;
  clipsContent: boolean;
  exportAsync(settings: { format: "SVG" }): Promise<Uint8Array>;
};

type FrameNode = SceneNode;

type PingMessage = {
  type: "ping";
  requestId: string;
};

type InsertAssetMessage = {
  type: "insertAsset";
  requestId: string;
  assetId: string;
  variant: string;
  svg: string;
};

type ApplySceneMessage = { type: "applyScene"; requestId: string; scene: Scene; svgByItemId: Record<string, string> };
type InitializeMessage = { type: "initialize"; requestId: string };
type ExportSceneMessage = { type: "exportScene"; requestId: string };

const catalog = new Map(assetManifest.assets.map((asset) => [asset.id, asset]));
const storageKey = "illustration-builder.scene.v1";
const ownerKey = "illustration-builder.owner";
const ownerValue = "scene-root-v1";

const sendError = (requestId: string, code: string, message: string) => {
  figma.ui.postMessage({ type: "error", requestId, code, message });
};

const isSafeVectorSvg = (svg: string) => {
  const source = svg.trim();
  return source.startsWith("<svg") &&
    source.length <= 2_000_000 &&
    !/<image\b/i.test(source) &&
    !/data:image\//i.test(source) &&
    !/\b(?:href|xlink:href)\s*=\s*["']\s*(?:https?:|data:|file:)/i.test(source);
};

const isVectorExport = (svg: string) => isSafeVectorSvg(svg) && /<(?:path|g|polygon|polyline|rect|circle|ellipse)\b/i.test(svg);

const insertAsset = (message: Partial<InsertAssetMessage>) => {
  const { requestId, assetId, variant, svg } = message;
  if (typeof requestId !== "string") return;
  if (typeof assetId !== "string" || typeof variant !== "string" || typeof svg !== "string") {
    sendError(requestId, "INVALID_INSERT_REQUEST", "Choose an illustration before inserting it.");
    return;
  }

  const asset = catalog.get(assetId);
  if (!asset || !Object.prototype.hasOwnProperty.call(asset.variants, variant)) {
    sendError(requestId, "UNKNOWN_ASSET", "The selected illustration is not in the catalog.");
    return;
  }
  if (!isSafeVectorSvg(svg)) {
    sendError(requestId, "UNSAFE_SVG", "Only catalog SVGs without embedded raster images can be inserted.");
    return;
  }

  try {
    const node = figma.createNodeFromSvg(svg);
    node.name = `${asset.name} — ${variant}`;
    figma.currentPage.appendChild(node);
    node.x = figma.viewport.center.x - node.width / 2;
    node.y = figma.viewport.center.y - node.height / 2;
    figma.ui.postMessage({ type: "assetInserted", requestId, assetId, variant });
  } catch (error) {
    sendError(requestId, "INSERT_FAILED", error instanceof Error ? error.message : "Figma could not insert this SVG.");
  }
};

const validScene = (scene: unknown): scene is Scene => {
  try { parseScene(JSON.stringify(scene)); return true; } catch { return false; }
};

const sceneRoot = () => figma.currentPage.findAll((node) => node.getPluginData(ownerKey) === ownerValue)[0];

const applyScene = async (message: Partial<ApplySceneMessage>) => {
  if (typeof message.requestId !== "string") return;
  if (!validScene(message.scene) || !message.svgByItemId || typeof message.svgByItemId !== "object") {
    sendError(message.requestId, "INVALID_SCENE", "The scene is not valid.");
    return;
  }
  const scene = parseScene(JSON.stringify(message.scene));
  if (!layoutFor(scene.templateId, scene.format)) {
    sendError(message.requestId, "INVALID_TEMPLATE", "Choose a template matching the selected format.");
    return;
  }
  for (const item of scene.items) {
    const asset = catalog.get(item.assetId);
    const svg = message.svgByItemId[item.id];
    if (!asset || !asset.allowedRoles.includes(item.role) || !isSafeVectorSvg(svg) || !isInSafeArea(scene.templateId, scene.format, item.x, item.y)) {
      sendError(message.requestId, "INVALID_SCENE_ITEM", "A scene item is missing a valid catalog SVG.");
      return;
    }
  }
  try {
    const previous = sceneRoot();
    if (previous) previous.remove();
    const root = figma.createFrame();
    root.name = "Illustration Builder scene";
    root.clipsContent = false;
    root.resize(canvas.width, canvas.height);
    root.x = figma.viewport.center.x - canvas.width / 2;
    root.y = figma.viewport.center.y - canvas.height / 2;
    root.setPluginData(ownerKey, ownerValue);
    figma.currentPage.appendChild(root);
    for (const item of scene.items) {
      const node = figma.createNodeFromSvg(message.svgByItemId[item.id]);
      node.name = item.id;
      root.appendChild(node);
      node.x = item.x;
      node.y = item.y;
      node.rotation = item.rotation;
    }
    await figma.clientStorage.setAsync(storageKey, serializeScene(scene));
    figma.ui.postMessage({ type: "sceneApplied", requestId: message.requestId, scene });
  } catch (error) {
    sendError(message.requestId, "SCENE_APPLY_FAILED", error instanceof Error ? error.message : "Figma could not update the scene.");
  }
};

const initialize = async (requestId: string) => {
  try {
    const saved = await figma.clientStorage.getAsync(storageKey);
    const scene = typeof saved === "string" ? parseScene(saved) : emptyScene();
    figma.ui.postMessage({ type: "sceneLoaded", requestId, scene });
  } catch {
    figma.ui.postMessage({ type: "sceneLoaded", requestId, scene: emptyScene() });
  }
};

const exportScene = async (requestId: string) => {
  const root = sceneRoot();
  if (!root) {
    sendError(requestId, "NO_SCENE_TO_EXPORT", "Create or restore a scene before exporting SVG.");
    return;
  }
  try {
    const bytes = await root.exportAsync({ format: "SVG" });
    const svg = new TextDecoder().decode(bytes);
    if (!isVectorExport(svg)) {
      sendError(requestId, "UNSAFE_SVG_EXPORT", "The exported SVG contains raster content or no vector elements.");
      return;
    }
    figma.ui.postMessage({ type: "sceneExported", requestId, bytes, filename: "illustration-builder-scene.svg" });
  } catch (error) {
    sendError(requestId, "SCENE_EXPORT_FAILED", error instanceof Error ? error.message : "Figma could not export this scene.");
  }
};

figma.showUI(html, {
  width: 360,
  height: 600,
  title: "Illustration Builder"
});

figma.ui.onmessage = (message: unknown) => {
  const candidate = message as Partial<PingMessage & InsertAssetMessage & ApplySceneMessage & InitializeMessage & ExportSceneMessage>;
  if (candidate.type === "ping" && typeof candidate.requestId === "string") {
    figma.ui.postMessage({ type: "pong", requestId: candidate.requestId });
    return;
  }
  if (candidate.type === "insertAsset") {
    insertAsset(candidate);
  }
  if (candidate.type === "initialize" && typeof candidate.requestId === "string") {
    void initialize(candidate.requestId);
  }
  if (candidate.type === "applyScene") void applyScene(candidate);
  if (candidate.type === "exportScene" && typeof candidate.requestId === "string") void exportScene(candidate.requestId);
};
