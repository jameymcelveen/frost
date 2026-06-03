import { inBounds, offset, tileAt, vecEq } from '../grid.ts';
import { EntityType, TileType, type GameState, type Vec2 } from '../types.ts';
import { TrapType, type DartTrapConfig, type Trap } from './types.ts';

function entityAt(
  state: GameState,
  pos: Vec2,
): GameState['entities'][number] | undefined {
  return state.entities.find((e) => vecEq(e.position, pos));
}

export function isDartTrapDisabled(state: GameState, trap: Trap): boolean {
  if (trap.type !== TrapType.Dart) {
    return true;
  }
  const cfg = trap.config as DartTrapConfig;
  if (cfg.switchId === undefined) {
    return false;
  }
  const sw = state.switches.find((s) => s.id === cfg.switchId);
  return sw?.engaged === true;
}

/** Floor cells on an active dart line (includes terminating block cell). */
export function computeDartBeam(state: GameState, trap: Trap): readonly Vec2[] {
  if (trap.type !== TrapType.Dart || isDartTrapDisabled(state, trap)) {
    return [];
  }

  const cfg = trap.config as DartTrapConfig;
  const beam: Vec2[] = [];
  let pos = offset(trap.position, cfg.dir);

  while (inBounds(pos, state.width, state.height)) {
    const tile = tileAt(state.tiles, pos);
    if (tile === TileType.Wall) {
      break;
    }

    const ent = entityAt(state, pos);
    if (ent?.type === EntityType.Block) {
      beam.push(pos);
      break;
    }

    if (
      tile === TileType.Floor ||
      tile === TileType.Exit ||
      tile === TileType.Collectible ||
      tile === TileType.Spikes
    ) {
      beam.push(pos);
      pos = offset(pos, cfg.dir);
      continue;
    }

    break;
  }

  return beam;
}

export function allActiveDartBeams(
  state: GameState,
): ReadonlyMap<string, readonly Vec2[]> {
  const map = new Map<string, readonly Vec2[]>();
  for (const trap of state.traps) {
    if (trap.type === TrapType.Dart) {
      map.set(trap.id, computeDartBeam(state, trap));
    }
  }
  return map;
}

export function isOnDartBeam(
  state: GameState,
  pos: Vec2,
): boolean {
  for (const trap of state.traps) {
    if (trap.type !== TrapType.Dart) {
      continue;
    }
    const beam = computeDartBeam(state, trap);
    if (beam.some((p) => vecEq(p, pos))) {
      return true;
    }
  }
  return false;
}
