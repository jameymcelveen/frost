# Frost — Capacitor mobile shell

Hosts the existing Vite web build in native iOS/Android webviews. **No game logic lives here** — only Capacitor config and native projects.

## Prerequisites

- Node 20+
- **iOS:** Xcode, CocoaPods (`pod --version`)
- **Android:** Android Studio, SDK, **JDK 17+** (`JAVA_HOME` must not point at Java 11)

From repo root: `pnpm install` (web game + Capacitor deps used by the web bundle).

## Build → sync → run

```bash
cd mobile
npm install
npm run sync          # builds ../dist then cap sync
npx cap run ios
npx cap run android
```

Shorthand:

```bash
npm run run:ios
npm run run:android
```

Open native IDEs:

```bash
npx cap open ios
npx cap open android
```

## Live reload (fast iteration)

1. At repo root: `pnpm dev` (default http://localhost:5173).
2. In `capacitor.config.ts`, uncomment `server.url` and set your machine's **LAN IP** (simulator/device cannot use `localhost`).
3. `npx cap run ios` or `android` — webview loads the dev server; HMR works.

Revert `server` before release builds.

## Webview behavior

Configured in the **web** layer (`index.html` + `src/app/native.ts`):

- Fullscreen, no browser chrome
- No overscroll bounce, pinch-zoom, text selection, or long-press callout
- `viewport-fit=cover` + CSS `env(safe-area-inset-*)` so the grid clears notches
- Status bar themed to dungeon background (`#1a1510`) on native

## Orientation knob

Default **landscape** (grid layout). Change `PREFERRED_ORIENTATION` in `src/app/config.ts`, then:

- **iOS:** `ios/App/App/Info.plist` → `UISupportedInterfaceOrientations`
- **Android:** `android/app/src/main/AndroidManifest.xml` → `screenOrientation`

Re-run `npm run sync` after native edits.

## Touch controls (web game)

Shared input abstraction (`src/input/GameInput.ts`):

- **Swipe** on the board → move
- **On-screen D-pad** (toggle **PAD** in HUD; auto-shown on coarse pointers)
- **Tap** board or **●** / overlay → reset / retry
- Keyboard unchanged for desktop

## Haptics (native)

`@capacitor/haptics` from the web app: light buzz on blocked/hit attempt, heavy on fall/lose.

## Android immersive nav bar

After `cap add android`, edge-to-edge is enabled via `MainActivity` styles in the generated project; status bar overlays the webview (`native.ts`).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank webview | Run `npm run sync` so `../dist` exists |
| Can't reach dev server | Use LAN IP in `server.url`, same Wi‑Fi |
| Pod install fails | `cd ios/App && pod install` |
