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
import { Environment } from '@/utils/Environment/Environment';
import { SplashScreen } from '@capacitor/splash-screen';



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

/*
let data = {version: ""}
CapacitorUpdater.notifyAppReady()
App.addListener('appStateChange', async(state) => {
	if (state.isActive) {
		// Do the download during user active app time to prevent failed download
		alert('Downloading new app version')

		data = await CapacitorUpdater.download({
			version: '1.1.14',
			url: 'https://cgh.imedicineapp.com/com.imedicineapp.maranathainvoices_1.1.14.zip',
		})
		alert('New app version downloaded!')
	}
	if (!state.isActive && data.version !== "") {
		alert('Switching to new app version')
		// Do the switch when user leave app
		SplashScreen.show()
		try {
			await CapacitorUpdater.set(data)
			alert('New app version switched!')
		} catch (err) {
			console.log(err)
			SplashScreen.hide() // in case the set fail, otherwise the new app will have to hide it
		}
	}
})*/


App.addListener('appStateChange', async(state) => {
	https://cgh.imedicineapp.com/com.imedicineapp.maranathainvoices_1.1.14.zip
	
	
	
	if (Capacitor.isNativePlatform()){
		if (state.isActive) {
			LiveUpdates.fetchUpdates();
		}else{
			LiveUpdates.installUpdateIfAvailableAndReady();
		}
	}
})

console.log({appVersionNew: Environment.version()})

if (Capacitor.isNativePlatform()){
	CapacitorUpdater.notifyAppReady();
}
</script>