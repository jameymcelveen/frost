import { composeSprite, composeSpriteContent, spriteViewBox } from './composer.ts';
import { PartRegistry, PaletteRegistry } from './registry.ts';
import { tikiEnemySpec } from './seed/tiki-enemy-spec.ts';
import { tikiParts } from './seed/tiki-parts.ts';
import { tikiWoodPalette } from './seed/tiki-palette.ts';

export * from './types.ts';
export * from './schema.ts';
export * from './registry.ts';
export * from './composer.ts';
export { tikiEnemySpec } from './seed/tiki-enemy-spec.ts';

let partRegistry: PartRegistry | null = null;
let paletteRegistry: PaletteRegistry | null = null;
let cachedTikiSvg: string | null = null;
let cachedTikiContent: string | null = null;

export function createPartRegistry(): PartRegistry {
  const registry = new PartRegistry();
  for (const part of tikiParts) {
    registry.registerPart(part);
  }
  return registry;
}

export function createPaletteRegistry(): PaletteRegistry {
  const registry = new PaletteRegistry();
  registry.registerPalette(tikiWoodPalette);
  return registry;
}

function ensureRegistries(): {
  parts: PartRegistry;
  palettes: PaletteRegistry;
} {
  if (partRegistry === null) {
    partRegistry = createPartRegistry();
  }
  if (paletteRegistry === null) {
    paletteRegistry = createPaletteRegistry();
  }
  return { parts: partRegistry, palettes: paletteRegistry };
}

export function getTikiEnemySpriteSvg(): string {
  if (cachedTikiSvg === null) {
    const { parts, palettes } = ensureRegistries();
    cachedTikiSvg = composeSprite(tikiEnemySpec, parts, palettes);
  }
  return cachedTikiSvg;
}

export function getTikiEnemySpriteContent(): string {
  if (cachedTikiContent === null) {
    const { parts, palettes } = ensureRegistries();
    cachedTikiContent = composeSpriteContent(tikiEnemySpec, parts, palettes);
  }
  return cachedTikiContent;
}

export function resetSpriteCacheForTests(): void {
  partRegistry = null;
  paletteRegistry = null;
  cachedTikiSvg = null;
  cachedTikiContent = null;
}

export { spriteViewBox };
