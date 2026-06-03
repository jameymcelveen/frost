# Frost

Turn-based grid puzzle game in the spirit of NES *Adventures of Lolo*, with an Indiana Jones temple / tiki-voodoo theme. Pure deterministic logic — no reflexes, no real-time combat.

## Stack

- TypeScript (strict), Vite, pnpm
- SVG rendering (placeholder shapes)
- [Zod](https://zod.dev) level validation
- [Vitest](https://vitest.dev) for the logic core

## Quickstart

```bash
make install
make run
```

Or with pnpm directly:

```bash
pnpm install
pnpm dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Use **arrow keys** or **WASD** to move one tile per turn. **R** resets after a fall. Default level is **Dart Gallery** (`level-02-traps.json`) demonstrating wall-dart beams and collapsing floors.

Trap authoring: see [docs/TRAPS.md](docs/TRAPS.md).

```bash
pnpm test      # unit tests (core)
pnpm build     # production bundle
```

## Mobile (Capacitor)

Native iOS/Android shells live in `mobile/` — same web build, no logic fork.

```bash
pnpm build
cd mobile && npm install && npm run sync
npx cap run ios      # or android
```

Touch: swipe on the board, optional **PAD** D-pad, tap to reset. See [mobile/README.md](mobile/README.md) and [docs/MOBILE.md](docs/MOBILE.md).

## Architecture

```
src/
  core/       # Pure game logic — no DOM, fully tested
  render/     # Renderer adapter (SVG today; React later)
  input/      # Input adapters (keyboard, swipe, D-pad via GameInput)
  app/        # Bootstrap wiring
  editor/     # Level builder (M6)
  levels/     # Versioned JSON levels
tests/core/
```

The `Game` class in `core/game.ts` is the only entry point the adapters need: `step()`, `undo()`, `reset()`, `getState()`.

## Milestones

| Milestone | Status |
|-----------|--------|
| M1 Scaffold, render level-01, move, walls, exit win | Done |
| Traps Wall-dart beams, give-way floors, switches, telegraphs | Done |
| M2 Blocks, pits, spikes, collectibles, locked exit | Partial (push/fill) |
| M3 Tiki shooter / walker, win/lose | |
| M4 Undo, reset, overlay UI | |
| M5 Camera zoom/pan, swipe input | |
| M6 Level editor | |

## Level format

Versioned JSON (`src/levels/*.json`): `width`, `height`, flat `tiles[]`, `entities[]`, optional `traps[]`, `switches[]`, `markers[]`, `playerStart`, `metadata`. Validated by `src/core/level.ts`. Trap schema: [docs/TRAPS.md](docs/TRAPS.md).

## License

Private / unlicensed unless you add one.
