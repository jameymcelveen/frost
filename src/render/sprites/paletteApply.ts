import type { Palette, Part } from './types.ts';

const TOKEN_RE = /\{\{([a-zA-Z0-9_]+)\}\}/g;

export function applyPaletteToSvg(svg: string, palette: Palette, part: Part): string {
  return svg.replace(TOKEN_RE, (_match, slot: string) => {
    if (!part.paletteSlots.includes(slot)) {
      throw new Error(
        `Part "${part.id}" references palette slot "${slot}" that it does not declare`,
      );
    }
    const color = palette.colors[slot];
    if (color === undefined) {
      throw new Error(
        `Palette "${palette.id}" missing color for slot "${slot}"`,
      );
    }
    return color;
  });
}
