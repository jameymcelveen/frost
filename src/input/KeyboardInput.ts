import { directionFromKey } from '../core/game.ts';
import type { InputController, MoveHandler } from './InputController.ts';

export class KeyboardInput implements InputController {
  private handler: MoveHandler | null = null;
  private readonly onKeyDown = (ev: KeyboardEvent): void => {
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

  attach(onMove: MoveHandler): void {
    this.handler = onMove;
    window.addEventListener('keydown', this.onKeyDown);
  }

  detach(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    this.handler = null;
  }
}
