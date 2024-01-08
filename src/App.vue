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

Session.router = useRouter();

if (!Capacitor.isNativePlatform()){
  const oneSignal = useOneSignal();
  Notifications.initializeOneSignal(oneSignal);
}

</script>