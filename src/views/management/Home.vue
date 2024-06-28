<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-title>Dashboard</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-refresher v-if="segmentValue == 'reports'" slot="fixed" @ionRefresh="handleRefresh($event)">
                <ion-refresher-content></ion-refresher-content>
            </ion-refresher>
            <article class="viewport">
                <aside v-if="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                    <br>
                    <ion-list-header style="font-size: 30px;">Dashboard</ion-list-header>
                    <article>
                        <ion-list :inset="true">
                            <ion-item v-for="segment in segments" :key="segment.id" button :color="segmentValue == segment.id ? 'primary' : undefined" @click="segmentValue = segment.id">
                                <span slot="start">{{ segment.icon }}</span>
                                <ion-label>{{ segment.name }}</ion-label>
                            </ion-item>
                        </ion-list>
                    </article>
                </aside>
                <main>
                    <header style="border-bottom: 1px solid var(--ion-color-light-shade);" v-if="Viewport.data.value.deviceSetting != 'DesktopLandscape'">
                        <ion-segment :scrollable="true" :value="segmentValue" v-model="segmentValue" mode="md">
                            <ion-segment-button v-for="segment in segments" :value="segment.id" :key="segment.id">
                                <ion-label>{{ segment.title }}</ion-label>
                            </ion-segment-button>
                        </ion-segment>
                    </header>

                    <article>
                        <br>
                        <ion-list-header style="font-size: 30px;">{{currentSegment?.title}}</ion-list-header>
                    </article>

                    <main>
                        <HomeGraphs v-if="segmentValue == 'home'"></HomeGraphs>
                        <AllReports v-if="segmentValue == 'reports'"></AllReports>
                        <Graphs v-if="segmentValue == 'informs'"></Graphs>
                        <Accounts v-if="segmentValue == 'accounts'"></Accounts>
                        <Records v-if="segmentValue == 'records'"></Records>
                        <Wallets v-if="segmentValue == 'wallets'"></Wallets>
                        <Attendances v-if="segmentValue == 'attendances'"></Attendances>
                        <Settings v-if="segmentValue == 'settings'"></Settings>
                        <Workers v-if="segmentValue == 'workers'"></Workers>
                        <Inventory v-if="segmentValue == 'inventory'"></Inventory>
                    </main>
                </main>
            </article>
        </ion-content>
    </ion-page>
</template>

<styles lang="scss" scoped>
.viewport {
    display: flex;
    flex-direction: row;
    height: 100%;
    > aside {
        width: 300px;
        height: 100%;
        border-right: 1px solid var(--ion-color-light-shade);
        background-color: var(--ion-color-light);
    }
    > main {
        flex: 1;
        height: 100%;
        overflow-y: auto;
        > article {
            padding: 10px;
        }
    }
}
</styles>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonSegment, IonSegmentButton, IonTitle, IonRefresher, IonRefresherContent, IonContent,IonAccordion, IonAccordionGroup, IonProgressBar, IonImg, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController } from '@ionic/vue';
import { RequestAPI } from '../../utils/Requests/RequestAPI';
import { computed, onMounted, ref, watch } from 'vue';
import { addOutline, albumsOutline, alertCircleOutline, checkmarkCircleOutline, sendOutline, closeCircleOutline, pencilOutline, home } from 'ionicons/icons';
import { EReportStatus, IReport } from '../../interfaces/ReportInterfaces';
import { useRouter, useRoute } from 'vue-router';
import AllReports from '@/views/management/reports/AllReports.vue';
import Accounts from '@/views/management/accounts/Accounts.vue';
import Records from '@/views/management/records/Records.vue';
import Wallets from '@/views/management/wallets/Wallets.vue';
import Attendances from '@/views/management/attendances/Attendances.vue';
import Workers from '@/views/management/workers/Workers.vue';
import Settings from '@/views/management/settings/Settings.vue';
import { Viewport } from '@/utils/Viewport/Viewport';
import Graphs from '@/views/management/graphs/Graphs.vue';
import Inventory from '@/views/management/inventory/Inventory.vue';
import HomeGraphs from '@/views/management/graphs/HomeGraphs.vue';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { useManagementHtml } from '@/views/management/management';
const router = useRouter();
const route = useRoute();
const page = ref<HTMLElement|null>(null);
const segmentValue = ref('home');


const handleRefresh = (event: CustomEvent) => {
    const callbackId = AppEvents.on('all:reloaded-all-reports-fired', () => {
        event.detail.complete();
        AppEvents.off('all:reloaded-all-reports-fired', callbackId);
    })
    AppEvents.emit('all:reload');
};

const segments = [
    {
        id: 'home',
        title: '🏠 Inicio',
        name: 'Inicio',
        icon: '🏠'
    },
    {
        id: 'reports',
        title: '📥 Reportes',
        name: 'Reportes',
        icon: '📥'
    },
    {
        id: 'informs',
        title: '📊 Analytics',
        name: 'Analytics',
        icon: '📊'
    },
    {
        id: 'records',
        title: '🧾 Plantillas',
        name: 'Plantillas',
        icon: '🧾'
    },
    {
        id: 'attendances',
        title: '📅 Asistencias',
        name: 'Asistencias',
        icon: '📅'
    },
    {
        id: 'workers',
        title: '👷 Trabajadores',
        name: 'Trabajadores',
        icon: '👷'
    },
    {
        id: 'wallets',
        title: '💵 Billeteras',
        name: 'Billeteras',
        icon: '💵'
    },
    {
        id: 'inventory',
        title: '📦 Inventário',
        name: 'Inventário',
        icon: '📦'
    },
    {
        id: 'accounts',
        title: '👥 Cuentas',
        name: 'Cuentas',
        icon: '👥'
    },
    {
        id: 'settings',
        title: '⚙️ Configuraciones',
        name: 'Configuraciones',
        icon: '⚙️'
    },
];

const currentSegment = computed(() => {
    return segments.find((s) => {return s.id == segmentValue.value});
})

onMounted(() => {
    const {setPage} = useManagementHtml();
    setPage(page.value);
});
</script>
