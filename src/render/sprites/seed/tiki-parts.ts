import type { Part } from '../types.ts';

/** Body-center local space. Origin at body-center (assembled 340, 266). */
export const tikiParts: readonly Part[] = [
  {
    id: 'tiki-body',
    slot: 'body',
    attachAnchorId: 'body-center',
    paletteSlots: ['wood', 'accent', 'outline'],
    anchors: [
      { id: 'body-center', x: 0, y: 0 },
      { id: 'crest-mount', x: 0, y: -146 },
      { id: 'arm-socket-left', x: -84, y: -8 },
      { id: 'arm-socket-right', x: 84, y: -8 },
      { id: 'leg-socket-left', x: -29, y: 136 },
      { id: 'leg-socket-right', x: 29, y: 136 },
      { id: 'jaw-hinge', x: 0, y: 94 },
      { id: 'mouth-mount', x: 0, y: 48 },
      { id: 'nose-mount', x: 0, y: -14 },
      { id: 'eye-mount-left', x: -35, y: -54 },
      { id: 'eye-mount-right', x: 35, y: -54 },
      { id: 'brow-mount-left', x: -58, y: -72 },
      { id: 'brow-mount-right', x: 58, y: -72 },
    ],
    svg: `<rect x="-84" y="-146" width="168" height="292" rx="30" fill="{{wood}}" stroke="{{outline}}" stroke-width="6"/>
<rect x="-76" y="110" width="152" height="28" rx="11" fill="{{accent}}" stroke="{{outline}}" stroke-width="5"/>`,
  },
  {
    id: 'tiki-crest',
    slot: 'crest',
    attachAnchorId: 'crest-base',
    paletteSlots: ['accent', 'accent2', 'accent3', 'outline'],
    anchors: [{ id: 'crest-base', x: 0, y: 6 }],
    svg: `<path d="M-90 6 Q-90 -50 0 -54 Q90 -50 90 6 Z" fill="{{accent}}" stroke="{{outline}}" stroke-width="6"/>
<path d="M-80 -8 Q0 -22 80 -8 L80 6 Q0 -6 -80 6 Z" fill="{{accent2}}" stroke="{{outline}}" stroke-width="3"/>
<circle cx="0" cy="-50" r="10" fill="{{accent3}}" stroke="{{outline}}" stroke-width="4"/>`,
  },
  {
    id: 'tiki-brow',
    slot: 'brow',
    attachAnchorId: 'brow-center',
    paletteSlots: ['accentDark', 'outline'],
    anchors: [{ id: 'brow-center', x: 0, y: 0 }],
    svg: `<polygon points="-27,-18 23,0 17,16 -33,-2" fill="{{accentDark}}" stroke="{{outline}}" stroke-width="4"/>`,
  },
  {
    id: 'tiki-eye',
    slot: 'eye',
    attachAnchorId: 'eye-center',
    paletteSlots: ['void', 'glow', 'outline'],
    anchors: [{ id: 'eye-center', x: 0, y: 0 }],
    svg: `<path d="M-21 -10 Q-1 -16 17 -2 Q1 14 -17 8 Z" fill="{{void}}" stroke="{{outline}}" stroke-width="3"/>
<circle cx="-2" cy="0" r="4.5" fill="{{glow}}"/>`,
  },
  {
    id: 'tiki-nose',
    slot: 'nose',
    attachAnchorId: 'nose-root',
    paletteSlots: ['woodLight', 'outline'],
    anchors: [{ id: 'nose-root', x: 0, y: 0 }],
    svg: `<path d="M0 0 L-20 40 Q-24 78 0 88 Q24 78 20 40 Z" fill="{{woodLight}}" stroke="{{outline}}" stroke-width="5"/>`,
  },
  {
    id: 'tiki-mouth',
    slot: 'mouth',
    attachAnchorId: 'mouth-mount',
    paletteSlots: ['accent2', 'teeth', 'outline'],
    anchors: [{ id: 'mouth-mount', x: 0, y: 0 }],
    svg: `<rect x="-58" y="-34" width="116" height="54" rx="18" fill="{{accent2}}" stroke="{{outline}}" stroke-width="6"/>
<rect x="-50" y="-30" width="100" height="18" rx="4" fill="{{teeth}}" stroke="{{outline}}" stroke-width="3"/>`,
  },
  {
    id: 'tiki-jaw',
    slot: 'jaw',
    attachAnchorId: 'jaw-hinge',
    paletteSlots: ['teeth', 'outline'],
    anchors: [{ id: 'jaw-hinge', x: 0, y: 0 }],
    svg: `<rect x="-50" y="0" width="100" height="16" rx="4" fill="{{teeth}}" stroke="{{outline}}" stroke-width="3"/>`,
  },
  {
    id: 'tiki-arm',
    slot: 'arm',
    attachAnchorId: 'arm-root',
    paletteSlots: ['wood', 'woodLight', 'outline'],
    anchors: [{ id: 'arm-root', x: 0, y: 0 }],
    svg: `<path d="M0 0 Q-60 10 -62 82" fill="none" stroke="{{outline}}" stroke-width="36" stroke-linecap="round"/>
<path d="M0 0 Q-60 10 -62 82" fill="none" stroke="{{wood}}" stroke-width="26" stroke-linecap="round"/>
<circle cx="-64" cy="90" r="22" fill="{{woodLight}}" stroke="{{outline}}" stroke-width="5"/>`,
  },
  {
    id: 'tiki-leg',
    slot: 'leg',
    attachAnchorId: 'leg-root',
    paletteSlots: ['wood', 'woodLight', 'outline'],
    anchors: [{ id: 'leg-root', x: 15, y: 0 }],
    svg: `<g stroke="{{outline}}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
<rect x="0" y="0" width="30" height="96" rx="13" fill="{{wood}}"/>
<rect x="-24" y="82" width="60" height="28" rx="13" fill="{{woodLight}}"/>
</g>`,
  },
];
