import type { Direction } from '../core/types.ts';

export type MoveHandler = (direction: Direction) => void;

/** Primary action (reset after fall, dismiss win overlay). */
export type ConfirmHandler = () => void;

export interface InputController {
  attach(onMove: MoveHandler, onConfirm?: ConfirmHandler): void;
  detach(): void;
}
