import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.imedicineapp.maranathainvoices',
  appName: 'Maranatha Invoices',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  ios: {
    appendUserAgent: "ios:application",
    webContentsDebuggingEnabled: true,
    handleApplicationNotifications: false
  }
};

export default config;
