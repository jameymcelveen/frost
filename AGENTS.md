# AGENTS.md — Frost

Guidance for AI coding agents (Jules and others) working in this repository. Read this before planning any change.

## What Frost is

A turn-based grid puzzle game in the spirit of NES _Adventures of Lolo_, themed as an Indiana Jones temple with tiki/voodoo enemies. Pure deterministic logic: no reflexes, no real-time combat. One tile of movement per turn, and outcomes are fully determined by player input plus current state.

## Stack

- TypeScript (strict), Vite, pnpm
- SVG rendering, placeholder shapes only (no art assets)
- Zod for level validation
- Vitest for the logic core
- Capacitor mobile shell in `mobile/` (wraps the same web build, no logic fork)

## Commands

Use pnpm. The `Makefile` just wraps these.

- Install: `pnpm install`
- Test: `pnpm test` (runs `vitest run`)
- Watch tests: `pnpm test:watch`
- Dev server: `pnpm dev` (http://localhost:5173)
- Build: `pnpm build`

Always run `pnpm test` and make it green before finishing a task. The suite is currently passing (around 25 tests). Do not reduce that count or skip tests to get green.

## Architecture and boundaries (read this twice)

Strict separation of concerns. Most mistakes in this repo come from crossing these lines.

```
src/
  core/    Pure game logic. NO DOM, NO browser/Capacitor APIs. Fully unit-tested.
  render/  Renderer adapter behind the Renderer interface (SVG today, React later).
  input/   Input adapters behind GameInput (keyboard, touch/swipe, D-pad).
  app/     Bootstrap that wires core + render + input together.
  editor/  Level builder (M6, not yet built).
  levels/  Versioned JSON levels, validated by zod.
tests/     Vitest specs (tests/core, tests/input).
```

Rules:

- `core/` depends on nothing outside `core/`. Never import the DOM, `window`, `document`, Capacitor, or any renderer/input module into core. Note: `tsconfig.json` includes the `DOM` lib for the adapters, so the compiler will NOT catch DOM usage in core. Keep it out by discipline.
- The only entry point adapters need is the `Game` class in `core/game.ts`: `step(input)`, `undo()`, `reset()`, `getState()`. Do not reach around it into internal core modules from an adapter.
- `GameState` (in `core/types.ts`) is deeply `readonly` and treated as immutable. Turn resolution (`core/rules.ts` `resolveTurn`) returns a new state. Never mutate state in place. `Game` clones on every `getState`/`step`.
- Traps are extensible through the registry in `core/traps/registry.ts`. Add a trap by registering its type there and implementing a module alongside `beam.ts`, `dart.ts`, `giveway.ts`, `telegraph.ts`. Do not branch trap logic into `rules.ts`.
- Levels are JSON validated by zod in `core/level.ts`. Any new level field must flow through the zod schema, and changes must keep the existing levels (`src/levels/level-01.json`, `src/levels/level-02-traps.json`) loading and passing.

## Code conventions

- TypeScript strict, plus `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`, `noFallthroughCasesInSwitch`. Do not weaken `tsconfig` to make code compile.
- 2-space indentation.
- Prefer early returns over nested conditionals.
- Composition over inheritance.
- Favor `readonly` types and immutable updates, consistent with `GameState`.
- Path alias `@/*` maps to `src/*`.
- Do not use em dashes in comments or docs. Use commas, colons, periods, or parentheses.

## Testing expectations

- Vitest. The core lives or dies by its tests. New core behavior needs unit tests in `tests/core/`.
- Run `pnpm test` before finishing. All tests must pass.
- For a new mechanic, add a deterministic test that asserts the resulting `GameState` for a known input sequence.

## Current status and milestones

Shipped: M1 (level render, movement, walls block, exit wins), Traps (dart line-of-fire, give-way floors, switches, telegraphs), Mobile (Capacitor iOS/Android).

Planned. Do NOT implement speculatively unless the task explicitly asks for it: M2 collectibles / locked exit, M3 enemies, M4 undo, M5 camera, M6 level editor.

Intentional stubs (these are not bugs, do not "fix" them unprompted):

- `Game.undo()` returns the current state unchanged. Real undo is M4.
- `src/editor/` is a placeholder for M6.

## Do not

- Add DOM or platform APIs to `core/`.
- Implement future milestones speculatively.
- Add binary art assets. SVG placeholders only.
- Fork game logic into `mobile/`. Mobile consumes the same web build.
- Weaken strictness settings or delete/skip tests to reach green.

## Definition of done

A scoped diff, `pnpm test` green, existing levels still load, and no new type errors. Open the PR against `main`.
