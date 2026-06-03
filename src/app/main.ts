import { Game } from '../core/game.ts';
import { parseLevel } from '../core/level.ts';
import { GameStatus } from '../core/types.ts';
import { KeyboardInput } from '../input/KeyboardInput.ts';
import { SvgRenderer } from '../render/SvgRenderer.ts';
import level01 from '../levels/level-01.json';

function setHud(text: string): void {
  const hud = document.getElementById('hud');
  if (hud !== null) {
    hud.textContent = text;
  }
}

function setOverlay(text: string, visible: boolean): void {
  const overlay = document.getElementById('overlay');
  if (overlay === null) {
    return;
  }
  overlay.textContent = text;
  overlay.classList.toggle('visible', visible);
}

function bootstrap(): void {
  const container = document.getElementById('game-root');
  if (container === null) {
    throw new Error('#game-root not found');
  }

  const { initialState, metadata } = parseLevel(level01);
  const game = new Game(initialState);
  const renderer = new SvgRenderer();
  const input = new KeyboardInput();

  renderer.mount(container);

  const refresh = (): void => {
    const state = game.getState();
    renderer.render(state);
    setHud(
      `${metadata.name} · turn ${state.turn} · arrow keys / WASD`,
    );

    if (state.status === GameStatus.Won) {
      setOverlay('Temple cleared', true);
      return;
    }

    if (state.status === GameStatus.Lost) {
      setOverlay('Fallen', true);
      return;
    }

    setOverlay('', false);
  };

  input.attach((direction) => {
    game.step(direction);
    refresh();
  });

  refresh();
  setHud(`${metadata.name} — ${metadata.parMoves ?? '?'} par`);

  window.addEventListener('beforeunload', () => {
    input.detach();
    renderer.destroy();
  });
}

bootstrap();
