export type PaletteId = "source" | "observed-purple";

type Palette = {
  id: PaletteId;
  name: string;
  replacements: Readonly<Record<string, string>>;
};

// These pairs are observed in matching paths of large_main and large_background
// SVGs. They are not a complete semantic token system.
export const palettes: ReadonlyArray<Palette> = [
  { id: "source", name: "Исходные цвета", replacements: {} },
  {
    id: "observed-purple",
    name: "Наблюдаемая фиолетовая",
    replacements: {
      "#181817": "#7864D7",
      "#F9ECB0": "#D7CDF5",
      "#FFE3E1": "#D7CDF5",
      "#F9A3AA": "#D7CDF5"
    }
  }
];

const paletteFor = (id: string) => palettes.find((palette) => palette.id === id) ?? palettes[0];

export const transformSvgForPalette = (svg: string, paletteId: string) => {
  const replacements = paletteFor(paletteId).replacements;
  return svg.replace(/#[0-9a-f]{6}\b/gi, (value) => replacements[value.toUpperCase()] ?? value);
};
