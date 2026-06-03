import { directionFromKey } from '../core/game.ts';
import type {
  ConfirmHandler,
  InputController,
  MoveHandler,
} from './InputController.ts';

export class KeyboardInput implements InputController {
  private handler: MoveHandler | null = null;
  private confirmHandler: ConfirmHandler | null = null;

  private readonly onKeyDown = (ev: KeyboardEvent): void => {
    if (ev.key === 'r' || ev.key === 'R' || ev.key === 'Enter' || ev.key === ' ') {
      if (this.confirmHandler !== null) {
        ev.preventDefault();
        this.confirmHandler();
      }
      return;
    }

    if (this.handler === null) {
      return;
    }

    const dir = directionFromKey(ev.key);
    if (dir === null) {
      return;
    }

    ev.preventDefault();
    this.handler(dir);
  };

  attach(onMove: MoveHandler, onConfirm?: ConfirmHandler): void {
    this.handler = onMove;
    this.confirmHandler = onConfirm ?? null;
    window.addEventListener('keydown', this.onKeyDown);
  }

  detach(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    this.handler = null;
    this.confirmHandler = null;
  }
}
