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
import OneSignalVuePlugin from '@onesignal/onesignal-vue3'

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
import { Notifications } from '@/utils/Notifications/Notifications';

import { Capacitor } from '@capacitor/core';

import '@/main.scss';
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { ErrorTracking } from '@/utils/ErrorTracking/ErrorTracking';
import VuePdf from 'vue3-pdfjs'
import { ScriptInject } from '@/utils/ScriptInject/ScriptInject';
import { Environment } from '@/utils/Environment/Environment';



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
    Notifications.initializeOneSignal((window as any).plugins.OneSignal);
  }
}, false);

document.addEventListener('DOMContentLoaded', async () => {
  Session.waitForLogin().then(() => {
    Notifications.waitOneSignalLogin().then(() => {
      setTimeout(async () => {
        const isAllowed = await Notifications.isAllowed();
        if (isAllowed){
          return;
        }
        Notifications.softAskForPermission();
      }, 60 * 1000);
    })
  })
})


const app = createApp(App)
  .use(IonicVue, {
    mode: 'ios',
  })
  .use(vuetify)
  .use(VuePdf)
  .use(router);

if (!Capacitor.isNativePlatform()){
    //Inject script tag on document:
    let scriptSrc = '/assets/dependencies/qrcode/instascan.min.js';
    if (Environment.environment() == 'prod'){
      scriptSrc = '/app/assets/dependencies/qrcode/instascan.min.js';
    }
    ScriptInject.inject(scriptSrc, true);
}else{
  if (Environment.environment() == 'prod'){
    ScriptInject.injectHtml(`
      (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "mbkk79nyb2");
    `);
  }
}

ErrorTracking.initialize(app, router);

router.isReady().then(() => {
  app.mount('#app');
});

app.config.warnHandler = () => {}