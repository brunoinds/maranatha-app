import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.imedicineapp.maranathainvoices',
  appName: 'Maranatha Invoices',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  ios: {
    appendUserAgent: " ios:application",
    webContentsDebuggingEnabled: true,
    handleApplicationNotifications: false
  },
  plugins: {
    CapacitorUpdater: {
      autoUpdate: false,
      // O app hospeda os próprios bundles; desde a 8.46 o plugin manda dados de saúde para plugin.capgo.app se statsUrl não for vazio
      statsUrl: '',
    }
  }
};

export default config;
