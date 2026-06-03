import { describe, expect, it } from 'vitest';
import { parseLevel } from '../../src/core/level.ts';
import { canPlayerMove, resolveTurn } from '../../src/core/rules.ts';
import { GameStatus } from '../../src/core/types.ts';
import level01 from '../../src/levels/level-01.json';

describe('rules', () => {
  const { initialState } = parseLevel(level01);

  it('blocks movement into walls', () => {
    expect(canPlayerMove(initialState, 'west')).toBe(false);
    const next = resolveTurn(initialState, 'west');
    expect(next.player).toEqual(initialState.player);
  });

  it('blocks movement into pushable block (M1: static obstacle)', () => {
    const onBlock = {
      ...initialState,
      player: { x: 4, y: 6 },
    };
    expect(canPlayerMove(onBlock, 'east')).toBe(false);
  });

  it('allows movement on open floor', () => {
    expect(canPlayerMove(initialState, 'east')).toBe(true);
    const next = resolveTurn(initialState, 'east');
    expect(next.player).toEqual({ x: 2, y: 7 });
    expect(next.turn).toBe(1);
  });

  it('wins when player steps on exit (M1: ignores collectibles)', () => {
    const southOfExit = {
      ...initialState,
      player: { x: 7, y: 3 },
    };
    const won = resolveTurn(southOfExit, 'north');
    expect(won.status).toBe(GameStatus.Won);
    expect(won.player).toEqual({ x: 7, y: 2 });
  });

  it('does not change state after win', () => {
    const won = { ...initialState, status: GameStatus.Won };
    const next = resolveTurn(won, 'east');
    expect(next.player).toEqual(won.player);
  });
});
