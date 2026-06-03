import { TrapType, type ActiveTelegraph, type GivewayTrapConfig, type Trap } from './types.ts';
import { getTrapHandler } from './registry.ts';
import { adjacentGivewayTraps } from './giveway.ts';
import type { GameState } from '../types.ts';

const PROXIMITY_TILES = 1;

export function isWithinProximity(
  player: { x: number; y: number },
  target: { x: number; y: number },
  distance: number,
): boolean {
  const dx = Math.abs(player.x - target.x);
  const dy = Math.abs(player.y - target.y);
  return dx + dy <= distance && !(dx === 0 && dy === 0);
}

/** Decoupled proximity pass — any trap may register a telegraph when Frost is nearby. */
export function computeActiveTelegraphs(state: GameState): readonly ActiveTelegraph[] {
  const out: ActiveTelegraph[] = [];

  for (const trap of state.traps) {
    if (!isWithinProximity(state.player, trap.position, PROXIMITY_TILES)) {
      continue;
    }

    const handler = getTrapHandler(trap.type);
    const kind = handler.telegraphKind(trap);
    if (kind === null) {
      continue;
    }

    if (trap.type === TrapType.Giveway) {
      const cfg = trap.config as GivewayTrapConfig;
      if (cfg.telegraph === 'statue' && cfg.linkedTileId !== undefined) {
        out.push({
          trapId: trap.id,
          kind,
          markerId: cfg.linkedTileId,
        });
        continue;
      }
    }

    out.push({ trapId: trap.id, kind });
  }

  return out;
}

export function applyMarkerTelegraphs(state: GameState): GameState {
  const telegraphs = computeActiveTelegraphs(state);
  const openIds = new Set(
    telegraphs
      .filter((t) => t.markerId !== undefined)
      .map((t) => t.markerId as string),
  );

  const markers = state.markers.map((m) => ({
    ...m,
    eyeOpen: openIds.has(m.id),
  }));

  return { ...state, telegraphs, markers };
}

export function validateTrapFairness(
  traps: readonly Trap[],
  markers: readonly { id: string }[],
): readonly string[] {
  const warnings: string[] = [];
  const markerIds = new Set(markers.map((m) => m.id));

  for (const trap of traps) {
    const handler = getTrapHandler(trap.type);
    if (!handler.requiresTelegraph) {
      continue;
    }

    if (trap.type === TrapType.Dart) {
      const cfg = trap.config as { telegraph?: string };
      if (cfg.telegraph !== 'beam') {
        warnings.push(
          `Trap "${trap.id}" (dart): must declare telegraph "beam" (visible line of fire).`,
        );
      }
      continue;
    }

    if (trap.type === TrapType.Giveway) {
      const cfg = trap.config as GivewayTrapConfig;
      if (cfg.telegraph !== 'tremble' && cfg.telegraph !== 'statue') {
        warnings.push(
          `Trap "${trap.id}" (giveway): must declare telegraph "tremble" or "statue".`,
        );
      }
      if (cfg.telegraph === 'statue' && cfg.linkedTileId === undefined) {
        warnings.push(
          `Trap "${trap.id}" (giveway): telegraph "statue" requires linkedTileId.`,
        );
      }
      if (
        cfg.telegraph === 'statue' &&
        cfg.linkedTileId !== undefined &&
        !markerIds.has(cfg.linkedTileId)
      ) {
        warnings.push(
          `Trap "${trap.id}" (giveway): linkedTileId "${cfg.linkedTileId}" not found in markers.`,
        );
      }
    }
  }

  return warnings;
}
