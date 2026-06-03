import { EntityType, TileType, type Direction } from '../core/types.ts';

const TILE_SIZE = 48;

export function tileSize(): number {
  return TILE_SIZE;
}

function tileFill(type: string): string {
  switch (type) {
    case TileType.Floor:
      return '#3d3428';
    case TileType.Wall:
      return '#6b5a45';
    case TileType.Exit:
      return '#2a4a3a';
    case TileType.Pit:
      return '#0e0c0a';
    case TileType.Spikes:
      return '#5c3030';
    case TileType.Collectible:
      return '#4a3d20';
    default:
      return '#333';
  }
}

export function tileSvg(x: number, y: number, type: string): string {
  const px = x * TILE_SIZE;
  const py = y * TILE_SIZE;
  const fill = tileFill(type);
  const label =
    type === TileType.Exit
      ? 'EXIT'
      : type === TileType.Collectible
        ? 'GEM'
        : type === TileType.Pit
          ? 'PIT'
          : type === TileType.Spikes
            ? 'SPK'
            : '';

  const labelSvg =
    label.length > 0
      ? `<text x="${px + TILE_SIZE / 2}" y="${py + TILE_SIZE / 2 + 4}" text-anchor="middle" font-size="9" fill="#c9b896" font-family="system-ui,sans-serif">${label}</text>`
      : '';

  const stroke =
    type === TileType.Wall ? 'stroke="#8a7358" stroke-width="2"' : '';

  return `<rect x="${px}" y="${py}" width="${TILE_SIZE}" height="${TILE_SIZE}" fill="${fill}" ${stroke}/>${labelSvg}`;
}

export function playerSvg(x: number, y: number): string {
  const cx = x * TILE_SIZE + TILE_SIZE / 2;
  const cy = y * TILE_SIZE + TILE_SIZE / 2;
  return `<g>
    <circle cx="${cx}" cy="${cy}" r="14" fill="#c45c26" stroke="#f0d8a8" stroke-width="2"/>
    <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="8" fill="#1a1008" font-family="system-ui,sans-serif">BOB</text>
  </g>`;
}

export function entitySvg(
  x: number,
  y: number,
  type: string,
  facing?: Direction,
): string {
  const px = x * TILE_SIZE + 6;
  const py = y * TILE_SIZE + 6;
  const w = TILE_SIZE - 12;
  const h = TILE_SIZE - 12;

  switch (type) {
    case EntityType.Block:
      return `<rect x="${px}" y="${py}" width="${w}" height="${h}" fill="#7a6a50" stroke="#c9b896" stroke-width="2"/>
        <text x="${px + w / 2}" y="${py + h / 2 + 4}" text-anchor="middle" font-size="8" fill="#e8dcc8" font-family="system-ui,sans-serif">BLK</text>`;
    case EntityType.TikiShooter: {
      const arrow =
        facing === 'north'
          ? '▲'
          : facing === 'south'
            ? '▼'
            : facing === 'east'
              ? '▶'
              : '◀';
      return `<rect x="${px}" y="${py}" width="${w}" height="${h}" fill="#3a5c40" stroke="#8fd49a" stroke-width="2"/>
        <text x="${px + w / 2}" y="${py + h / 2 + 4}" text-anchor="middle" font-size="10" fill="#e8dcc8" font-family="system-ui,sans-serif">TK${arrow}</text>`;
    }
    case EntityType.TikiWalker:
      return `<ellipse cx="${px + w / 2}" cy="${py + h / 2}" rx="${w / 2 - 2}" ry="${h / 2 - 2}" fill="#5a3048" stroke="#d8a0c0" stroke-width="2"/>
        <text x="${px + w / 2}" y="${py + h / 2 + 4}" text-anchor="middle" font-size="8" fill="#e8dcc8" font-family="system-ui,sans-serif">WLK</text>`;
    default:
      return '';
  }
}
