import type { Direction } from '../core/types.ts';

export type MoveHandler = (direction: Direction) => void;

export interface InputController {
  attach(onMove: MoveHandler): void;
  detach(): void;
}
