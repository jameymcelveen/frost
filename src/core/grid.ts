import type { Direction, Vec2 } from './types.ts';

export function vec(x: number, y: number): Vec2 {
  return { x, y };
}

export function vecEq(a: Vec2, b: Vec2): boolean {
  return a.x === b.x && a.y === b.y;
}

export function inBounds(pos: Vec2, width: number, height: number): boolean {
  return pos.x >= 0 && pos.y >= 0 && pos.x < width && pos.y < height;
}

export function offset(pos: Vec2, dir: Direction): Vec2 {
  switch (dir) {
    case 'north':
      return { x: pos.x, y: pos.y - 1 };
    case 'south':
      return { x: pos.x, y: pos.y + 1 };
    case 'east':
      return { x: pos.x + 1, y: pos.y };
    case 'west':
      return { x: pos.x - 1, y: pos.y };
  }
}

export function indexAt(x: number, y: number, width: number): number {
  return y * width + x;
}

export function posFromIndex(index: number, width: number): Vec2 {
  return { x: index % width, y: Math.floor(index / width) };
}

export function tileAt(
  tiles: readonly (readonly import('./types.ts').TileType[])[],
  pos: Vec2,
): import('./types.ts').TileType | undefined {
  const row = tiles[pos.y];
  if (row === undefined) {
    return undefined;
  }
  return row[pos.x];
}
