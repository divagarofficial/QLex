import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.qlex.app',
  appName: 'QLex',
  webDir: 'out',
  server: {
    url: process.env.CAPACITOR_SERVER_URL || 'https://qlexmindtech.vercel.app',
    cleartext: true,
    androidScheme: 'https',
    allowNavigation: ['*']
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0f172a',
      androidSplashResourceName: 'splash',
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f172a'
    }
  }
};

export default config;
