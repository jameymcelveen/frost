import { describe, expect, it } from 'vitest';
import { parseLevel, levelSchema } from '../../src/core/level.ts';
import level01 from '../../src/levels/level-01.json';
import { TileType, EntityType } from '../../src/core/types.ts';

describe('level', () => {
  it('validates level-01.json', () => {
    const result = levelSchema.safeParse(level01);
    expect(result.success).toBe(true);
  });

  it('parses level-01 into initial game state', () => {
    const { initialState, metadata } = parseLevel(level01);
    expect(metadata.name).toBe('Temple Gate');
    expect(initialState.width).toBe(11);
    expect(initialState.height).toBe(9);
    expect(initialState.player).toEqual({ x: 1, y: 7 });
    expect(initialState.collectiblesRemaining).toBe(1);
    expect(initialState.tiles[2]?.[7]).toBe(TileType.Exit);
    expect(initialState.entities).toHaveLength(2);
    expect(initialState.entities[0]?.type).toBe(EntityType.Block);
  });

  it('rejects wrong tile count', () => {
    const bad = { ...level01, tiles: ['floor'] };
    expect(() => parseLevel(bad)).toThrow();
  });
});
