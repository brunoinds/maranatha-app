import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.imedicineapp.maranathasender',
  appName: 'Maranatha Sender',
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
