import type { Palette, Part, Slot } from './types.ts';

export class PartRegistry {
  private readonly parts = new Map<string, Part>();

  registerPart(part: Part): void {
    if (this.parts.has(part.id)) {
      throw new Error(`Part already registered: ${part.id}`);
    }
    this.parts.set(part.id, part);
  }

  getPart(id: string): Part {
    const part = this.parts.get(id);
    if (part === undefined) {
      throw new Error(`Unknown part: ${id}`);
    }
    return part;
  }

  listBySlot(slot: Slot): readonly Part[] {
    return [...this.parts.values()].filter((p) => p.slot === slot);
  }

  listAll(): readonly Part[] {
    return [...this.parts.values()];
  }
}

export class PaletteRegistry {
  private readonly palettes = new Map<string, Palette>();

  registerPalette(palette: Palette): void {
    if (this.palettes.has(palette.id)) {
      throw new Error(`Palette already registered: ${palette.id}`);
    }
    this.palettes.set(palette.id, palette);
  }

  getPalette(id: string): Palette {
    const palette = this.palettes.get(id);
    if (palette === undefined) {
      throw new Error(`Unknown palette: ${id}`);
    }
    return palette;
  }

  listAll(): readonly Palette[] {
    return [...this.palettes.values()];
  }
}
