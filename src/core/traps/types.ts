import type { Direction, Entity, GameStatus, TileType, Vec2 } from '../types.ts';

/** Slice of game state trap handlers may read (keeps traps free of circular imports). */
export interface TrapGameView {
  readonly width: number;
  readonly height: number;
  readonly tiles: readonly (readonly TileType[])[];
  readonly entities: readonly Entity[];
  readonly traps: readonly Trap[];
  readonly switches: readonly SwitchState[];
  readonly markers: readonly MarkerState[];
  readonly collapsedTrapIds: readonly string[];
  readonly armedGivewayIds: readonly string[];
  readonly player: Vec2;
  readonly status: GameStatus;
  readonly turn: number;
}

export const TrapType = {
  Dart: 'dart',
  Giveway: 'giveway',
} as const;

export type TrapType = (typeof TrapType)[keyof typeof TrapType];

export const DartTelegraph = {
  Beam: 'beam',
} as const;

export type DartTelegraph = (typeof DartTelegraph)[keyof typeof DartTelegraph];

export const GivewayTelegraph = {
  Tremble: 'tremble',
  Statue: 'statue',
} as const;

export type GivewayTelegraph =
  (typeof GivewayTelegraph)[keyof typeof GivewayTelegraph];

export const CollapseMode = {
  AfterLeave: 'afterLeave',
  Instant: 'instant',
} as const;

export type CollapseMode = (typeof CollapseMode)[keyof typeof CollapseMode];

export interface DartTrapConfig {
  readonly dir: Direction;
  readonly switchId?: string;
  readonly telegraph: typeof DartTelegraph.Beam;
}

export interface GivewayTrapConfig {
  readonly collapseMode: CollapseMode;
  readonly telegraph: GivewayTelegraph;
  readonly linkedTileId?: string;
}

export interface Trap {
  readonly id: string;
  readonly type: TrapType;
  readonly position: Vec2;
  readonly config: DartTrapConfig | GivewayTrapConfig;
}

export interface SwitchDef {
  readonly id: string;
  readonly position: Vec2;
}

export interface SwitchState extends SwitchDef {
  /** When true, linked dart emitters are disabled (beam cold). */
  readonly engaged: boolean;
}

export interface MarkerDef {
  readonly id: string;
  readonly position: Vec2;
  readonly spriteId: string;
}

export interface MarkerState extends MarkerDef {
  readonly eyeOpen: boolean;
}

export const TelegraphKind = {
  Beam: 'beam',
  Tremble: 'tremble',
  StatueEye: 'statue-eye',
} as const;

export type TelegraphKind = (typeof TelegraphKind)[keyof typeof TelegraphKind];

export interface ActiveTelegraph {
  readonly trapId: string;
  readonly kind: TelegraphKind;
  readonly markerId?: string;
}

export type EnterAttemptResult =
  | { readonly kind: 'allow' }
  | { readonly kind: 'block' }
  | { readonly kind: 'hit' };

export interface TrapContext {
  readonly state: TrapGameView;
  readonly trap: Trap;
  readonly targetPos: Vec2;
  readonly playerFrom: Vec2;
}

export interface AfterMoveContext {
  readonly state: TrapGameView;
  readonly direction: Direction;
  readonly previousPlayer: Vec2;
}

export interface TrapHandler {
  readonly type: TrapType;
  readonly requiresTelegraph: boolean;
  onEnterAttempt(ctx: TrapContext): EnterAttemptResult;
  onAfterPlayerMove?(ctx: AfterMoveContext): TrapGameView;
  telegraphKind(trap: Trap): TelegraphKind | null;
}
