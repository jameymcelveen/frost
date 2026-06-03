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

const CURRENT_VERSION = 1;

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

export const levelSchema = z
  .object({
    version: z.literal(CURRENT_VERSION),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    tiles: z.array(tileSchema),
    entities: z.array(entitySchema).default([]),
    playerStart: vecSchema,
    metadata: z.object({
      name: z.string().min(1),
      author: z.string().optional(),
      parMoves: z.number().int().positive().optional(),
    }),
  })
  .superRefine((data, ctx) => {
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
  });

export type LevelJson = z.infer<typeof levelSchema>;

export interface ParsedLevel {
  readonly metadata: LevelMetadata;
  readonly initialState: GameState;
  readonly raw: LevelJson;
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

export function parseLevel(data: unknown): ParsedLevel {
  const parsed = levelSchema.parse(data);
  const tiles = tilesToGrid(parsed.tiles, parsed.width, parsed.height);
  const entities = parsed.entities.map(mapEntity);

  const initialState: GameState = {
    width: parsed.width,
    height: parsed.height,
    tiles,
    entities,
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
  };
}

export function serializeLevel(level: LevelJson): string {
  return JSON.stringify(level, null, 2);
}

export function levelFromState(
  state: GameState,
  playerStart: Vec2,
  metadata: LevelMetadata,
): LevelJson {
  const tiles: Tile[] = [];
  for (let y = 0; y < state.height; y++) {
    const row = state.tiles[y];
    if (row === undefined) {
      throw new Error(`missing row ${y}`);
    }
    for (let x = 0; x < state.width; x++) {
      const cell = row[x];
      if (cell === undefined) {
        throw new Error(`missing cell (${x}, ${y})`);
      }
      tiles.push(cell);
    }
  }

  return {
    version: CURRENT_VERSION,
    width: state.width,
    height: state.height,
    tiles,
    entities: state.entities.map((e) => ({
      id: e.id,
      type: e.type,
      position: { x: e.position.x, y: e.position.y },
      config:
        e.type === EntityType.TikiShooter && 'facing' in e.config
          ? { facing: e.config.facing }
          : e.type === EntityType.TikiWalker && 'path' in e.config
            ? {
                path: e.config.path.map((p) => ({
                  x: p.x,
                  y: p.y,
                })),
              }
            : {},
    })),
    playerStart: { x: playerStart.x, y: playerStart.y },
    metadata,
  };
}
