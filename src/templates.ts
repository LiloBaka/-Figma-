export const canvas = { width: 1200, height: 630 } as const;

export type TemplateKind = "compact" | "offset" | "headline";

type Layout = {
  id: `${TemplateKind}_${"L" | "S"}`;
  kind: TemplateKind;
  format: "L" | "S";
  safeArea: { minX: number; maxX: number; minY: number; maxY: number };
  positions: ReadonlyArray<{ x: number; y: number }>;
};

// These are conservative working presets, not extracted slots from reference SVGs.
const safeArea = { minX: 60, maxX: 1140, minY: 50, maxY: 580 };
const positions: Record<TemplateKind, ReadonlyArray<{ x: number; y: number }>> = {
  compact: [{ x: 410, y: 190 }, { x: 610, y: 270 }, { x: 300, y: 330 }],
  offset: [{ x: 690, y: 125 }, { x: 245, y: 300 }, { x: 755, y: 390 }],
  headline: [{ x: 745, y: 320 }, { x: 365, y: 390 }, { x: 880, y: 440 }]
};

export const layouts: ReadonlyArray<Layout> = (["L", "S"] as const).flatMap((format) =>
  (["compact", "offset", "headline"] as const).map((kind) => ({
    id: `${kind}_${format}`,
    kind,
    format,
    safeArea,
    positions: positions[kind]
  }))
);

export const layoutFor = (templateId: string, format: "L" | "S") =>
  layouts.find((layout) => layout.id === templateId && layout.format === format);

export const positionFor = (templateId: string, format: "L" | "S", index: number) => {
  const layout = layoutFor(templateId, format);
  if (!layout) return null;
  return layout.positions[index % layout.positions.length];
};

export const isInSafeArea = (templateId: string, format: "L" | "S", x: number, y: number) => {
  const layout = layoutFor(templateId, format);
  return Boolean(layout && x >= layout.safeArea.minX && x <= layout.safeArea.maxX && y >= layout.safeArea.minY && y <= layout.safeArea.maxY);
};
