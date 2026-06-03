import { describe, expect, it } from 'vitest';
import { parseLevel } from '../../src/core/level.ts';
import { Game } from '../../src/core/game.ts';
import { GameStatus } from '../../src/core/types.ts';
import { computeDartBeam, isOnDartBeam } from '../../src/core/traps/beam.ts';
import { TrapType } from '../../src/core/traps/types.ts';
import {
  applyMarkerTelegraphs,
  validateTrapFairness,
} from '../../src/core/traps/telegraph.ts';
import { resolveTurn, canPlayerMove } from '../../src/core/rules.ts';
import level02 from '../../src/levels/level-02-traps.json';
import { vec } from '../../src/core/grid.ts';

describe('traps', () => {
  const { initialState } = parseLevel(level02);

  it('validates fairness for level-02', () => {
    const warnings = validateTrapFairness(
      initialState.traps,
      initialState.markers,
    );
    expect(warnings).toHaveLength(0);
  });

  it('computes dart beam until wall', () => {
    const dart = initialState.traps.find((t) => t.id === 'dart-1');
    expect(dart).toBeDefined();
    const beam = computeDartBeam(initialState, dart!);
    expect(beam.map((p) => p.x)).toEqual([8, 7]);
  });

  it('stops and hits when entering hot tile', () => {
    const onBeam = {
      ...initialState,
      player: { x: 8, y: 3 },
    };
    expect(canPlayerMove(onBeam, 'west')).toBe(false);
    const next = resolveTurn(onBeam, 'west');
    expect(next.status).toBe(GameStatus.Lost);
    expect(next.player).toEqual({ x: 8, y: 3 });
  });

  it('disables beam when switch engaged', () => {
    const off = {
      ...initialState,
      switches: initialState.switches.map((s) =>
        s.id === 'sw-1' ? { ...s, engaged: true } : s,
      ),
    };
    expect(isOnDartBeam(off, { x: 7, y: 3 })).toBe(false);
  });

  it('block in beam terminates downstream tiles', () => {
    const withBlock = {
      ...initialState,
      entities: initialState.entities.map((e) =>
        e.id === 'block-1' ? { ...e, position: { x: 6, y: 3 } } : e,
      ),
    };
    const dart = withBlock.traps.find((t) => t.id === 'dart-1')!;
    const beam = computeDartBeam(withBlock, dart);
    expect(beam).toHaveLength(3);
    expect(beam[2]).toEqual({ x: 6, y: 3 });
    expect(isOnDartBeam(withBlock, { x: 5, y: 3 })).toBe(false);
  });

  it('telegraphs giveway when adjacent (before stepping on)', () => {
    const near = {
      ...initialState,
      player: { x: 2, y: 5 },
    };
    const next = applyMarkerTelegraphs(near);
    expect(
      next.telegraphs.some((t) => t.trapId === 'gw-tremble'),
    ).toBe(true);
  });

  it('collapses giveway after leave into pit', () => {
    let state = { ...initialState, player: { x: 3, y: 6 } };
    state = resolveTurn(state, 'north');
    expect(state.armedGivewayIds).toContain('gw-tremble');
    state = resolveTurn(state, 'south');
    const trap = state.traps.find((t) => t.id === 'gw-tremble')!;
    expect(state.collapsedTrapIds).toContain('gw-tremble');
    expect(state.tiles[trap.position.y]?.[trap.position.x]).toBe('pit');
  });

  it('instant giveway loses without moving onto tile', () => {
    const near = {
      ...initialState,
      player: { x: 2, y: 1 },
    };
    const next = resolveTurn(near, 'east');
    expect(next.status).toBe(GameStatus.Lost);
    expect(next.player).toEqual({ x: 2, y: 1 });
    expect(next.collapsedTrapIds).toContain('gw-instant');
  });

  it('warns on giveway without telegraph', () => {
    const bad = [
      {
        id: 'bad',
        type: TrapType.Giveway,
        position: vec(0, 0),
        config: { collapseMode: 'instant' as const, telegraph: '' as 'tremble' },
      },
    ];
    const warnings = validateTrapFairness(bad, []);
    expect(warnings.length).toBeGreaterThan(0);
  });

  it('toggle switch by stepping on plate', () => {
    const game = new Game(initialState);
    for (let i = 0; i < 7; i++) {
      game.step('east');
    }
    game.step('north');
    const sw = game.getState().switches.find((s) => s.id === 'sw-1');
    expect(sw?.engaged).toBe(true);
    expect(isOnDartBeam(game.getState(), { x: 7, y: 3 })).toBe(false);
  });
});
