import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dk.meloparents.app',
  appName: 'Melo Parents',
  webDir: 'dist',
  ios: {
    contentInset: 'never',
  },
  plugins: {
    StatusBar: {
      style: 'DEFAULT',
      overlaysWebView: true,
      backgroundColor: '#00000000',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
