import type { GameState } from '../core/types.ts';
import { EntityType } from '../core/types.ts';
import { TelegraphKind } from '../core/traps/types.ts';
import type { Renderer } from './Renderer.ts';
import { drawEntity, drawPlayer, drawTile } from './manifest.ts';
import { drawSprite } from './manifest.ts';
import { dartBeamSvg, dartEmitterOverlays, switchOverlay } from './trapOverlay.ts';
import { tileSize } from './sprites.ts';

export interface Camera {
  readonly x: number;
  readonly y: number;
  readonly zoom: number;
}

const DEFAULT_CAMERA: Camera = { x: 0, y: 0, zoom: 1 };

export class SvgRenderer implements Renderer {
  private root: SVGSVGElement | null = null;
  private layer: SVGGElement | null = null;
  private camera: Camera = DEFAULT_CAMERA;

  mount(container: HTMLElement): void {
    this.root = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.root.setAttribute('role', 'img');
    this.root.setAttribute('aria-label', 'Frost puzzle board');
    this.layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.root.appendChild(this.layer);
    container.appendChild(this.root);
  }

  setCamera(camera: Camera): void {
    this.camera = camera;
  }

  render(state: GameState): void {
    if (this.root === null || this.layer === null) {
      return;
    }

    const cell = tileSize();
    const worldW = state.width * cell;
    const worldH = state.height * cell;
    const { x, y, zoom } = this.camera;
    const viewW = worldW / zoom;
    const viewH = worldH / zoom;
    const pulse = state.turn % 2 === 0;

    this.root.setAttribute('viewBox', `${x} ${y} ${viewW} ${viewH}`);
    this.root.setAttribute('width', String(worldW));
    this.root.setAttribute('height', String(worldH));

    const trembleIds = new Set(
      state.telegraphs
        .filter((t) => t.kind === TelegraphKind.Tremble)
        .map((t) => t.trapId),
    );

    const parts: string[] = [];

    for (let row = 0; row < state.height; row++) {
      const tiles = state.tiles[row];
      if (tiles === undefined) {
        continue;
      }
      for (let col = 0; col < state.width; col++) {
        const tile = tiles[col];
        if (tile === undefined) {
          continue;
        }
        const trap = state.traps.find(
          (t) =>
            t.position.x === col &&
            t.position.y === row &&
            trembleIds.has(t.id),
        );
        parts.push(
          drawTile(col, row, tile, {
            tremble: trap !== undefined,
          }),
        );
      }
    }

    parts.push(dartBeamSvg(state, pulse));
    parts.push(dartEmitterOverlays(state));
    parts.push(switchOverlay(state));

    for (const marker of state.markers) {
      parts.push(
        drawSprite(marker.spriteId, marker.position.x, marker.position.y, {
          eyeOpen: marker.eyeOpen,
        }),
      );
    }

    for (const ent of state.entities) {
      const facing =
        ent.type === EntityType.TikiShooter && 'facing' in ent.config
          ? ent.config.facing
          : undefined;
      parts.push(drawEntity(ent.type, ent.position.x, ent.position.y, { facing }));
    }

    parts.push(drawPlayer(state.player.x, state.player.y));
    this.layer.innerHTML = parts.join('');
  }

  destroy(): void {
    this.root?.remove();
    this.root = null;
    this.layer = null;
  }
}
