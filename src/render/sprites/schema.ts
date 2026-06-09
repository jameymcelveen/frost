import { z } from 'zod';

const slotSchema = z.enum([
  'body',
  'crest',
  'brow',
  'eye',
  'nose',
  'mouth',
  'jaw',
  'arm',
  'leg',
]);

const anchorSchema = z.object({
  id: z.string().min(1),
  x: z.number(),
  y: z.number(),
});

export const partSchema = z.object({
  id: z.string().min(1),
  slot: slotSchema,
  svg: z.string().min(1),
  paletteSlots: z.array(z.string().min(1)).min(1),
  anchors: z.array(anchorSchema).min(1),
  attachAnchorId: z.string().min(1),
});

export const paletteSchema = z.object({
  id: z.string().min(1),
  colors: z.record(z.string().min(1), z.string().regex(/^#[0-9a-fA-F]{6}$/)),
});

export const spritePartRefSchema = z.object({
  partId: z.string().min(1),
  side: z.enum(['left', 'right']).optional(),
});

export const spriteSpecSchema = z.object({
  id: z.string().min(1),
  parts: z.array(spritePartRefSchema).min(1),
  palette: z.string().min(1),
});

export type PartJson = z.infer<typeof partSchema>;
export type PaletteJson = z.infer<typeof paletteSchema>;
export type SpriteSpecJson = z.infer<typeof spriteSpecSchema>;
