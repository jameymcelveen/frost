import { inBounds, offset, tileAt, vecEq } from './grid.ts';
import {
  EntityType,
  GameStatus,
  TileType,
  type Direction,
  type Entity,
  type GameState,
  type Vec2,
} from './types.ts';

function cloneState(state: GameState): GameState {
  return {
    ...state,
    tiles: state.tiles.map((row) => [...row]),
    entities: state.entities.map((e) => ({
      ...e,
      position: { ...e.position },
      config: { ...e.config },
    })),
    player: { ...state.player },
  };
}

function entityAt(entities: readonly Entity[], pos: Vec2): Entity | undefined {
  return entities.find((e) => vecEq(e.position, pos));
}

function isBlockingTile(tile: TileType | undefined): boolean {
  if (tile === undefined) {
    return true;
  }
  return tile === TileType.Wall;
}

function isBlockingCell(state: GameState, pos: Vec2): boolean {
  if (!inBounds(pos, state.width, state.height)) {
    return true;
  }

  const tile = tileAt(state.tiles, pos);
  if (isBlockingTile(tile)) {
    return true;
  }

  const ent = entityAt(state.entities, pos);
  if (ent === undefined) {
    return false;
  }

  // M1: blocks and enemies occupy their cell (push/combat in later milestones).
  return true;
}

function resolvePlayerMove(
  state: GameState,
  direction: Direction,
): GameState {
  const next = offset(state.player, direction);
  if (isBlockingCell(state, next)) {
    return state;
  }

  return { ...state, player: next };
}

function checkWin(state: GameState): GameState {
  const tile = tileAt(state.tiles, state.player);
  if (tile !== TileType.Exit) {
    return state;
  }

  // M1: exit wins immediately (collectible lock arrives in M2).
  return { ...state, status: GameStatus.Won };
}

/**
 * Resolves one full turn: player move, then hazards, enemies, win/lose.
 * M1 implements player movement, blocking, and exit win only.
 */
export function resolveTurn(
  state: GameState,
  direction: Direction,
): GameState {
  if (state.status !== GameStatus.Playing) {
    return state;
  }

  let next = cloneState(state);
  next = resolvePlayerMove(next, direction);
  // M2+: resolveHazards(next)
  // M3+: resolveEnemies(next)
  next = { ...next, turn: next.turn + 1 };
  next = checkWin(next);
  return next;
}

/** Whether a direction input would change game state (used by tests). */
export function canPlayerMove(state: GameState, direction: Direction): boolean {
  if (state.status !== GameStatus.Playing) {
    return false;
  }
  const next = offset(state.player, direction);
  return !isBlockingCell(state, next);
}

export function entityBlocksMovement(entity: Entity): boolean {
  return (
    entity.type === EntityType.Block ||
    entity.type === EntityType.TikiShooter ||
    entity.type === EntityType.TikiWalker
  );
}
