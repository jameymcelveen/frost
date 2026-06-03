import { offset, tileAt, vecEq } from '../grid.ts';
import { GameStatus, TileType, type GameState } from '../types.ts';
import type { Trap, TrapGameView } from './types.ts';
import {
  CollapseMode,
  TrapType,
  TelegraphKind,
  type EnterAttemptResult,
  type AfterMoveContext,
  type TrapContext,
  type TrapHandler,
  type GivewayTrapConfig,
} from './types.ts';

export function isGivewayCollapsed(state: GameState, trapId: string): boolean {
  return state.collapsedTrapIds.includes(trapId);
}

export function collapseGivewayTrap(
  state: GameState,
  trap: Trap,
): GameState {
  const tiles = state.tiles.map((row) => [...row]);
  const row = tiles[trap.position.y];
  if (row !== undefined) {
    row[trap.position.x] = TileType.Pit;
  }

  const collapsedTrapIds = state.collapsedTrapIds.includes(trap.id)
    ? state.collapsedTrapIds
    : [...state.collapsedTrapIds, trap.id];

  const armedGivewayIds = state.armedGivewayIds.filter((id) => id !== trap.id);

  return {
    ...state,
    tiles,
    collapsedTrapIds,
    armedGivewayIds,
  };
}

export const givewayTrapHandler: TrapHandler = {
  type: TrapType.Giveway,
  requiresTelegraph: true,

  telegraphKind(trap) {
    const cfg = trap.config as GivewayTrapConfig;
    return cfg.telegraph === 'statue'
      ? TelegraphKind.StatueEye
      : TelegraphKind.Tremble;
  },

  onEnterAttempt(ctx: TrapContext): EnterAttemptResult {
    if (ctx.trap.type !== TrapType.Giveway) {
      return { kind: 'allow' };
    }
    if (isGivewayCollapsed(ctx.state, ctx.trap.id)) {
      return { kind: 'allow' };
    }

    const cfg = ctx.trap.config as GivewayTrapConfig;
    if (!vecEq(ctx.targetPos, ctx.trap.position)) {
      return { kind: 'allow' };
    }

    if (cfg.collapseMode === CollapseMode.Instant) {
      return { kind: 'hit' };
    }

    return { kind: 'allow' };
  },

  onAfterPlayerMove(ctx: AfterMoveContext): TrapGameView {
    let next = ctx.state;
    const left = ctx.previousPlayer;

    for (const trapId of ctx.state.armedGivewayIds) {
      const trap = ctx.state.traps.find((t) => t.id === trapId);
      if (trap === undefined || trap.type !== TrapType.Giveway) {
        continue;
      }
      if (!vecEq(left, trap.position)) {
        continue;
      }
      next = collapseGivewayTrap(next, trap);
    }

    const entered = next.traps.find(
      (t) =>
        t.type === TrapType.Giveway &&
        vecEq(t.position, next.player) &&
        !isGivewayCollapsed(next, t.id),
    );

    if (entered !== undefined) {
      const cfg = entered.config as GivewayTrapConfig;
      if (cfg.collapseMode === CollapseMode.AfterLeave) {
        if (!next.armedGivewayIds.includes(entered.id)) {
          next = {
            ...next,
            armedGivewayIds: [...next.armedGivewayIds, entered.id],
          };
        }
      }
    }

    const tile = tileAt(next.tiles, next.player);
    if (tile === TileType.Pit) {
      return { ...next, status: GameStatus.Lost };
    }

    return next;
  },
};

export function isAdjacentToTrap(
  player: { x: number; y: number },
  trapPos: { x: number; y: number },
): boolean {
  const dx = Math.abs(player.x - trapPos.x);
  const dy = Math.abs(player.y - trapPos.y);
  return dx + dy === 1;
}

export function adjacentGivewayTraps(
  state: GameState,
): readonly Trap[] {
  return state.traps.filter(
    (t) =>
      t.type === TrapType.Giveway &&
      !isGivewayCollapsed(state, t.id) &&
      isAdjacentToTrap(state.player, t.position),
  );
}
