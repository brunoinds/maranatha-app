import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.maranathasender.maranathasender',
  appName: 'maranatha-sender',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  ios: {
    appendUserAgent: "ios:application",
    webContentsDebuggingEnabled: true
  }
};

export default config;
