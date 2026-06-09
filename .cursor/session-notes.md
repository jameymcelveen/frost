# Session notes

## Sprite parts system (M1)

- Location: `src/render/sprites/` (render only, no `core/` imports).
- Registries: `PartRegistry`, `PaletteRegistry` (plugin surface, like trap registry).
- Composer: `composeSprite(spec, parts, palettes)` emits one SVG with `<g data-slot="...">` per part.
- Seed: 9 tiki parts + `tiki-wood` palette + `tikiEnemySpec`.
- Wired: `TikiWalker` entities render via composed sprite in `manifest.ts`.
- Tests: `tests/render/sprites.test.ts` (zod reject, determinism, slot groups, palette apply).

## Jules unit tests (merged)

- `tests/core/grid.test.ts`: vec, bounds, offset, index helpers.
- `tests/core/movement.test.ts`: push, pits, dart beam blocking, switches, applyHit.

## Next

Sprite animation/rigs (anchors in place), player spec, tile parts, M2+ game milestones per `AGENTS.md`.
