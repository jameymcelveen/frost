# Trap data schema

Traps are **data-driven** and resolved through a **registry** (`src/core/traps/`). Movement code does not hard-code per-trap behavior.

## Level JSON (version 2)

Add optional arrays alongside `tiles` / `entities`:

| Field | Description |
|-------|-------------|
| `traps` | Trap instances (`id`, `type`, `position`, `config`) |
| `switches` | Pressure plates / levers (`id`, `position`, `initiallyEngaged`) |
| `markers` | Linked environmental art (`id`, `position`, `spriteId`) |

Version `1` levels omit these arrays (treated as empty).

## Trap types

### `dart` — wall emitter, line of fire

```json
{
  "id": "dart-1",
  "type": "dart",
  "position": { "x": 9, "y": 3 },
  "config": {
    "dir": "west",
    "switchId": "sw-1",
    "telegraph": "beam"
  }
}
```

| Config key | Required | Meaning |
|------------|----------|---------|
| `dir` | yes | `north` \| `south` \| `east` \| `west` — beam direction |
| `switchId` | no | When linked switch is **engaged**, emitter is off (beam cold) |
| `telegraph` | yes | Must be `"beam"` (visible line + dart glyphs) |

**Beam rules:** Ray from the cell adjacent to the emitter along `dir`. Hot tiles are floor (and similar walkable) cells on the beam until terminated by **wall**, **pushable block**, or grid edge. The terminating **block** cell is hot; tiles beyond it are safe.

**On enter:** Frost is **stopped** and **hit** (lose) if he tries to step onto a hot tile.

**Mitigations:** Push a block into the beam; toggle linked switch (step on switch tile to flip `engaged`).

### `giveway` — collapsing floor

```json
{
  "id": "gw-1",
  "type": "giveway",
  "position": { "x": 4, "y": 5 },
  "config": {
    "collapseMode": "afterLeave",
    "telegraph": "tremble",
    "linkedTileId": "statue-1"
  }
}
```

| Config key | Required | Meaning |
|------------|----------|---------|
| `collapseMode` | yes | `afterLeave` — holds for the step on, collapses to **pit** when Frost leaves; `instant` — step on → fall → lose |
| `telegraph` | yes | `tremble` (on-tile shake) or `statue` (linked marker eye opens) |
| `linkedTileId` | if `telegraph: "statue"` | Must match a `markers[].id` |

**Telegraph:** When Frost is **1 tile away** (Manhattan distance 1), proximity pass activates telegraph (decoupled from trigger logic in `telegraph.ts`).

## Switches

```json
{
  "id": "sw-1",
  "position": { "x": 8, "y": 6 },
  "initiallyEngaged": false
}
```

Stepping onto the switch tile **toggles** `engaged`. When engaged, linked dart traps (`switchId`) are disabled.

## Markers (linked environmental tiles)

```json
{
  "id": "statue-1",
  "position": { "x": 2, "y": 1 },
  "spriteId": "statue"
}
```

Rendered via `src/render/manifest.ts` (`spriteId` → draw function). Swap art by editing the manifest, not trap logic.

## Fairness

At load, `validateTrapFairness()` warns (console) if:

- A fail-state trap lacks a declared telegraph
- `statue` telegraph lacks `linkedTileId` or marker
- `dart` lacks `telegraph: "beam"`

## Adding a new trap type

1. Add config to Zod in `src/core/level.ts`
2. Implement `TrapHandler` in `src/core/traps/<name>.ts`
3. `registerTrap(handler)` in `registry.ts`
4. Add manifest sprite ids if needed
5. Unit tests in `tests/core/traps.test.ts`

Handlers expose: `onEnterAttempt`, optional `onAfterPlayerMove`, `telegraphKind`, `requiresTelegraph`.

## Example level

`src/levels/level-02-traps.json` — dart gallery + give-way floors + switch + statue.
