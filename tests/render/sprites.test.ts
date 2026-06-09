import { describe, expect, it, beforeEach } from 'vitest';
import { composeSprite } from '../../src/render/sprites/composer.ts';
import {
  createPaletteRegistry,
  createPartRegistry,
  resetSpriteCacheForTests,
  tikiEnemySpec,
} from '../../src/render/sprites/index.ts';
import { spriteSpecSchema } from '../../src/render/sprites/schema.ts';

describe('sprite parts system', () => {
  beforeEach(() => {
    resetSpriteCacheForTests();
  });

  it('rejects a malformed SpriteSpec with zod', () => {
    const result = spriteSpecSchema.safeParse({
      id: '',
      parts: [],
      palette: 'tiki-wood',
    });
    expect(result.success).toBe(false);
  });

  it('composes deterministically (same spec, same output)', () => {
    const parts = createPartRegistry();
    const palettes = createPaletteRegistry();
    const a = composeSprite(tikiEnemySpec, parts, palettes);
    const b = composeSprite(tikiEnemySpec, parts, palettes);
    expect(a).toBe(b);
  });

  it('emits named data-slot groups for each placed part', () => {
    const svg = composeSprite(
      tikiEnemySpec,
      createPartRegistry(),
      createPaletteRegistry(),
    );
    const expectedSlots = [
      'data-slot="body"',
      'data-slot="leg-left"',
      'data-slot="leg-right"',
      'data-slot="arm-left"',
      'data-slot="arm-right"',
      'data-slot="jaw"',
      'data-slot="mouth"',
      'data-slot="nose"',
      'data-slot="eye-left"',
      'data-slot="eye-right"',
      'data-slot="brow-left"',
      'data-slot="brow-right"',
      'data-slot="crest"',
    ];
    for (const slot of expectedSlots) {
      expect(svg).toContain(slot);
    }
  });

  it('applies palette colors into the composed SVG', () => {
    const svg = composeSprite(
      tikiEnemySpec,
      createPartRegistry(),
      createPaletteRegistry(),
    );
    expect(svg).toContain('fill="#8a5526"');
    expect(svg).toContain('fill="#1f9d8d"');
    expect(svg).not.toContain('{{wood}}');
  });

  it('lists parts by slot from the registry', () => {
    const parts = createPartRegistry();
    expect(parts.listBySlot('arm')).toHaveLength(1);
    expect(parts.listBySlot('body')[0]?.id).toBe('tiki-body');
  });
});
