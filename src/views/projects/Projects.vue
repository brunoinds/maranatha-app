<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-title>Projects</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-button @click="showCreateStructure">Create Structure</ion-button>
            <ion-button @click="showCreateProjectJob">Create Project</ion-button>
            <ion-button @click="showEditProjectJob">Edit Project</ion-button>

        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonButton, IonTitle, IonToolbar } from '@ionic/vue';
import TimeAgo from 'javascript-time-ago';
import es from 'javascript-time-ago/locale/es';
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { AppEvents } from '../../utils/AppEvents/AppEvents';

import 'ion-peek-pop/styles.css';
import { IProjectJob } from '@/interfaces/ProjectsInterfaces';
import { ProjectsStore } from '@/utils/Stored/ProjecsStore';
import { Dialog } from '@/utils/Dialog/Dialog';
import CreateProjectJob from '@/dialogs/CreateProjectJob/CreateProjectJob.vue';
import CreateProjectStructure from '@/dialogs/CreateProjectStructure/CreateProjectStructure.vue';
import EditProjectJob from '@/dialogs/EditProjectJob/EditProjectJob.vue';

TimeAgo.addLocale(es);
const timeAgo = new TimeAgo('es-PE');

const isLoading = ref<boolean>(true);
const router = useRouter();
const page = ref<HTMLElement|null>(null);


const projectsJobData = ref<IProjectJob[]>([]);


const loadProjectsJobs = async (reload:boolean = false) => {
    isLoading.value = true;

    if (reload) {
        await ProjectsStore.refreshProjectsJobs();
    }
    const response = await ProjectsStore.getProjectsJobs();
    projectsJobData.value = response;
    isLoading.value = false;
}


const showCreateProjectJob = () => {
    Dialog.show(CreateProjectJob, {
        props: {
        },
        onLoaded($this) {
            
        },
    })
}
const showCreateStructure = () => {
    Dialog.show(CreateProjectStructure, {
        props: {
        },
        onLoaded($this) {
            
        },
    })
}
const showEditProjectJob = () => {
    Dialog.show(EditProjectJob, {
        props: {
            projectJobId: 1
        },
        onLoaded($this) {
            
        },
    })
}

onMounted(() => {
    loadProjectsJobs()
    const callbackId = AppEvents.on('projects:reload', () => {
        loadProjectsJobs(true);
    })
    onUnmounted(() => {
        AppEvents.off('projects:reload', callbackId);
    })
})

</script>


<style scoped lang="scss">
</style>