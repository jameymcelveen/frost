import type { GameState } from '../core/types.ts';

export interface Renderer {
  mount(container: HTMLElement): void;
  render(state: GameState): void;
  destroy(): void;
}
