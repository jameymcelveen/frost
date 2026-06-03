import { describe, expect, it } from 'vitest';
import { Game, directionFromKey } from '../../src/core/game.ts';
import { parseLevel } from '../../src/core/level.ts';
import { GameStatus } from '../../src/core/types.ts';
import level01 from '../../src/levels/level-01.json';

describe('Game', () => {
  it('maps keyboard keys to directions', () => {
    expect(directionFromKey('ArrowUp')).toBe('north');
    expect(directionFromKey('d')).toBe('east');
    expect(directionFromKey('Escape')).toBeNull();
  });

  it('steps and resets', () => {
    const { initialState } = parseLevel(level01);
    const game = new Game(initialState);
    game.step('east');
    expect(game.getState().player.x).toBe(2);
    game.reset();
    expect(game.getState().player).toEqual(initialState.player);
    expect(game.getState().turn).toBe(0);
  });

  it('ignores null input', () => {
    const { initialState } = parseLevel(level01);
    const game = new Game(initialState);
    game.step(null);
    expect(game.getState().player).toEqual(initialState.player);
  });

  it('can win level-01 by reaching exit', () => {
    const { initialState } = parseLevel(level01);
    const game = new Game(initialState);
    const moves: Array<'east' | 'north' | 'west'> = [
      'east', 'east', 'east', 'east', 'east', 'east', 'east',
      'north', 'north', 'north', 'north', 'north',
      'west',
    ];
    for (const m of moves) {
      game.step(m);
      if (game.getState().status === GameStatus.Won) {
        break;
      }
    }
    expect(game.getState().status).toBe(GameStatus.Won);
    expect(game.getState().player).toEqual({ x: 7, y: 2 });
  });
});
