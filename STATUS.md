# Frost — project status

Turn-based temple puzzle (Lolo-style). Deterministic TypeScript core; SVG web client; Capacitor mobile shell.

## Run

| Target | Command |
|--------|---------|
| Web dev | `make run` → http://localhost:5173 |
| Web build | `pnpm build` |
| Tests | `pnpm test` (55 passing) |
| iOS / Android | `cd mobile && npm run sync && npx cap run ios` (or `android`) |

## Shipped

- **M1** — Level render, movement, walls, exit win (`level-01`)
- **Traps** — Dart line-of-fire, give-way floors, switches, telegraphs (`level-02-traps`, [docs/TRAPS.md](docs/TRAPS.md))
- **Mobile** — Capacitor `mobile/`, swipe + D-pad + haptics ([mobile/README.md](mobile/README.md))
- **Sprite parts (M1)** — Composable `SpriteSpec` rig in `src/render/sprites/`; tiki enemy wired to `TikiWalker`

## Next (milestones)

M2 collectibles / locked exit · M3 enemies · M4 undo · M5 camera · M6 level editor
