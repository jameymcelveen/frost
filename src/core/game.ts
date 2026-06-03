import { resolveTurn } from './rules.ts';
import {
  GameStatus,
  type Direction,
  type GameState,
  type PlayerInput,
} from './types.ts';

export class Game {
  private state: GameState;
  private readonly initialState: GameState;

  constructor(initialState: GameState) {
    this.initialState = freezeSnapshot(initialState);
    this.state = cloneGameState(initialState);
  }

  step(input: PlayerInput): GameState {
    if (input === null || this.state.status !== GameStatus.Playing) {
      return this.getState();
    }

    this.state = resolveTurn(this.state, input);
    return this.getState();
  }

  /** M4: undo stack. M1 returns current state unchanged. */
  undo(): GameState {
    return this.getState();
  }

  reset(): GameState {
    this.state = cloneGameState(this.initialState);
    return this.getState();
  }

  getState(): GameState {
    return cloneGameState(this.state);
  }
}

function cloneGameState(state: GameState): GameState {
  return {
    ...state,
    tiles: state.tiles.map((row) => [...row]),
    entities: state.entities.map((e) => ({
      ...e,
      position: { ...e.position },
    })),
    player: { ...state.player },
  };
}

function freezeSnapshot(state: GameState): GameState {
  return cloneGameState(state);
}

export function directionFromKey(key: string): Direction | null {
  switch (key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      return 'north';
    case 'ArrowDown':
    case 's':
    case 'S':
      return 'south';
    case 'ArrowLeft':
    case 'a':
    case 'A':
      return 'west';
    case 'ArrowRight':
    case 'd':
    case 'D':
      return 'east';
    default:
      return null;
  }
}
