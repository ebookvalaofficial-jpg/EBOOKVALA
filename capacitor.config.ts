import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ebookvala.app',
  appName: 'EbookVala',
  webDir: 'public',
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0B0E14',
      overlaysWebView: false,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0B0E14',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
  server: {
    androidScheme: 'https',
    allowNavigation: ['*'],
  },
};

export default config;
