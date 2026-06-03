# Mobile (Capacitor)

Frost ships a **Capacitor** wrapper under `mobile/` that hosts the Vite `dist/` build in iOS/Android webviews.

## Quick steps

```bash
pnpm install
cd mobile && npm install && npm run sync
npx cap run ios    # or android
```

Full detail: [mobile/README.md](../mobile/README.md).

## Touch + input

All platforms use `GameInput` (keyboard + swipe + optional D-pad + tap confirm). No forked movement logic.

## Orientation

`src/app/config.ts` → `PREFERRED_ORIENTATION` (`landscape` default).
