//Serve: ionic serve --address=0.0.0.0
import { createApp } from 'vue'
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
/* Theme variables */
import './theme/variables.css';
import { Session } from '@/utils/Session/Session';
defineCustomElements(window);
SslRedirect.listen();


document.addEventListener("deviceready", () => {
  console.log("Device Ready", (window as any).plugins.OneSignal)
  Session.notifications().initializeOneSignal((window as any).plugins.OneSignal)
}, false);


const app = createApp(App)
  .use(IonicVue, {
    mode: 'ios',
  })
  .use(router);
  
router.isReady().then(() => {
  app.mount('#app');
});