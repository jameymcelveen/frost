import { describe, expect, it } from 'vitest';
import {
  resolvePlayerMove,
  isBlockingCell,
  toggleSwitchAtPlayer,
  applyHit,
} from '../../src/core/movement.ts';
import {
  EntityType,
  GameStatus,
  TileType,
  type GameState,
} from '../../src/core/types.ts';
import { vec } from '../../src/core/grid.ts';
import { TrapType, DartTelegraph } from '../../src/core/traps/types.ts';

describe('movement', () => {
  const createBaseState = (): GameState => ({
    width: 5,
    height: 5,
    tiles: Array(5).fill(null).map(() => Array(5).fill(TileType.Floor)),
    entities: [],
    player: vec(2, 2),
    status: GameStatus.Playing,
    turn: 0,
    collectiblesRemaining: 0,
    traps: [],
    switches: [],
    markers: [],
    telegraphs: [],
    collapsedTrapIds: [],
    armedGivewayIds: [],
    levelName: 'test-level',
  });

  describe('resolvePlayerMove', () => {
    it('moves the player to a walkable tile', () => {
      const state = createBaseState();
      const next = resolvePlayerMove(state, 'north');
      expect(next.player).toEqual(vec(2, 1));
    });

    it('does not move the player out of bounds', () => {
      const state = { ...createBaseState(), player: vec(0, 0) };
      const next = resolvePlayerMove(state, 'north');
      expect(next.player).toEqual(vec(0, 0));
    });

    it('does not move the player into a wall', () => {
      const state = createBaseState();
      const tiles = state.tiles.map((row) => [...row]);
      tiles[1]![2] = TileType.Wall;
      const next = resolvePlayerMove({ ...state, tiles }, 'north');
      expect(next.player).toEqual(vec(2, 2));
    });

    it('pushes a block into a floor tile', () => {
      const state = {
        ...createBaseState(),
        entities: [
          {
            id: 'block-1',
            type: EntityType.Block,
            position: vec(2, 1),
            config: {},
          },
        ],
      };
      const next = resolvePlayerMove(state, 'north');
      expect(next.player).toEqual(vec(2, 1));
      expect(next.entities.find((e) => e.id === 'block-1')?.position).toEqual(
        vec(2, 0),
      );
    });

    it('pushes a block into a pit and fills it', () => {
      const state = createBaseState();
      const tiles = state.tiles.map((row) => [...row]);
      tiles[0]![2] = TileType.Pit;
      const stateWithPit = {
        ...state,
        tiles,
        entities: [
          {
            id: 'block-1',
            type: EntityType.Block,
            position: vec(2, 1),
            config: {},
          },
        ],
      };
      const next = resolvePlayerMove(stateWithPit, 'north');
      expect(next.player).toEqual(vec(2, 1));
      expect(next.entities.find((e) => e.id === 'block-1')?.position).toEqual(
        vec(2, 0),
      );
      expect(next.tiles[0]![2]).toBe(TileType.Floor);
    });

    it('does not push a block into a wall', () => {
      const state = createBaseState();
      const tiles = state.tiles.map((row) => [...row]);
      tiles[0]![2] = TileType.Wall;
      const stateWithWall = {
        ...state,
        tiles,
        entities: [
          {
            id: 'block-1',
            type: EntityType.Block,
            position: vec(2, 1),
            config: {},
          },
        ],
      };
      const next = resolvePlayerMove(stateWithWall, 'north');
      expect(next.player).toEqual(vec(2, 2));
      expect(next.entities.find((e) => e.id === 'block-1')?.position).toEqual(
        vec(2, 1),
      );
    });

    it('does not push a block out of bounds', () => {
      const state = {
        ...createBaseState(),
        player: vec(2, 1),
        entities: [
          {
            id: 'block-1',
            type: EntityType.Block,
            position: vec(2, 0),
            config: {},
          },
        ],
      };
      const next = resolvePlayerMove(state, 'north');
      expect(next.player).toEqual(vec(2, 1));
      expect(next.entities.find((e) => e.id === 'block-1')?.position).toEqual(
        vec(2, 0),
      );
    });

    it('does not push a block into another entity', () => {
      const state = {
        ...createBaseState(),
        entities: [
          {
            id: 'block-1',
            type: EntityType.Block,
            position: vec(2, 1),
            config: {},
          },
          {
            id: 'block-2',
            type: EntityType.Block,
            position: vec(2, 0),
            config: {},
          },
        ],
      };
      const next = resolvePlayerMove(state, 'north');
      expect(next.player).toEqual(vec(2, 2));
      expect(next.entities.find((e) => e.id === 'block-1')?.position).toEqual(
        vec(2, 1),
      );
    });

    it('does not move into another entity (not a block)', () => {
      const state = {
        ...createBaseState(),
        entities: [
          {
            id: 'walker-1',
            type: EntityType.TikiWalker,
            position: vec(2, 1),
            config: { path: [] },
          },
        ],
      };
      const next = resolvePlayerMove(state, 'north');
      expect(next.player).toEqual(vec(2, 2));
    });

    it('does not move into a dart beam', () => {
      const state = {
        ...createBaseState(),
        traps: [
          {
            id: 'trap-1',
            type: TrapType.Dart,
            position: vec(0, 1),
            config: {
              dir: 'east',
              telegraph: DartTelegraph.Beam,
            },
          },
        ],
      };
      // Dart beam at y=1, from x=1 to x=4
      const next = resolvePlayerMove(state, 'north');
      expect(next.player).toEqual(vec(2, 2));
    });
  });

  describe('isBlockingCell', () => {
    it('returns true for out of bounds', () => {
      const state = createBaseState();
      expect(isBlockingCell(state, vec(-1, 0))).toBe(true);
      expect(isBlockingCell(state, vec(5, 0))).toBe(true);
    });

    it('returns true for walls', () => {
      const state = createBaseState();
      const tiles = state.tiles.map((row) => [...row]);
      tiles[0]![0] = TileType.Wall;
      expect(isBlockingCell({ ...state, tiles }, vec(0, 0))).toBe(true);
    });

    it('returns true for entities', () => {
      const state = {
        ...createBaseState(),
        entities: [
          {
            id: 'block-1',
            type: EntityType.Block,
            position: vec(0, 0),
            config: {},
          },
        ],
      };
      expect(isBlockingCell(state, vec(0, 0))).toBe(true);
    });

    it('returns true for dart beams', () => {
      const state = {
        ...createBaseState(),
        traps: [
          {
            id: 'trap-1',
            type: TrapType.Dart,
            position: vec(0, 0),
            config: {
              dir: 'east',
              telegraph: DartTelegraph.Beam,
            },
          },
        ],
      };
      expect(isBlockingCell(state, vec(1, 0))).toBe(true);
    });

    it('returns false for walkable floor', () => {
      const state = createBaseState();
      expect(isBlockingCell(state, vec(0, 0))).toBe(false);
    });
  });

  describe('toggleSwitchAtPlayer', () => {
    it('toggles a switch if player is on it', () => {
      const state = {
        ...createBaseState(),
        player: vec(0, 0),
        switches: [
          {
            id: 'switch-1',
            position: vec(0, 0),
            engaged: false,
          },
        ],
      };
      const next = toggleSwitchAtPlayer(state);
      expect(next.switches[0]!.engaged).toBe(true);

      const back = toggleSwitchAtPlayer(next);
      expect(back.switches[0]!.engaged).toBe(false);
    });

    it('does nothing if player is not on a switch', () => {
      const state = {
        ...createBaseState(),
        player: vec(1, 1),
        switches: [
          {
            id: 'switch-1',
            position: vec(0, 0),
            engaged: false,
          },
        ],
      };
      const next = toggleSwitchAtPlayer(state);
      expect(next.switches[0]!.engaged).toBe(false);
    });
  });

  describe('applyHit', () => {
    it('sets game status to Lost', () => {
      const state = createBaseState();
      const next = applyHit(state);
      expect(next.status).toBe(GameStatus.Lost);
    });
  });
});
