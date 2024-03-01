<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { Session } from '@/utils/Session/Session';
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useOneSignal } from '@onesignal/onesignal-vue3';
import { Capacitor } from '@capacitor/core';
import { Notifications } from '@/utils/Notifications/Notifications';
import { App } from '@capacitor/app';
import { AppEvents } from '@/utils/AppEvents/AppEvents';

Session.router = useRouter();

if (!Capacitor.isNativePlatform()){
  const oneSignal = useOneSignal();
  Notifications.initializeOneSignal(oneSignal);
}




App.addListener('appUrlOpen', data => {
  console.log('App opened with URL:', data);
});

App.addListener('appRestoredResult', data => {
  console.log('Restored state:', data);
  AppEvents.emit('all:reload');
});
App.addListener('resume', () => {
  console.log('App resumed');
  AppEvents.emit('all:reload');
});

const checkAppLaunchUrl = async () => {
  const { url } = await App.getLaunchUrl();

  console.log('App opened with URL: ' + url);
};

</script>