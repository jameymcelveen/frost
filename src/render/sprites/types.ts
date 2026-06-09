/** Named attachment point on a sprite rig. */
export type Slot =
  | 'body'
  | 'crest'
  | 'brow'
  | 'eye'
  | 'nose'
  | 'mouth'
  | 'jaw'
  | 'arm'
  | 'leg';

export interface Anchor {
  readonly id: string;
  readonly x: number;
  readonly y: number;
}

export interface Part {
  readonly id: string;
  readonly slot: Slot;
  /** SVG fragment in part-local coordinates (no wrapper). */
  readonly svg: string;
  readonly paletteSlots: readonly string[];
  readonly anchors: readonly Anchor[];
  /** Anchor on this part that attaches to the body rig. */
  readonly attachAnchorId: string;
}

export interface Palette {
  readonly id: string;
  readonly colors: Readonly<Record<string, string>>;
}

export interface SpritePartRef {
  readonly partId: string;
  readonly side?: 'left' | 'right';
}

export interface SpriteSpec {
  readonly id: string;
  readonly parts: readonly SpritePartRef[];
  readonly palette: string;
}

/** Paint order for stacked slots (back to front). */
export const SLOT_PAINT_ORDER: readonly Slot[] = [
  'leg',
  'arm',
  'body',
  'jaw',
  'mouth',
  'nose',
  'eye',
  'brow',
  'crest',
] as const;
