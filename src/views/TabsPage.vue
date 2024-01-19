<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="tab2" href="/management" v-if="isAdmin && !isAndroid">
          <ion-icon aria-hidden="true" :icon="speedometerOutline" />
          <ion-label>Dashboard</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab0" href="/my-wallet">
          <ion-icon aria-hidden="true" :icon="walletOutline" />
          <ion-label>Billetera</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="tab1" href="/my-reports">
          <ion-icon aria-hidden="true" :icon="fileTrayFullOutline" />
          <ion-label>Reportes</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab4" href="/my-attendances">
          <ion-icon aria-hidden="true" :icon="checkmarkDoneOutline" />
          <ion-label>Asistencias</ion-label>
        </ion-tab-button>


        <ion-tab-button tab="tab3" href="/account">
          <ion-icon aria-hidden="true" :icon="personCircleOutline" />
          <ion-label>Mi cuenta</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { Session } from '@/utils/Session/Session';
import { Capacitor } from '@capacitor/core';
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { albumsOutline, checkmarkDoneOutline, fileTrayFullOutline, personCircleOutline, speedometerOutline, walletOutline } from 'ionicons/icons';
import { computed, ref } from 'vue';


const isAdmin = ref(false);
const isAndroid = ref(false);

const isAdminCheck = async () => {
    const currentSession = await Session.getCurrentSession();
    if (!currentSession){
      return;
    };

    isAdmin.value = currentSession.roles().includes("admin");
}

const isAndroidCheck = async () => {
    const platform = await Capacitor.getPlatform();
    if (platform === "android"){
      isAndroid.value = true;
    }
}
isAdminCheck();
isAndroidCheck();
</script>
