import type { ConfirmHandler, InputController, MoveHandler } from './InputController.ts';
import { DpadInput } from './DpadInput.ts';
import { KeyboardInput } from './KeyboardInput.ts';
import { TouchInput } from './TouchInput.ts';

export interface GameInputOptions {
  readonly swipeTarget: HTMLElement;
  readonly dpadRoot: HTMLElement;
  readonly enableDpad?: boolean;
}

/**
 * Routes keyboard, swipe, D-pad, and tap through one move/confirm contract.
 */
export class GameInput {
  private readonly controllers: InputController[];
  private readonly dpadRoot: HTMLElement;

  constructor(options: GameInputOptions) {
    this.dpadRoot = options.dpadRoot;
    this.controllers = [
      new KeyboardInput(),
      new TouchInput(options.swipeTarget),
      new DpadInput(options.dpadRoot),
    ];
    if (options.enableDpad !== false) {
      this.dpadRoot.classList.remove('hidden');
    }
  }

  attach(onMove: MoveHandler, onConfirm?: ConfirmHandler): void {
    for (const c of this.controllers) {
      c.attach(onMove, onConfirm);
    }
  }

  detach(): void {
    for (const c of this.controllers) {
      c.detach();
    }
  }

  setDpadVisible(visible: boolean): void {
    this.dpadRoot.classList.toggle('hidden', !visible);
  }
}
