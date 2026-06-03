import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Live reload: uncomment server block, run `pnpm dev` at repo root, then
 * `npx cap run ios` (device/simulator must reach your machine's LAN IP).
 */
const config: CapacitorConfig = {
  appId: 'com.jameymcelveen.frost',
  appName: 'Frost',
  webDir: '../dist',
  backgroundColor: '#1a1510',
  ios: {
    contentInset: 'automatic',
    scrollEnabled: false,
    allowsLinkPreview: false,
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#1a1510',
  },
  plugins: {
    CapacitorHttp: {
      enabled: false,
    },
  },
  // server: {
  //   url: 'http://192.168.1.100:5173',
  //   cleartext: true,
  // },
};

export default config;
