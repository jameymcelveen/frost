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
import { isOnDartBeam } from './traps/beam.ts';

function entityAt(state: GameState, pos: Vec2): Entity | undefined {
  return state.entities.find((e) => vecEq(e.position, pos));
}

function isWall(tile: TileType | undefined): boolean {
  return tile === TileType.Wall;
}

function isWalkableTile(tile: TileType | undefined): boolean {
  if (tile === undefined) {
    return false;
  }
  return (
    tile === TileType.Floor ||
    tile === TileType.Exit ||
    tile === TileType.Collectible ||
    tile === TileType.Spikes
  );
}

function canOccupy(state: GameState, pos: Vec2): boolean {
  if (!inBounds(pos, state.width, state.height)) {
    return false;
  }
  if (isOnDartBeam(state, pos)) {
    return false;
  }
  const tile = tileAt(state.tiles, pos);
  if (!isWalkableTile(tile) && tile !== TileType.Pit) {
    return false;
  }
  if (entityAt(state, pos) !== undefined) {
    return false;
  }
  return true;
}

function pushBlock(
  state: GameState,
  block: Entity,
  dir: Direction,
): GameState | null {
  const dest = offset(block.position, dir);
  if (!inBounds(dest, state.width, state.height)) {
    return null;
  }

  const destTile = tileAt(state.tiles, dest);
  if (entityAt(state, dest) !== undefined) {
    return null;
  }

  let tiles = state.tiles.map((row) => [...row]);
  let entities = state.entities.map((e) => ({ ...e, position: { ...e.position } }));

  if (destTile === TileType.Pit) {
    const row = tiles[dest.y];
    if (row !== undefined) {
      row[dest.x] = TileType.Floor;
    }
  } else if (!isWalkableTile(destTile)) {
    return null;
  }

  entities = entities.map((e) =>
    e.id === block.id ? { ...e, position: dest } : e,
  );

  return { ...state, tiles, entities };
}

export function resolvePlayerMove(
  state: GameState,
  direction: Direction,
): GameState {
  const target = offset(state.player, direction);
  if (!inBounds(target, state.width, state.height)) {
    return state;
  }

  const tile = tileAt(state.tiles, target);
  if (isWall(tile)) {
    return state;
  }

  const ent = entityAt(state, target);
  if (ent?.type === EntityType.Block) {
    const pushed = pushBlock(state, ent, direction);
    if (pushed === null) {
      return state;
    }
    const playerDest = offset(state.player, direction);
    return { ...pushed, player: playerDest };
  }

  if (ent !== undefined) {
    return state;
  }

  if (!isWalkableTile(tile)) {
    return state;
  }

  if (isOnDartBeam(state, target)) {
    return state;
  }

  return { ...state, player: target };
}

export function isBlockingCell(state: GameState, pos: Vec2): boolean {
  if (!inBounds(pos, state.width, state.height)) {
    return true;
  }
  const tile = tileAt(state.tiles, pos);
  if (isWall(tile)) {
    return true;
  }
  if (isOnDartBeam(state, pos)) {
    return true;
  }
  const ent = entityAt(state, pos);
  return ent !== undefined;
}

export function toggleSwitchAtPlayer(state: GameState): GameState {
  const sw = state.switches.find((s) => vecEq(s.position, state.player));
  if (sw === undefined) {
    return state;
  }

  const switches = state.switches.map((s) =>
    s.id === sw.id ? { ...s, engaged: !s.engaged } : s,
  );

  return { ...state, switches };
}

export function applyHit(state: GameState): GameState {
  return { ...state, status: GameStatus.Lost };
}
