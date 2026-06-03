import { EntityType, TileType, type Direction } from '../core/types.ts';
import { tileSize } from './sprites.ts';

export type SpriteDrawFn = (x: number, y: number, opts?: SpriteOpts) => string;

export interface SpriteOpts {
  readonly facing?: Direction;
  readonly eyeOpen?: boolean;
  readonly tremble?: boolean;
  readonly pulse?: boolean;
}

const TILE_SIZE = tileSize();

const tileSprites: Record<string, SpriteDrawFn> = {
  [TileType.Floor]: (x, y) => baseTile(x, y, '#3d3428'),
  [TileType.Wall]: (x, y) =>
    `${baseTile(x, y, '#6b5a45')}<rect x="${x * TILE_SIZE}" y="${y * TILE_SIZE}" width="${TILE_SIZE}" height="${TILE_SIZE}" fill="none" stroke="#8a7358" stroke-width="2"/>`,
  [TileType.Exit]: (x, y) =>
    `${baseTile(x, y, '#2a4a3a')}${label(x, y, 'EXIT')}`,
  [TileType.Pit]: (x, y) =>
    `${baseTile(x, y, '#0e0c0a')}${label(x, y, 'PIT')}`,
  [TileType.Spikes]: (x, y) =>
    `${baseTile(x, y, '#5c3030')}${label(x, y, 'SPK')}`,
  [TileType.Collectible]: (x, y) =>
    `${baseTile(x, y, '#4a3d20')}${label(x, y, 'GEM')}`,
};

const entitySprites: Record<string, SpriteDrawFn> = {
  [EntityType.Block]: (x, y) => {
    const px = x * TILE_SIZE + 6;
    const py = y * TILE_SIZE + 6;
    const w = TILE_SIZE - 12;
    const h = TILE_SIZE - 12;
    return `<rect x="${px}" y="${py}" width="${w}" height="${h}" fill="#7a6a50" stroke="#c9b896" stroke-width="2"/>
      ${labelAt(px + w / 2, py + h / 2 + 4, 'BLK', 8)}`;
  },
  dartEmitter: (x, y, opts) => {
    const px = x * TILE_SIZE + 6;
    const py = y * TILE_SIZE + 6;
    const w = TILE_SIZE - 12;
    const arrow =
      opts?.facing === 'north'
        ? '▲'
        : opts?.facing === 'south'
          ? '▼'
          : opts?.facing === 'east'
            ? '▶'
            : '◀';
    return `<rect x="${px}" y="${py}" width="${w}" height="${h}" fill="#2d4a32" stroke="#e85c4a" stroke-width="2"/>
      ${labelAt(px + w / 2, py + h / 2 + 4, `DR${arrow}`, 9)}`;
  },
  [EntityType.TikiShooter]: (x, y, opts) =>
    entitySprites.dartEmitter(x, y, opts),
  [EntityType.TikiWalker]: (x, y) => {
    const px = x * TILE_SIZE + 6;
    const py = y * TILE_SIZE + 6;
    const w = TILE_SIZE - 12;
    const h = TILE_SIZE - 12;
    return `<ellipse cx="${px + w / 2}" cy="${py + h / 2}" rx="${w / 2 - 2}" ry="${h / 2 - 2}" fill="#5a3048" stroke="#d8a0c0" stroke-width="2"/>
      ${labelAt(px + w / 2, py + h / 2 + 4, 'WLK', 8)}`;
  },
  statue: (x, y, opts) => {
    const cx = x * TILE_SIZE + TILE_SIZE / 2;
    const cy = y * TILE_SIZE + TILE_SIZE / 2;
    const eye = opts?.eyeOpen === true ? '#ff6b4a' : '#3a3028';
    return `<rect x="${x * TILE_SIZE + 10}" y="${y * TILE_SIZE + 8}" width="28" height="32" rx="4" fill="#5a5040" stroke="#c9b896" stroke-width="1.5"/>
      <circle cx="${cx - 6}" cy="${cy - 4}" r="4" fill="${eye}"/>
      <circle cx="${cx + 6}" cy="${cy - 4}" r="4" fill="${eye}"/>
      ${labelAt(cx, cy + 14, 'ST', 7)}`;
  },
  switchPlate: (x, y) => {
    const px = x * TILE_SIZE + 12;
    const py = y * TILE_SIZE + 28;
    return `<rect x="${px}" y="${py}" width="24" height="8" rx="2" fill="#6a5a38" stroke="#d4b87a" stroke-width="1"/>
      ${labelAt(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2 + 4, 'SW', 7)}`;
  },
  player: (x, y) => {
    const cx = x * TILE_SIZE + TILE_SIZE / 2;
    const cy = y * TILE_SIZE + TILE_SIZE / 2;
    return `<circle cx="${cx}" cy="${cy}" r="14" fill="#c45c26" stroke="#f0d8a8" stroke-width="2"/>
      ${labelAt(cx, cy + 4, 'FROST', 7)}`;
  },
};

function baseTile(x: number, y: number, fill: string): string {
  return `<rect x="${x * TILE_SIZE}" y="${y * TILE_SIZE}" width="${TILE_SIZE}" height="${TILE_SIZE}" fill="${fill}"/>`;
}

function label(x: number, y: number, text: string): string {
  return labelAt(
    x * TILE_SIZE + TILE_SIZE / 2,
    y * TILE_SIZE + TILE_SIZE / 2 + 4,
    text,
    9,
  );
}

function labelAt(cx: number, cy: number, text: string, size: number): string {
  return `<text x="${cx}" y="${cy}" text-anchor="middle" font-size="${size}" fill="#c9b896" font-family="system-ui,sans-serif">${text}</text>`;
}

export function drawSprite(
  spriteId: string,
  x: number,
  y: number,
  opts?: SpriteOpts,
): string {
  const fn = tileSprites[spriteId] ?? entitySprites[spriteId];
  if (fn === undefined) {
    return baseTile(x, y, '#444');
  }
  return fn(x, y, opts);
}

export function drawTile(
  type: string,
  x: number,
  y: number,
  opts?: SpriteOpts,
): string {
  const fn = tileSprites[type];
  if (fn === undefined) {
    return baseTile(x, y, '#333');
  }
  let svg = fn(x, y, opts);
  if (opts?.tremble === true) {
    const ox = (x + y) % 2 === 0 ? 1 : -1;
    svg = `<g transform="translate(${ox},0)">${svg}</g>`;
  }
  return svg;
}

export function drawEntity(
  type: string,
  x: number,
  y: number,
  opts?: SpriteOpts,
): string {
  const fn = entitySprites[type];
  if (fn === undefined) {
    return '';
  }
  return fn(x, y, opts);
}

export function drawPlayer(x: number, y: number): string {
  return entitySprites.player(x, y);
}
