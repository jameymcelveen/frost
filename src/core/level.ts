import { z } from 'zod';
import {
  EntityType,
  TileType,
  type Entity,
  type GameState,
  type LevelMetadata,
  type TileType as Tile,
  type Vec2,
  GameStatus,
} from './types.ts';
import { vec } from './grid.ts';
import {
  TrapType,
  type Trap,
  type SwitchState,
  type MarkerState,
} from './traps/types.ts';
import { validateTrapFairness } from './traps/telegraph.ts';

const CURRENT_VERSION = 2;

const directionSchema = z.enum(['north', 'south', 'east', 'west']);

const tileSchema = z.enum([
  TileType.Floor,
  TileType.Wall,
  TileType.Exit,
  TileType.Pit,
  TileType.Spikes,
  TileType.Collectible,
]);

const vecSchema = z.object({
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
});

const entitySchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    EntityType.Block,
    EntityType.TikiShooter,
    EntityType.TikiWalker,
  ]),
  position: vecSchema,
  config: z
    .object({
      facing: directionSchema.optional(),
      path: z.array(vecSchema).optional(),
    })
    .default({}),
});

const dartTrapSchema = z.object({
  id: z.string().min(1),
  type: z.literal(TrapType.Dart),
  position: vecSchema,
  config: z.object({
    dir: directionSchema,
    switchId: z.string().optional(),
    telegraph: z.literal('beam').default('beam'),
  }),
});

const givewayTrapSchema = z.object({
  id: z.string().min(1),
  type: z.literal(TrapType.Giveway),
  position: vecSchema,
  config: z.object({
    collapseMode: z.enum(['afterLeave', 'instant']),
    telegraph: z.enum(['tremble', 'statue']),
    linkedTileId: z.string().optional(),
  }),
});

const trapSchema = z.discriminatedUnion('type', [
  dartTrapSchema,
  givewayTrapSchema,
]);

const switchSchema = z.object({
  id: z.string().min(1),
  position: vecSchema,
  initiallyEngaged: z.boolean().default(false),
});

const markerSchema = z.object({
  id: z.string().min(1),
  position: vecSchema,
  spriteId: z.string().min(1),
});

const levelBaseSchema = z.object({
  version: z.union([z.literal(1), z.literal(2)]),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  tiles: z.array(tileSchema),
  entities: z.array(entitySchema).default([]),
  traps: z.array(trapSchema).default([]),
  switches: z.array(switchSchema).default([]),
  markers: z.array(markerSchema).default([]),
  playerStart: vecSchema,
  metadata: z.object({
    name: z.string().min(1),
    author: z.string().optional(),
    parMoves: z.number().int().positive().optional(),
  }),
});

export const levelSchema = levelBaseSchema.superRefine((data, ctx) => {
  const expected = data.width * data.height;
  if (data.tiles.length !== expected) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `tiles length must be ${expected} (width * height), got ${data.tiles.length}`,
      path: ['tiles'],
    });
  }

  const inGrid = (p: Vec2) =>
    p.x >= 0 && p.y >= 0 && p.x < data.width && p.y < data.height;

  if (!inGrid(data.playerStart)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'playerStart must be inside the grid',
      path: ['playerStart'],
    });
  }

  const ids = new Set<string>();
  for (const [i, ent] of data.entities.entries()) {
    if (ids.has(ent.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `duplicate entity id: ${ent.id}`,
        path: ['entities', i, 'id'],
      });
    }
    ids.add(ent.id);

    if (!inGrid(ent.position)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'entity position must be inside the grid',
        path: ['entities', i, 'position'],
      });
    }

    if (ent.type === EntityType.TikiShooter && ent.config.facing === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'tiki-shooter requires config.facing',
        path: ['entities', i, 'config', 'facing'],
      });
    }

    if (
      ent.type === EntityType.TikiWalker &&
      (ent.config.path === undefined || ent.config.path.length < 2)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'tiki-walker requires config.path with at least 2 points',
        path: ['entities', i, 'config', 'path'],
      });
    }
  }

  const trapIds = new Set<string>();
  for (const [i, trap] of data.traps.entries()) {
    if (trapIds.has(trap.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `duplicate trap id: ${trap.id}`,
        path: ['traps', i, 'id'],
      });
    }
    trapIds.add(trap.id);

    if (!inGrid(trap.position)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'trap position must be inside the grid',
        path: ['traps', i, 'position'],
      });
    }

    if (
      trap.type === TrapType.Giveway &&
      trap.config.telegraph === 'statue' &&
      trap.config.linkedTileId === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'giveway telegraph "statue" requires linkedTileId',
        path: ['traps', i, 'config', 'linkedTileId'],
      });
    }
  }
});

export type LevelJson = z.infer<typeof levelSchema>;

export interface ParsedLevel {
  readonly metadata: LevelMetadata;
  readonly initialState: GameState;
  readonly raw: LevelJson;
  readonly fairnessWarnings: readonly string[];
}

function tilesToGrid(
  flat: readonly Tile[],
  width: number,
  height: number,
): Tile[][] {
  const grid: Tile[][] = [];
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      const cell = flat[y * width + x];
      if (cell === undefined) {
        throw new Error(`missing tile at (${x}, ${y})`);
      }
      row.push(cell);
    }
    grid.push(row);
  }
  return grid;
}

function countCollectibles(tiles: readonly (readonly Tile[])[]): number {
  let n = 0;
  for (const row of tiles) {
    for (const cell of row) {
      if (cell === TileType.Collectible) {
        n += 1;
      }
    }
  }
  return n;
}

function mapEntity(raw: LevelJson['entities'][number]): Entity {
  const base = {
    id: raw.id,
    type: raw.type,
    position: vec(raw.position.x, raw.position.y),
  };

  if (raw.type === EntityType.TikiShooter) {
    const facing = raw.config.facing;
    if (facing === undefined) {
      throw new Error(`tiki-shooter ${raw.id} missing facing`);
    }
    return { ...base, config: { facing } };
  }

  if (raw.type === EntityType.TikiWalker) {
    const path = raw.config.path;
    if (path === undefined || path.length < 2) {
      throw new Error(`tiki-walker ${raw.id} missing path`);
    }
    return {
      ...base,
      config: { path: path.map((p) => vec(p.x, p.y)) },
    };
  }

  return { ...base, config: {} };
}

function mapTrap(raw: LevelJson['traps'][number]): Trap {
  const base = {
    id: raw.id,
    type: raw.type,
    position: vec(raw.position.x, raw.position.y),
  };

  if (raw.type === TrapType.Dart) {
    return {
      ...base,
      config: {
        dir: raw.config.dir,
        switchId: raw.config.switchId,
        telegraph: raw.config.telegraph,
      },
    };
  }

  return {
    ...base,
    config: {
      collapseMode: raw.config.collapseMode,
      telegraph: raw.config.telegraph,
      linkedTileId: raw.config.linkedTileId,
    },
  };
}

function mapSwitches(raw: LevelJson['switches']): SwitchState[] {
  return raw.map((s) => ({
    id: s.id,
    position: vec(s.position.x, s.position.y),
    engaged: s.initiallyEngaged,
  }));
}

function mapMarkers(raw: LevelJson['markers']): MarkerState[] {
  return raw.map((m) => ({
    id: m.id,
    position: vec(m.position.x, m.position.y),
    spriteId: m.spriteId,
    eyeOpen: false,
  }));
}

export function parseLevel(data: unknown): ParsedLevel {
  const parsed = levelSchema.parse(data);
  const tiles = tilesToGrid(parsed.tiles, parsed.width, parsed.height);
  const entities = parsed.entities.map(mapEntity);
  const traps = parsed.traps.map(mapTrap);
  const switches = mapSwitches(parsed.switches);
  const markers = mapMarkers(parsed.markers);
  const fairnessWarnings = validateTrapFairness(traps, markers);

  const initialState: GameState = {
    width: parsed.width,
    height: parsed.height,
    tiles,
    entities,
    traps,
    switches,
    markers,
    telegraphs: [],
    collapsedTrapIds: [],
    armedGivewayIds: [],
    player: vec(parsed.playerStart.x, parsed.playerStart.y),
    status: GameStatus.Playing,
    collectiblesRemaining: countCollectibles(tiles),
    turn: 0,
    levelName: parsed.metadata.name,
  };

  return {
    metadata: parsed.metadata,
    initialState,
    raw: parsed,
    fairnessWarnings,
  };
}

export function serializeLevel(level: LevelJson): string {
  return JSON.stringify(level, null, 2);
}
