<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-title>Project</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="openChat">
                        <ion-icon :icon="chatbubbleEllipsesOutline"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <article class="viewport" v-if="!isLoading">
                <aside v-if="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                    <br>
                    <article style="text-align: center;">
                        <br>
                        <ion-icon :icon="briefcaseOutline" style="font-size: 94px;" color="primary"></ion-icon>
                        <h1><b>{{ projectJobData?.job?.name }}</b></h1>

                        <ion-label>
                            <h3><b>{{ projectJobData?.job?.code }}</b></h3>
                            <p><b>{{ projectJobData?.job?.country }}</b></p>
                        </ion-label>
                    </article>                    
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
                    <ion-list v-if="Viewport.data.value.deviceSetting != 'DesktopLandscape'">
                        <ion-item style="border-bottom: 1px solid var(--ion-color-light-shade);" :lines="'none'" color="light">
                            <ion-icon :icon="storefrontOutline" style="font-size: 34px;" slot="start" color="primary"></ion-icon>
                            <ion-label>
                                <h2><b>{{ warehouseData?.name }}</b></h2>
                                <h3><b>{{ warehouseData?.zone }}</b></h3>
                                <p><b>{{ warehouseData?.country }}</b></p>
                            </ion-label>
                        </ion-item>
                    </ion-list>
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
                        <ProjectCalendars v-if="currentSegment?.id == 'schedule'" :projectJob="(projectJobData as IProjectJob)" />
                        <ProjectDailyReports v-if="currentSegment?.id == 'daily-reports'" :projectJob="(projectJobData as IProjectJob)" />
                        <ProjectPhasesAndTasks v-if="currentSegment?.id == 'phases-and-tasks'" :projectJob="(projectJobData as IProjectJob)" />

                    </main>
                </main>
            </article>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import TimeAgo from 'javascript-time-ago';
import es from 'javascript-time-ago/locale/es';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AppEvents } from '../../utils/AppEvents/AppEvents';

import { IProjectConstructionPhase, IProjectConstructionTask, IProjectJob } from '@/interfaces/ProjectsInterfaces';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { DateTime } from 'luxon';
import chroma from "chroma-js";
import { briefcaseOutline, chatbubbleEllipsesOutline, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';
import { Viewport } from '@/utils/Viewport/Viewport';
import ProjectCalendars from '@/views/projects/sections/ProjectCalendars.vue';
import ProjectDailyReports from '@/views/projects/sections/ProjectDailyReports.vue';
import ProjectPhasesAndTasks from '@/views/projects/sections/ProjectPhasesAndTasks.vue';


TimeAgo.addLocale(es);
const timeAgo = new TimeAgo('es-PE');

const isLoading = ref<boolean>(true);
const router = useRouter();
const route = useRoute();
const page = ref<HTMLElement|null>(null);
const segmentValue = ref<string>('calendar');


const segments = [
    {
        id: 'schedule',
        title: '🗓️ Planeamiento',
        name: 'Planeamiento',
        icon: '🗓️'
    },
    {
        id: 'daily-reports',
        title: '📆 Reportes Diários',
        name: 'Reportes Diários',
        icon: '📆'
    },
    {
        id: 'phases-and-tasks',
        title: '📆 Etapas y Tareas',
        name: 'Etapas y Tareas',
        icon: '📆'
    }
];
const currentSegment = computed(() => {
    return segments.find((s) => {return s.id == segmentValue.value});
})


const projectJobId = (parseInt(route.params.id as string));


const projectJobData = ref<IProjectJob|null>(null);


const openChat = () => {
    router.push(`/projects/jobs/${projectJobId}/chat`);
}


const loadProjectJob = async () => {
    isLoading.value = true;
    projectJobData.value = await RequestAPI.get(`/projects/jobs/${projectJobId}`) as IProjectJob;
    isLoading.value = false;
}

onMounted(() => {
    loadProjectJob()
    const callbackId = AppEvents.on('projects:reload', () => {
        loadProjectJob();
    })
    onUnmounted(() => {
        AppEvents.off('projects:reload', callbackId);
    })
})

</script>


<style scoped lang="scss">
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
</style>