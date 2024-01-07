<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-title>Dashboard</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
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
                    <header style="border-bottom: 1px solid gainsboro;" v-if="Viewport.data.value.deviceSetting != 'DesktopLandscape'">
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
        border-right: 1px solid gainsboro;
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
import { IonPage, IonHeader, IonToolbar, IonSegment, IonSegmentButton, IonTitle, IonContent,IonAccordion, IonAccordionGroup, IonProgressBar, IonImg, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController } from '@ionic/vue';
import { RequestAPI } from '../../utils/Requests/RequestAPI';
import { computed, ref, watch } from 'vue';
import { addOutline, albumsOutline, alertCircleOutline, checkmarkCircleOutline, sendOutline, closeCircleOutline, pencilOutline, home } from 'ionicons/icons';
import { EReportStatus, IReport } from '../../interfaces/ReportInterfaces';
import { useRouter, useRoute } from 'vue-router';
import AllReports from '@/views/management/reports/AllReports.vue';
import Accounts from '@/views/management/accounts/Accounts.vue';
import Records from '@/views/management/records/Records.vue';
import Wallets from '@/views/management/wallets/Wallets.vue';
import Attendances from '@/views/management/attendances/Attendances.vue';
import Settings from '@/views/management/settings/Settings.vue';
import { Viewport } from '@/utils/Viewport/Viewport';
import Graphs from '@/views/management/graphs/Graphs.vue';
import HomeGraphs from '@/views/management/graphs/HomeGraphs.vue';
const router = useRouter();
const route = useRoute();
const page = ref<HTMLElement|null>(null);
const segmentValue = ref('home');

Viewport.onChange((content) => {
})


watch(segmentValue, (newValue) => {
    const currentRoute = route.fullPath;
    const splitting = currentRoute.split('management/');
    if (splitting.length > 1) {
        const newUrl = splitting[0] + `management/${newValue.toLowerCase()}`;
        window.history.pushState(newValue, newValue, newUrl);
    }else{
        window.history.pushState(newValue, newValue, currentRoute + `/${newValue.toLowerCase()}`);
    }
})

const segments = [
    {
        id: 'home',
        title: '🏠 Inicio',
        name: 'Inicio',
        icon: '🏠'
    },
    {
        id: 'informs',
        title: '📊 Analisis',
        name: 'Analisis',
        icon: '📊'
    },
    {
        id: 'records',
        title: '🧾 Plantillas',
        name: 'Plantillas',
        icon: '🧾'
    },
    {
        id: 'reports',
        title: '📥 Reportes',
        name: 'Reportes',
        icon: '📥'
    },
    {
        id: 'attendances',
        title: '📅 Asistencias',
        name: 'Asistencias',
        icon: '📅'
    },
    {
        id: 'wallets',
        title: '💵 Billeteras',
        name: 'Billeteras',
        icon: '💵'
    },
    {
        id: 'accounts',
        title: '👥 Cuentas',
        name: 'Cuentas',
        icon: '👥'
    },
    {
        id: 'settings',
        title: '⚙️ Configuraciónes',
        name: 'Configuraciónes',
        icon: '⚙️'
    },
];

const currentSegment = computed(() => {
    return segments.find((s) => {return s.id == segmentValue.value});
})

const resolveRoute = () => {
    const currentRoute = route.fullPath;
    const splitting = currentRoute.split('management/');
    if (splitting.length > 1) {
        const lastRoute = splitting[1].split('/')[0];
        segmentValue.value = lastRoute;
    }else{
        segmentValue.value = 'home';
    }
}
resolveRoute();
</script>
