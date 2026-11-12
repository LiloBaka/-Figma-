export const canvas = { width: 1200, height: 630 } as const;

export type TemplateKind = "compact" | "offset" | "headline";
type Format = "L" | "S";
type Slot = { x: number; y: number; width: number; height: number };
type SafeArea = { minX: number; maxX: number; minY: number; maxY: number };

export type Layout = {
  id: `${TemplateKind}_${Format}`;
  kind: TemplateKind;
  format: Format;
  /** Bounding rectangle of the clipped reference objects, not a generic placement rule. */
  safeArea: SafeArea;
  /** Clip rectangles extracted from the matching reference SVG, in SVG group order. */
  slots: readonly Slot[];
  positions: ReadonlyArray<{ x: number; y: number }>;
};

const slots = (values: readonly Slot[]) => values;
const withBounds = (id: Layout["id"], kind: TemplateKind, format: Format, referenceSlots: readonly Slot[]): Layout => {
  const minX = Math.min(...referenceSlots.map((slot) => slot.x));
  const maxX = Math.max(...referenceSlots.map((slot) => slot.x + slot.width));
  const minY = Math.min(...referenceSlots.map((slot) => slot.y));
  const maxY = Math.max(...referenceSlots.map((slot) => slot.y + slot.height));
  return { id, kind, format, safeArea: { minX, maxX, minY, maxY }, slots: referenceSlots, positions: referenceSlots.map(({ x, y }) => ({ x, y })) };
};

// Values are the <clipPath><rect> bounds from references/templates/*.svg.
// L has six clipped groups and S has three; all six SVGs use viewBox 0 0 1200 630.
export const layouts: readonly Layout[] = [
  withBounds("compact_L", "compact", "L", slots([{ x: 886.536, y: 87.0308, width: 243.41, height: 290.497 }, { x: 40.9502, y: 158.095, width: 529.153, height: 357.526 }, { x: 154.718, y: 198.877, width: 291.034, height: 168.705 }, { x: 202.077, y: 203.047, width: 190.495, height: 109.753 }, { x: 540.894, y: 194.755, width: 365.115, height: 284.207 }, { x: 857.433, y: 373.495, width: 301.617, height: 169.474 }])),
  withBounds("compact_S", "compact", "S", slots([{ x: 662.478, y: 109.927, width: 297.514, height: 355.382 }, { x: 240.008, y: 242.062, width: 446.271, height: 346.989 }, { x: 285.282, y: 40.95, width: 355.724, height: 205.945 }])),
  withBounds("offset_L", "offset", "L", slots([{ x: 70.0532, y: 87.0308, width: 243.41, height: 290.497 }, { x: 629.897, y: 158.095, width: 529.153, height: 357.526 }, { x: 785.997, y: 206.028, width: 291.034, height: 168.705 }, { x: 856.639, y: 213.572, width: 190.495, height: 109.753 }, { x: 293.991, y: 194.755, width: 365.115, height: 284.207 }, { x: 40.9502, y: 373.495, width: 301.617, height: 169.474 }])),
  withBounds("offset_S", "offset", "S", slots([{ x: 240.008, y: 109.927, width: 297.514, height: 355.382 }, { x: 513.721, y: 242.062, width: 446.271, height: 346.989 }, { x: 558.995, y: 40.95, width: 355.724, height: 205.945 }])),
  withBounds("headline_L", "headline", "L", slots([{ x: 1002.32, y: 183.889, width: 139.992, height: 167.073 }, { x: 516, y: 224.76, width: 304.33, height: 205.623 }, { x: 581.431, y: 248.215, width: 167.382, height: 97.0268 }, { x: 608.669, y: 250.613, width: 109.559, height: 63.122 }, { x: 803.531, y: 245.844, width: 209.988, height: 163.455 }, { x: 985.582, y: 348.642, width: 173.468, height: 97.4694 }])),
  withBounds("headline_S", "headline", "S", slots([{ x: 893.327, y: 131.841, width: 265.723, height: 317.407 }, { x: 516, y: 249.855, width: 398.585, height: 309.911 }, { x: 556.436, y: 70.2339, width: 317.712, height: 183.939 }]))
];

export const layoutFor = (templateId: string, format: Format) => layouts.find((layout) => layout.id === templateId && layout.format === format);

export const positionFor = (templateId: string, format: Format, index: number) => {
  const layout = layoutFor(templateId, format);
  return layout ? layout.positions[index % layout.positions.length] : null;
};

export const isInSafeArea = (templateId: string, format: Format, x: number, y: number) => {
  const layout = layoutFor(templateId, format);
  return Boolean(layout && x >= layout.safeArea.minX && x <= layout.safeArea.maxX && y >= layout.safeArea.minY && y <= layout.safeArea.maxY);
};

export const isWithinCanvas = (x: number, y: number, width: number, height: number) =>
  [x, y, width, height].every(Number.isFinite) && width >= 0 && height >= 0 && x >= 0 && y >= 0 && x + width <= canvas.width && y + height <= canvas.height;
