<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { Session } from '@/utils/Session/Session';
import { App } from '@capacitor/app';
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { Capacitor } from '@capacitor/core';
import { LiveUpdates } from '@/utils/LiveUpdates/LiveUpdates';



Session.router = useRouter();

App.addListener('appUrlOpen', data => {
	console.log('App opened with URL:', data);
});

App.addListener('appRestoredResult', data => {
	AppEvents.emit('all:reload');
});
App.addListener('resume', () => {
	AppEvents.emit('all:reload');
});

App.addListener('appStateChange', async(state) => {
	if (Capacitor.isNativePlatform()){
		if (state.isActive) {
			LiveUpdates.fetchUpdates();
		}else{
			LiveUpdates.installUpdateIfAvailableAndReady();
		}
	}
})

if (Capacitor.isNativePlatform()){
	CapacitorUpdater.notifyAppReady();
}
</script>