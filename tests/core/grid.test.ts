import { describe, expect, it } from 'vitest';
import {
  vec,
  vecEq,
  inBounds,
  offset,
  indexAt,
  posFromIndex,
  tileAt,
} from '../../src/core/grid.ts';
import { TileType } from '../../src/core/types.ts';

describe('grid', () => {
  it('creates a vector with vec()', () => {
    expect(vec(1, 2)).toEqual({ x: 1, y: 2 });
    expect(vec(-5, 10)).toEqual({ x: -5, y: 10 });
  });

  it('checks vector equality with vecEq()', () => {
    expect(vecEq(vec(1, 1), vec(1, 1))).toBe(true);
    expect(vecEq(vec(1, 2), vec(1, 1))).toBe(false);
    expect(vecEq(vec(1, 1), vec(2, 1))).toBe(false);
    expect(vecEq(vec(0, 0), vec(0, 0))).toBe(true);
  });

  it('checks if a position is in bounds with inBounds()', () => {
    const w = 5;
    const h = 5;
    expect(inBounds(vec(0, 0), w, h)).toBe(true);
    expect(inBounds(vec(4, 4), w, h)).toBe(true);
    expect(inBounds(vec(-1, 0), w, h)).toBe(false);
    expect(inBounds(vec(0, -1), w, h)).toBe(false);
    expect(inBounds(vec(5, 0), w, h)).toBe(false);
    expect(inBounds(vec(0, 5), w, h)).toBe(false);
  });

  it('offsets a position with offset()', () => {
    const pos = vec(2, 2);
    expect(offset(pos, 'north')).toEqual(vec(2, 1));
    expect(offset(pos, 'south')).toEqual(vec(2, 3));
    expect(offset(pos, 'east')).toEqual(vec(3, 2));
    expect(offset(pos, 'west')).toEqual(vec(1, 2));
  });

  it('converts coordinates to index with indexAt()', () => {
    const w = 10;
    expect(indexAt(0, 0, w)).toBe(0);
    expect(indexAt(5, 0, w)).toBe(5);
    expect(indexAt(0, 1, w)).toBe(10);
    expect(indexAt(5, 2, w)).toBe(25);
  });

  it('converts index to coordinates with posFromIndex()', () => {
    const w = 10;
    expect(posFromIndex(0, w)).toEqual(vec(0, 0));
    expect(posFromIndex(5, w)).toEqual(vec(5, 0));
    expect(posFromIndex(10, w)).toEqual(vec(0, 1));
    expect(posFromIndex(25, w)).toEqual(vec(5, 2));
  });

  it('gets tile at position with tileAt()', () => {
    const tiles = [
      [TileType.Wall, TileType.Floor],
      [TileType.Floor, TileType.Exit],
    ];
    expect(tileAt(tiles, vec(0, 0))).toBe(TileType.Wall);
    expect(tileAt(tiles, vec(1, 0))).toBe(TileType.Floor);
    expect(tileAt(tiles, vec(0, 1))).toBe(TileType.Floor);
    expect(tileAt(tiles, vec(1, 1))).toBe(TileType.Exit);

    // Out of bounds
    expect(tileAt(tiles, vec(2, 0))).toBeUndefined();
    expect(tileAt(tiles, vec(0, 2))).toBeUndefined();
    expect(tileAt(tiles, vec(-1, 0))).toBeUndefined();
  });
});
