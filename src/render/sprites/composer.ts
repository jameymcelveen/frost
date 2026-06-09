import { spriteSpecSchema } from './schema.ts';
import { applyPaletteToSvg } from './paletteApply.ts';
import type { PaletteRegistry, PartRegistry } from './registry.ts';
import {
  SLOT_PAINT_ORDER,
  type Anchor,
  type Part,
  type Slot,
  type SpritePartRef,
  type SpriteSpec,
} from './types.ts';

const VIEW_BOX = { minX: -170, minY: -210, width: 280, height: 480 } as const;

const SIDED_SLOTS = new Set<Slot>(['arm', 'leg', 'eye', 'brow']);

interface ResolvedPart {
  readonly ref: SpritePartRef;
  readonly part: Part;
  readonly slotLabel: string;
}

export function composeSprite(
  spec: SpriteSpec,
  parts: PartRegistry,
  palettes: PaletteRegistry,
): string {
  const parsed = spriteSpecSchema.parse(spec);
  const palette = palettes.getPalette(parsed.palette);
  const body = resolveBodyPart(parsed, parts);

  const resolved = parsed.parts
    .map((ref) => ({
      ref,
      part: parts.getPart(ref.partId),
      slotLabel: slotGroupName(ref, parts.getPart(ref.partId)),
    }))
    .sort(
      (a, b) =>
        SLOT_PAINT_ORDER.indexOf(a.part.slot) - SLOT_PAINT_ORDER.indexOf(b.part.slot),
    );

  const groups: string[] = [];

  for (const entry of resolved) {
    const painted = applyPaletteToSvg(entry.part.svg, palette, entry.part);
    const transform = placementTransform(entry, body);
    groups.push(
      `<g data-slot="${entry.slotLabel}" transform="${transform}">${painted}</g>`,
    );
  }

  const inner = groups.join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEW_BOX.minX} ${VIEW_BOX.minY} ${VIEW_BOX.width} ${VIEW_BOX.height}" width="${VIEW_BOX.width}" height="${VIEW_BOX.height}">` +
    inner +
    '</svg>'
  );
}

/** Inner groups only (for embedding inside the board SVG). */
export function composeSpriteContent(
  spec: SpriteSpec,
  parts: PartRegistry,
  palettes: PaletteRegistry,
): string {
  const full = composeSprite(spec, parts, palettes);
  const start = full.indexOf('>', full.indexOf('<svg')) + 1;
  const end = full.lastIndexOf('</svg>');
  return full.slice(start, end);
}

function resolveBodyPart(spec: SpriteSpec, parts: PartRegistry): Part {
  const bodyRef = spec.parts.find((ref) => parts.getPart(ref.partId).slot === 'body');
  if (bodyRef === undefined) {
    throw new Error(`SpriteSpec "${spec.id}" must include a body part`);
  }
  return parts.getPart(bodyRef.partId);
}

function slotGroupName(ref: SpritePartRef, part: Part): string {
  if (ref.side === undefined) {
    return part.slot;
  }
  return `${part.slot}-${ref.side}`;
}

function placementTransform(entry: ResolvedPart, body: Part): string {
  const { ref, part } = entry;

  if (part.slot === 'body') {
    return 'translate(0,0)';
  }

  if (ref.side === 'right' && SIDED_SLOTS.has(part.slot)) {
    const bodyAnchor = getBodyAnchor(body, part.slot, 'right');
    const partAnchor = getPartAnchor(part);
    return `translate(${bodyAnchor.x},${bodyAnchor.y}) scale(-1,1) translate(${-partAnchor.x},${-partAnchor.y})`;
  }

  const bodyAnchor = getBodyAnchor(body, part.slot, ref.side ?? 'left');
  const partAnchor = getPartAnchor(part);
  return `translate(${bodyAnchor.x - partAnchor.x},${bodyAnchor.y - partAnchor.y})`;
}

function getPartAnchor(part: Part): Anchor {
  const anchor = part.anchors.find((a) => a.id === part.attachAnchorId);
  if (anchor === undefined) {
    throw new Error(
      `Part "${part.id}" missing attach anchor "${part.attachAnchorId}"`,
    );
  }
  return anchor;
}

function getBodyAnchor(
  body: Part,
  slot: Slot,
  side: 'left' | 'right',
): Anchor {
  const anchorId = bodyAnchorId(slot, side);
  const anchor = body.anchors.find((a) => a.id === anchorId);
  if (anchor === undefined) {
    throw new Error(`Body part missing anchor "${anchorId}" for slot "${slot}"`);
  }
  return anchor;
}

function bodyAnchorId(slot: Slot, side: 'left' | 'right'): string {
  switch (slot) {
    case 'crest':
      return 'crest-mount';
    case 'jaw':
      return 'jaw-hinge';
    case 'mouth':
      return 'mouth-mount';
    case 'nose':
      return 'nose-mount';
    case 'arm':
      return side === 'right' ? 'arm-socket-right' : 'arm-socket-left';
    case 'leg':
      return side === 'right' ? 'leg-socket-right' : 'leg-socket-left';
    case 'eye':
      return side === 'right' ? 'eye-mount-right' : 'eye-mount-left';
    case 'brow':
      return side === 'right' ? 'brow-mount-right' : 'brow-mount-left';
    default:
      return 'body-center';
  }
}

export function spriteViewBox(): typeof VIEW_BOX {
  return VIEW_BOX;
}
