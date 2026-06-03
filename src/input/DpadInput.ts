import type { Direction } from '../core/types.ts';
import type { ConfirmHandler, InputController, MoveHandler } from './InputController.ts';

export class DpadInput implements InputController {
  private handler: MoveHandler | null = null;
  private confirmHandler: ConfirmHandler | null = null;
  private readonly buttons = new Map<string, HTMLElement>();

  constructor(private readonly root: HTMLElement) {
    for (const btn of root.querySelectorAll<HTMLElement>('[data-dir]')) {
      const dir = btn.dataset.dir;
      if (dir !== undefined) {
        this.buttons.set(dir, btn);
      }
    }
  }

  private readonly onClick = (ev: Event): void => {
    if (this.handler === null) {
      return;
    }
    const target = ev.currentTarget;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const dir = target.dataset.dir;
    if (dir === 'confirm') {
      ev.preventDefault();
      this.confirmHandler?.();
      return;
    }

    if (
      dir === 'north' ||
      dir === 'south' ||
      dir === 'east' ||
      dir === 'west'
    ) {
      ev.preventDefault();
      this.handler(dir);
    }
  };

  attach(onMove: MoveHandler, onConfirm?: ConfirmHandler): void {
    this.handler = onMove;
    this.confirmHandler = onConfirm ?? null;
    for (const btn of this.root.querySelectorAll<HTMLElement>('[data-dir]')) {
      btn.addEventListener('click', this.onClick);
    }
  }

  detach(): void {
    for (const btn of this.root.querySelectorAll<HTMLElement>('[data-dir]')) {
      btn.removeEventListener('click', this.onClick);
    }
    this.handler = null;
    this.confirmHandler = null;
  }
}
