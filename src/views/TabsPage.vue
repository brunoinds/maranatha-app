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
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';


const isSessionInitialized = ref(false);
const route = useRoute();
const router = useRouter();

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
    // Toda conta vê os próprios reportes, inclusive a recém-criada que ainda não foi ativada
    permissions: [],
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


// Fora de uma aba visível (rota sem permissão), o ion-tab-bar ignora o toque nas abas: leva para a primeira visível
const redirectToVisibleTab = () => {
  const visibleTabs = tabsUI.value;
  // O Ionic mantém esta página viva ao abrir rotas fora das abas (/reports/:id...): essas não se redirecionam
  const isTabRoute = route.matched[0]?.path === '/';
  if (visibleTabs.length === 0 || !isTabRoute) {
    return;
  }

  const isOnVisibleTab = visibleTabs.some((tab) => route.path === tab.route || route.path.startsWith(tab.route + '/'));
  if (!isOnVisibleTab) {
    router.replace(visibleTabs[0].route);
  }
}

watch(() => route.path, redirectToVisibleTab);

onMounted(() => {
  Session.waitForLogin().then(() => {
    isSessionInitialized.value = true;
    redirectToVisibleTab();
  });
});


</script>
