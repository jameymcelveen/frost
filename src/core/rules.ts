import { offset, tileAt, vecEq } from './grid.ts';
import { resolvePlayerMove, toggleSwitchAtPlayer, applyHit } from './movement.ts';
import {
  evaluateTrapEnter,
  runTrapAfterMove,
} from './traps/registry.ts';
import { applyMarkerTelegraphs } from './traps/telegraph.ts';
import { CollapseMode, TrapType, type GivewayTrapConfig } from './traps/types.ts';
import { collapseGivewayTrap } from './traps/giveway.ts';
import {
  GameStatus,
  TileType,
  type Direction,
  type Entity,
  type GameState,
} from './types.ts';
import { EntityType } from './types.ts';

function cloneState(state: GameState): GameState {
  return {
    ...state,
    tiles: state.tiles.map((row) => [...row]),
    entities: state.entities.map((e) => ({
      ...e,
      position: { ...e.position },
      config: { ...e.config },
    })),
    traps: state.traps.map((t) => ({
      ...t,
      position: { ...t.position },
      config: { ...t.config },
    })),
    switches: state.switches.map((s) => ({ ...s, position: { ...s.position } })),
    markers: state.markers.map((m) => ({ ...m, position: { ...m.position } })),
    telegraphs: [...state.telegraphs],
    collapsedTrapIds: [...state.collapsedTrapIds],
    armedGivewayIds: [...state.armedGivewayIds],
    player: { ...state.player },
  };
}

function checkWin(state: GameState): GameState {
  const tile = tileAt(state.tiles, state.player);
  if (tile !== TileType.Exit) {
    return state;
  }
  return { ...state, status: GameStatus.Won };
}

function resolveInstantGivewayFall(state: GameState): GameState {
  const trap = state.traps.find(
    (t) =>
      t.type === TrapType.Giveway &&
      t.position.x === state.player.x &&
      t.position.y === state.player.y,
  );
  if (trap === undefined) {
    return state;
  }
  const cfg = trap.config as GivewayTrapConfig;
  if (cfg.collapseMode !== CollapseMode.Instant) {
    return state;
  }
  let next = collapseGivewayTrap(state, trap);
  return { ...next, status: GameStatus.Lost };
}

/**
 * Resolves one full turn: telegraphs → enter checks → move → switches → trap aftermath → win.
 */
export function resolveTurn(
  state: GameState,
  direction: Direction,
): GameState {
  if (state.status !== GameStatus.Playing) {
    return state;
  }

  let next = cloneState(state);
  next = applyMarkerTelegraphs(next);

  const target = offset(next.player, direction);
  const enter = evaluateTrapEnter(next, target, next.player);

  if (enter.kind === 'hit') {
    const instant = next.traps.find(
      (t) =>
        t.type === TrapType.Giveway &&
        vecEq(t.position, target) &&
        (t.config as GivewayTrapConfig).collapseMode === CollapseMode.Instant,
    );
    if (instant !== undefined) {
      next = collapseGivewayTrap(next, instant);
    }
    return applyHit(applyMarkerTelegraphs(next));
  }

  const previousPlayer = { ...next.player };
  next = resolvePlayerMove(next, direction);

  if (enter.kind === 'block' && next.player.x === previousPlayer.x &&
      next.player.y === previousPlayer.y) {
    return applyMarkerTelegraphs(next);
  }

  next = toggleSwitchAtPlayer(next);
  next = runTrapAfterMove(next, direction, previousPlayer);
  next = resolveInstantGivewayFall(next);
  next = { ...next, turn: next.turn + 1 };
  next = applyMarkerTelegraphs(next);
  next = checkWin(next);
  return next;
}

export function canPlayerMove(state: GameState, direction: Direction): boolean {
  if (state.status !== GameStatus.Playing) {
    return false;
  }
  const target = offset(state.player, direction);
  const enter = evaluateTrapEnter(state, target, state.player);
  if (enter.kind === 'hit') {
    return false;
  }
  const probe = resolvePlayerMove(cloneState(state), direction);
  return (
    probe.player.x !== state.player.x || probe.player.y !== state.player.y
  );
}

export function entityBlocksMovement(entity: Entity): boolean {
  return (
    entity.type === EntityType.Block ||
    entity.type === EntityType.TikiShooter ||
    entity.type === EntityType.TikiWalker
  );
}
