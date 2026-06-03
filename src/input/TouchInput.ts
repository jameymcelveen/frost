import type { Direction } from '../core/types.ts';
import type { ConfirmHandler, InputController, MoveHandler } from './InputController.ts';

const SWIPE_THRESHOLD_PX = 28;
const TAP_MAX_MS = 280;
const TAP_MAX_MOVE_PX = 12;

export class TouchInput implements InputController {
  private handler: MoveHandler | null = null;
  private confirmHandler: ConfirmHandler | null = null;
  private startX = 0;
  private startY = 0;
  private startTime = 0;
  private activePointerId: number | null = null;

  constructor(private readonly target: HTMLElement) {}

  private readonly onPointerDown = (ev: PointerEvent): void => {
    if (this.handler === null || ev.isPrimary === false) {
      return;
    }
    this.activePointerId = ev.pointerId;
    this.startX = ev.clientX;
    this.startY = ev.clientY;
    this.startTime = performance.now();
    this.target.setPointerCapture(ev.pointerId);
    ev.preventDefault();
  };

  private readonly onPointerUp = (ev: PointerEvent): void => {
    if (
      this.handler === null ||
      this.activePointerId === null ||
      ev.pointerId !== this.activePointerId
    ) {
      return;
    }

    const dx = ev.clientX - this.startX;
    const dy = ev.clientY - this.startY;
    const elapsed = performance.now() - this.startTime;
    this.activePointerId = null;

    try {
      this.target.releasePointerCapture(ev.pointerId);
    } catch {
      // capture may already be released
    }

    const dir = directionFromSwipe(dx, dy, SWIPE_THRESHOLD_PX);
    if (dir !== null) {
      ev.preventDefault();
      this.handler(dir);
      return;
    }

    if (
      isTap(dx, dy, elapsed, TAP_MAX_MS, TAP_MAX_MOVE_PX) &&
      this.confirmHandler !== null
    ) {
      ev.preventDefault();
      this.confirmHandler();
    }
  };

  private readonly onPointerCancel = (ev: PointerEvent): void => {
    if (ev.pointerId === this.activePointerId) {
      this.activePointerId = null;
    }
  };

  private readonly preventTouchScroll = (ev: TouchEvent): void => {
    if (this.activePointerId !== null) {
      ev.preventDefault();
    }
  };

  attach(onMove: MoveHandler, onConfirm?: ConfirmHandler): void {
    this.handler = onMove;
    this.confirmHandler = onConfirm ?? null;
    this.target.addEventListener('pointerdown', this.onPointerDown);
    this.target.addEventListener('pointerup', this.onPointerUp);
    this.target.addEventListener('pointercancel', this.onPointerCancel);
    this.target.addEventListener('touchmove', this.preventTouchScroll, {
      passive: false,
    });
  }

  detach(): void {
    this.target.removeEventListener('pointerdown', this.onPointerDown);
    this.target.removeEventListener('pointerup', this.onPointerUp);
    this.target.removeEventListener('pointercancel', this.onPointerCancel);
    this.target.removeEventListener('touchmove', this.preventTouchScroll);
    this.handler = null;
    this.confirmHandler = null;
    this.activePointerId = null;
  }
}

export function directionFromSwipe(
  dx: number,
  dy: number,
  threshold = SWIPE_THRESHOLD_PX,
): Direction | null {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ax < threshold && ay < threshold) {
    return null;
  }
  if (ax >= ay) {
    return dx > 0 ? 'east' : 'west';
  }
  return dy > 0 ? 'south' : 'north';
}

function isTap(
  dx: number,
  dy: number,
  elapsedMs: number,
  maxMs: number,
  maxMove: number,
): boolean {
  return (
    elapsedMs <= maxMs &&
    Math.abs(dx) <= maxMove &&
    Math.abs(dy) <= maxMove
  );
}
