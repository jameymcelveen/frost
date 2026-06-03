import { dartTrapHandler } from './dart.ts';
import { givewayTrapHandler } from './giveway.ts';
import {
  TrapType,
  type EnterAttemptResult,
  type Trap,
  type TrapContext,
  type TrapHandler,
} from './types.ts';
import type { GameState, Vec2 } from '../types.ts';
import type { TrapGameView } from './types.ts';

const handlers = new Map<string, TrapHandler>([
  [TrapType.Dart, dartTrapHandler],
  [TrapType.Giveway, givewayTrapHandler],
]);

export function registerTrap(handler: TrapHandler): void {
  handlers.set(handler.type, handler);
}

export function getTrapHandler(type: string): TrapHandler {
  const handler = handlers.get(type);
  if (handler === undefined) {
    throw new Error(`No trap handler registered for type: ${type}`);
  }
  return handler;
}

export function evaluateTrapEnter(
  state: GameState,
  targetPos: Vec2,
  playerFrom: Vec2,
): EnterAttemptResult {
  let result: EnterAttemptResult = { kind: 'allow' };

  for (const trap of state.traps) {
    const handler = getTrapHandler(trap.type);
    const ctx: TrapContext = { state, trap, targetPos, playerFrom };
    const attempt = handler.onEnterAttempt(ctx);

    if (attempt.kind === 'hit') {
      return { kind: 'hit' };
    }
    if (attempt.kind === 'block') {
      result = { kind: 'block' };
    }
  }

  return result;
}

export function runTrapAfterMove(
  state: GameState,
  direction: import('../types.ts').Direction,
  previousPlayer: Vec2,
): GameState {
  let next: TrapGameView = state;
  const ctx = { state: next, direction, previousPlayer };

  for (const trap of state.traps) {
    const handler = getTrapHandler(trap.type);
    if (handler.onAfterPlayerMove !== undefined) {
      next = handler.onAfterPlayerMove({ ...ctx, state: next });
    }
  }

  return next as GameState;
}
