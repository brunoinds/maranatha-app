//Serve: ionic serve --address=0.0.0.0
import { createApp, config } from 'vue'
import App from './App.vue'
import router from './router';
import { IonicVue } from '@ionic/vue';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import SslRedirect from '@/utils/SslRedirect/SslRedirect';
/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';
import OneSignal from 'onesignal-cordova-plugin';


/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';



/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';
import '@mdi/font/css/materialdesignicons.css';
/* Theme variables */
import './theme/variables.css';
import { Session } from '@/utils/Session/Session';
import { Capacitor } from '@capacitor/core';

import '@/main.scss';
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'



const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  }
})

defineCustomElements(window);
SslRedirect.listen();


document.addEventListener("deviceready", () => {
  if (Capacitor.isNativePlatform()){
    Session.notifications().initializeOneSignal((window as any).plugins.OneSignal);
  }
}, false);


const app = createApp(App)
  .use(IonicVue, {
    mode: 'ios',
  })
  .use(vuetify)
  .use(router);


router.isReady().then(() => {
  app.mount('#app');
});

app.config.warnHandler = () => {}