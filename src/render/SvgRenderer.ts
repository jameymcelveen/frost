import type { GameState } from '../core/types.ts';
import { EntityType } from '../core/types.ts';
import type { Renderer } from './Renderer.ts';
import { entitySvg, playerSvg, tileSize, tileSvg } from './sprites.ts';

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

    this.root.setAttribute('viewBox', `${x} ${y} ${viewW} ${viewH}`);
    this.root.setAttribute('width', String(worldW));
    this.root.setAttribute('height', String(worldH));

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
        parts.push(tileSvg(col, row, tile));
      }
    }

    for (const ent of state.entities) {
      const facing =
        ent.type === EntityType.TikiShooter && 'facing' in ent.config
          ? ent.config.facing
          : undefined;
      parts.push(
        entitySvg(ent.position.x, ent.position.y, ent.type, facing),
      );
    }

    parts.push(playerSvg(state.player.x, state.player.y));
    this.layer.innerHTML = parts.join('');
  }

  destroy(): void {
    this.root?.remove();
    this.root = null;
    this.layer = null;
  }
}
