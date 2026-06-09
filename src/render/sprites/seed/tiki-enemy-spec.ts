import type { SpriteSpec } from '../types.ts';

export const tikiEnemySpec: SpriteSpec = {
  id: 'tiki-enemy',
  palette: 'tiki-wood',
  parts: [
    { partId: 'tiki-body' },
    { partId: 'tiki-leg', side: 'left' },
    { partId: 'tiki-leg', side: 'right' },
    { partId: 'tiki-arm', side: 'left' },
    { partId: 'tiki-arm', side: 'right' },
    { partId: 'tiki-jaw' },
    { partId: 'tiki-mouth' },
    { partId: 'tiki-nose' },
    { partId: 'tiki-eye', side: 'left' },
    { partId: 'tiki-eye', side: 'right' },
    { partId: 'tiki-brow', side: 'left' },
    { partId: 'tiki-brow', side: 'right' },
    { partId: 'tiki-crest' },
  ],
};
