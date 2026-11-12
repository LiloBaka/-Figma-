export type Role = "main" | "background";

export type SceneItem = {
  id: string;
  assetId: string;
  role: Role;
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
};

export type Scene = {
  format: "L" | "S";
  paletteId: string;
  templateId: string;
  items: SceneItem[];
};

export type SceneAction =
  | { type: "add"; item: Omit<SceneItem, "id" | "zIndex">; id: string }
  | { type: "duplicate"; id: string; newId: string }
  | { type: "delete"; id: string }
  | { type: "move"; id: string; x: number; y: number }
  | { type: "rotate"; id: string; rotation: number }
  | { type: "reorder"; id: string; direction: "forward" | "backward" }
  | { type: "select"; id: string | null };

export type SceneState = { scene: Scene; selectedItemId: string | null };

export const emptyScene = (): Scene => ({ format: "S", paletteId: "", templateId: "compact_S", items: [] });

const normalize = (scene: Scene): Scene => ({
  ...scene,
  items: scene.items
    .slice()
    .sort((a, b) => a.zIndex - b.zIndex)
    .map((item, zIndex) => ({ ...item, zIndex }))
});

export const reduceScene = (state: SceneState, action: SceneAction): SceneState => {
  const items = state.scene.items;
  if (action.type === "select") return { ...state, selectedItemId: action.id };
  if (action.type === "add") {
    if (items.some((item) => item.id === action.id)) return state;
    return { scene: normalize({ ...state.scene, items: [...items, { ...action.item, id: action.id, zIndex: items.length }] }), selectedItemId: action.id };
  }
  const index = items.findIndex((item) => item.id === action.id);
  if (index < 0) return state;
  if (action.type === "delete") {
    return { scene: normalize({ ...state.scene, items: items.filter((item) => item.id !== action.id) }), selectedItemId: state.selectedItemId === action.id ? null : state.selectedItemId };
  }
  if (action.type === "duplicate") {
    if (items.some((item) => item.id === action.newId)) return state;
    const item = items[index];
    return { scene: normalize({ ...state.scene, items: [...items, { ...item, id: action.newId, x: item.x + 24, y: item.y + 24, zIndex: items.length }] }), selectedItemId: action.newId };
  }
  if (action.type === "move") {
    return { ...state, scene: { ...state.scene, items: items.map((item) => item.id === action.id ? { ...item, x: action.x, y: action.y } : item) } };
  }
  if (action.type === "rotate") {
    return { ...state, scene: { ...state.scene, items: items.map((item) => item.id === action.id ? { ...item, rotation: action.rotation } : item) } };
  }
  const next = items.slice();
  const target = action.direction === "forward" ? index + 1 : index - 1;
  if (target < 0 || target >= next.length) return state;
  [next[index], next[target]] = [next[target], next[index]];
  return { ...state, scene: { ...state.scene, items: next.map((item, zIndex) => ({ ...item, zIndex })) } };
};

export const serializeScene = (scene: Scene) => JSON.stringify(normalize(scene));

export const syncSceneItemTransform = (
  scene: Scene,
  id: string,
  transform: Pick<SceneItem, "x" | "y" | "rotation">
): Scene | null => {
  if (![transform.x, transform.y, transform.rotation].every(Number.isFinite)) return null;
  let found = false;
  const items = scene.items.map((item) => {
    if (item.id !== id) return item;
    found = true;
    return { ...item, ...transform };
  });
  return found ? { ...scene, items } : null;
};

export const parseScene = (value: string): Scene => {
  const scene = JSON.parse(value) as Scene;
  if (!scene || (scene.format !== "L" && scene.format !== "S") || typeof scene.paletteId !== "string" || typeof scene.templateId !== "string" || !Array.isArray(scene.items)) throw new Error("Invalid saved scene.");
  for (const item of scene.items) {
    if (!item || typeof item.id !== "string" || typeof item.assetId !== "string" || (item.role !== "main" && item.role !== "background") || ![item.x, item.y, item.rotation, item.zIndex].every(Number.isFinite)) throw new Error("Invalid scene item.");
  }
  return normalize(scene);
};
