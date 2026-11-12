declare const figma: {
  showUI(html: string, options: { width: number; height: number; title: string }): void;
  currentPage: {
    appendChild(node: SceneNode): void;
  };
  viewport: {
    center: { x: number; y: number };
  };
  createNodeFromSvg(svg: string): FrameNode;
  ui: {
    onmessage: (message: unknown) => void;
    postMessage(message: unknown): void;
  };
};
import html from "./ui.html";
import assetManifest from "../spec/assets.json";

type SceneNode = {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
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

const catalog = new Map(assetManifest.assets.map((asset) => [asset.id, asset]));

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

figma.showUI(html, {
  width: 360,
  height: 600,
  title: "Illustration Builder"
});

figma.ui.onmessage = (message: unknown) => {
  const candidate = message as Partial<PingMessage & InsertAssetMessage>;
  if (candidate.type === "ping" && typeof candidate.requestId === "string") {
    figma.ui.postMessage({ type: "pong", requestId: candidate.requestId });
    return;
  }
  if (candidate.type === "insertAsset") {
    insertAsset(candidate);
  }
};
