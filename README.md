# Frost

Turn-based grid puzzle game in the spirit of NES *Adventures of Lolo*, with an Indiana Jones temple / tiki-voodoo theme. Pure deterministic logic — no reflexes, no real-time combat.

## Stack

- TypeScript (strict), Vite, pnpm
- SVG rendering (placeholder shapes)
- [Zod](https://zod.dev) level validation
- [Vitest](https://vitest.dev) for the logic core

## Quickstart

```bash
pnpm install
pnpm dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Use **arrow keys** or **WASD** to move one tile per turn. Reach the **EXIT** tile to clear the level (M1: collectibles are decorative only).

```bash
pnpm test      # unit tests (core)
pnpm build     # production bundle
```

## Architecture

```
src/
  core/       # Pure game logic — no DOM, fully tested
  render/     # Renderer adapter (SVG today; React later)
  input/      # Input adapter (keyboard; touch stub)
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
| M2 Blocks, pits, spikes, collectibles, locked exit | |
| M3 Tiki shooter / walker, win/lose | |
| M4 Undo, reset, overlay UI | |
| M5 Camera zoom/pan, swipe input | |
| M6 Level editor | |

## Level format

Versioned JSON (`src/levels/*.json`): `width`, `height`, flat `tiles[]`, `entities[]`, `playerStart`, `metadata`. Validated by `src/core/level.ts`.

## License

Private / unlicensed unless you add one.
