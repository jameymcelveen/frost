/** Cardinal directions for movement and entity facing. */
export type Direction = 'north' | 'south' | 'east' | 'west';

export const DIRECTIONS: readonly Direction[] = [
  'north',
  'south',
  'east',
  'west',
] as const;

export const TileType = {
  Floor: 'floor',
  Wall: 'wall',
  Exit: 'exit',
  Pit: 'pit',
  Spikes: 'spikes',
  Collectible: 'collectible',
} as const;

export type TileType = (typeof TileType)[keyof typeof TileType];

export const EntityType = {
  Block: 'block',
  TikiShooter: 'tiki-shooter',
  TikiWalker: 'tiki-walker',
} as const;

export type EntityType = (typeof EntityType)[keyof typeof EntityType];

export const GameStatus = {
  Playing: 'playing',
  Won: 'won',
  Lost: 'lost',
} as const;

export type GameStatus = (typeof GameStatus)[keyof typeof GameStatus];

export interface Vec2 {
  readonly x: number;
  readonly y: number;
}

export interface TikiShooterConfig {
  readonly facing: Direction;
}

export interface TikiWalkerConfig {
  /** Patrol waypoints in order; walker loops this path. */
  readonly path: readonly Vec2[];
}

export type EntityConfig =
  | Record<string, never>
  | TikiShooterConfig
  | TikiWalkerConfig;

export interface Entity {
  readonly id: string;
  readonly type: EntityType;
  readonly position: Vec2;
  readonly config: EntityConfig;
}

export interface LevelMetadata {
  readonly name: string;
  readonly author?: string;
  readonly parMoves?: number;
}

export interface GameState {
  readonly width: number;
  readonly height: number;
  readonly tiles: readonly (readonly TileType[])[];
  readonly entities: readonly Entity[];
  readonly player: Vec2;
  readonly status: GameStatus;
  /** Collectibles remaining on the grid (tile + not yet picked up). */
  readonly collectiblesRemaining: number;
  readonly turn: number;
  readonly levelName: string;
}

export type PlayerInput = Direction | null;
