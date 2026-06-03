import type { Direction } from '../core/types.ts';
import type { InputController, MoveHandler } from './InputController.ts';

/** Swipe-to-move stub for M5; no-op attach for M1. */
export class TouchInput implements InputController {
  attach(_onMove: MoveHandler): void {
    // M5: pointer events + swipe threshold
  }

  detach(): void {
    // no-op
  }
}

export function directionFromSwipe(
  dx: number,
  dy: number,
): Direction | null {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ax < 24 && ay < 24) {
    return null;
  }
  if (ax >= ay) {
    return dx > 0 ? 'east' : 'west';
  }
  return dy > 0 ? 'south' : 'north';
}
