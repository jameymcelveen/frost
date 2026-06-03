import { Game } from '../core/game.ts';
import { parseLevel } from '../core/level.ts';
import { GameStatus } from '../core/types.ts';
import { GameInput } from '../input/GameInput.ts';
import { SvgRenderer } from '../render/SvgRenderer.ts';
import { hapticImpact } from './haptics.ts';
import { initNativeShell } from './native.ts';
import level02 from '../levels/level-02-traps.json';

function setHud(text: string): void {
  const hud = document.getElementById('hud-text');
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
  overlay.classList.toggle('overlay--actionable', visible);
}

function bootstrap(): void {
  void initNativeShell();

  const container = document.getElementById('game-root');
  const dpad = document.getElementById('dpad');
  if (container === null || dpad === null) {
    throw new Error('#game-root or #dpad not found');
  }

  const { initialState, metadata, fairnessWarnings } = parseLevel(level02);
  for (const w of fairnessWarnings) {
    console.warn(`[frost] trap fairness: ${w}`);
  }

  const game = new Game(initialState);
  const renderer = new SvgRenderer();
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const input = new GameInput({
    swipeTarget: container,
    dpadRoot: dpad,
    enableDpad: coarsePointer,
  });

  renderer.mount(container);

  const resetGame = (): void => {
    game.reset();
    refresh();
  };

  const refresh = (): void => {
    const state = game.getState();
    renderer.render(state);
    const touchHint = coarsePointer ? 'swipe / D-pad' : 'arrows / WASD';
    setHud(
      `${metadata.name} · turn ${state.turn} · ${touchHint} · tap/● reset`,
    );

    if (state.status === GameStatus.Won) {
      setOverlay('Temple cleared — tap to play again', true);
      return;
    }

    if (state.status === GameStatus.Lost) {
      setOverlay('Fallen — tap to retry', true);
      return;
    }

    setOverlay('', false);
  };

  const onMove = (direction: import('../core/types.ts').Direction): void => {
    const before = game.getState();
    game.step(direction);
    const after = game.getState();

    if (
      before.status === GameStatus.Playing &&
      after.status === GameStatus.Lost
    ) {
      void hapticImpact('heavy');
    } else if (
      before.status === GameStatus.Playing &&
      after.status === GameStatus.Playing &&
      before.player.x === after.player.x &&
      before.player.y === after.player.y
    ) {
      void hapticImpact('light');
    }

    refresh();
  };

  input.attach(onMove, resetGame);

  const overlay = document.getElementById('overlay');
  overlay?.addEventListener('click', () => {
    if (game.getState().status !== GameStatus.Playing) {
      resetGame();
    }
  });

  const dpadToggle = document.getElementById('dpad-toggle');
  dpadToggle?.addEventListener('click', () => {
    const hidden = dpad.classList.contains('hidden');
    input.setDpadVisible(hidden);
    dpadToggle.setAttribute('aria-pressed', hidden ? 'true' : 'false');
  });

  refresh();
  setHud(`${metadata.name} — ${metadata.parMoves ?? '?'} par`);

  window.addEventListener('beforeunload', () => {
    input.detach();
    renderer.destroy();
  });
}

bootstrap();
