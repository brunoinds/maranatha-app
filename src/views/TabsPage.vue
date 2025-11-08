<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button v-for="tab in tabsUI" :tab="tab.tab" :href="tab.route">
          <ion-icon :aria-hidden="true" :icon="tab.icon" />
          <ion-label>{{ tab.name }}</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { Session } from '@/utils/Session/Session';
import { IonIcon, IonLabel, IonPage, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/vue';
import { checkmarkDoneOutline, cubeOutline, fileTrayFullOutline, personCircleOutline, speedometerOutline, walletOutline } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';


const isSessionInitialized = ref(false);

const tabs = [
  {
    name: "Dashboard",
    icon: speedometerOutline,
    route: "/management",
    permissions: ["all"],
  },
  {
    name: "Inventário",
    icon: cubeOutline,
    route: "/inventory",
    permissions: ["all", "view-inventory"],
  },
  {
    name: "Billetera",
    icon: walletOutline,
    route: "/my-wallet",
    permissions: ["all", "view-wallet"],
  },
  {
    name: "Reportes",
    icon: fileTrayFullOutline,
    route: "/my-reports",
    permissions: ["all", "view-reports"],
  },
  {
    name: "Asistencias",
    icon: checkmarkDoneOutline,
    route: "/my-attendances",
    permissions: ["all",  "view-attendances"]
  },
  {
    name: "Mi cuenta",
    icon: personCircleOutline,
    route: "/account",
    permissions: [],
  }
];


const tabsUI = computed(() => {
  if (!isSessionInitialized.value) {
    return [];
  }

  return tabs.filter((tab) => {
    return tab.permissions.length === 0 || tab.permissions.some((permission) => Session.getCurrentSessionSync()?.permissions().includes(permission));
  }).map((tab, i) => {
    return {
      ...tab,
      tab: `tab${i}`
    }
  });
});


onMounted(() => {
  Session.waitForLogin().then(() => {
    isSessionInitialized.value = true;
  });
});


</script>
