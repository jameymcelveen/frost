import type { GameState } from '../core/types.ts';
import { allActiveDartBeams } from '../core/traps/beam.ts';
import { TrapType } from '../core/traps/types.ts';
import type { DartTrapConfig } from '../core/traps/types.ts';
import { tileSize } from './sprites.ts';

const CELL = tileSize();

export function dartBeamSvg(
  state: GameState,
  pulse: boolean,
): string {
  const beams = allActiveDartBeams(state);
  const parts: string[] = [];
  const stroke = pulse ? '#ff6b4a' : '#e85c4a';
  const opacity = pulse ? '0.85' : '0.55';

  for (const [, cells] of beams) {
    for (const cell of cells) {
      const x = cell.x * CELL + 4;
      const y = cell.y * CELL + 4;
      const w = CELL - 8;
      const h = CELL - 8;
      parts.push(
        `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${stroke}" fill-opacity="${opacity}" stroke="#ffaa88" stroke-width="1" stroke-dasharray="4 3"/>`,
      );
      const cx = cell.x * CELL + CELL / 2;
      const cy = cell.y * CELL + CELL / 2;
      parts.push(
        `<line x1="${cx - 6}" y1="${cy}" x2="${cx + 6}" y2="${cy}" stroke="#ffd0c0" stroke-width="2"/>`,
      );
    }
  }

  return parts.join('');
}

export function dartEmitterOverlays(state: GameState): string {
  const parts: string[] = [];
  for (const trap of state.traps) {
    if (trap.type !== TrapType.Dart) {
      continue;
    }
    const cfg = trap.config as DartTrapConfig;
    const px = trap.position.x * CELL + 6;
    const py = trap.position.y * CELL + 6;
    const arrow =
      cfg.dir === 'north'
        ? '▲'
        : cfg.dir === 'south'
          ? '▼'
          : cfg.dir === 'east'
            ? '▶'
            : '◀';
    parts.push(
      `<rect x="${px}" y="${py}" width="${CELL - 12}" height="${CELL - 12}" fill="#2d4a32" stroke="#e85c4a" stroke-width="2"/>
       <text x="${px + (CELL - 12) / 2}" y="${py + (CELL - 12) / 2 + 4}" text-anchor="middle" font-size="9" fill="#e8dcc8" font-family="system-ui,sans-serif">DR${arrow}</text>`,
    );
  }
  return parts.join('');
}

export function switchOverlay(state: GameState): string {
  return state.switches
    .map((sw) => {
      const fill = sw.engaged ? '#8fd49a' : '#6a5a38';
      const px = sw.position.x * CELL + 10;
      const py = sw.position.y * CELL + 26;
      return `<rect x="${px}" y="${py}" width="28" height="10" rx="2" fill="${fill}" stroke="#d4b87a" stroke-width="1"/>
        <text x="${sw.position.x * CELL + CELL / 2}" y="${sw.position.y * CELL + CELL / 2 + 4}" text-anchor="middle" font-size="7" fill="#c9b896" font-family="system-ui,sans-serif">SW</text>`;
    })
    .join('');
}
