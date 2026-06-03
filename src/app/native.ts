import { Capacitor } from '@capacitor/core';

const DUNGEON_BG = '#1a1510';

export async function initNativeShell(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: DUNGEON_BG });
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setOverlaysWebView({ overlay: true });
    }
  } catch {
    // Status bar plugin optional during web dev
  }
}
