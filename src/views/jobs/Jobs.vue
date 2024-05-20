<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/"></ion-back-button>
                </ion-buttons>
                <ion-title>Jobs</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="addJob">
                        <ion-icon :icon="addOutline"></ion-icon>
                    </ion-button>
                </ion-buttons>
                <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
            </ion-toolbar>
            <ion-toolbar>
                <ion-searchbar v-model="dynamicData.search" :animated="true" placeholder="Buscar Job"></ion-searchbar>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-list v-if="!isLoading">
                <ion-item v-for="job in jobsUI.filter(item => item.state == 'Active')" :key="job.id" @click="clickJob(job)" button>
                    <ion-label>
                        <h2><b>{{ job.name }}</b></h2>
                        <p><b>Código: </b>{{job.code}}</p>
                        <p><b>Zona: </b>{{job.zone}}</p>
                    </ion-label>
                </ion-item>
            </ion-list>


            <ion-accordion-group v-if="!isLoading && jobsUI.filter(item => item.state == 'Inactive').length > 0">
                    <ion-accordion>
                        <ion-item slot="header" color="light">
                            <ion-icon slot="start" :icon="powerOutline"></ion-icon>
                            <ion-label>Jobs Inactivados</ion-label>
                        </ion-item>
                        <section slot="content">
                            <ion-list v-if="!isLoading">
                                <ion-item v-for="job in jobsUI.filter(item => item.state == 'Inactive')" :key="job.id" @click="clickJob(job)" button>
                                    <ion-label>
                                        <h2><b>{{ job.name }}</b></h2>
                                        <p><b>Código: </b>{{job.code}}</p>
                                        <p><b>Zona: </b>{{job.zone}}</p>
                                    </ion-label>
                                </ion-item>
                            </ion-list>
                        </section>
                    </ion-accordion>
                </ion-accordion-group>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonSearchbar, IonButton, IonAccordionGroup, IonAccordion, IonContent, IonImg, IonAvatar, IonProgressBar,IonButtons, IonBackButton, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController, actionSheetController, toastController } from '@ionic/vue';
import { RequestAPI } from '../../utils/Requests/RequestAPI';
import { computed, ref } from 'vue';

import { addOutline, albumsOutline, alertCircleOutline, checkmarkCircleOutline, close, logIn } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import CreateJob from '@/dialogs/CreateJob/CreateJob.vue';
import { Dialog } from '@/utils/Dialog/Dialog';
import EditJob from '@/dialogs/EditJob/EditJob.vue';
import { powerOutline } from 'ionicons/icons';
import { JobsAndExpenses } from '@/utils/Stored/JobsAndExpenses';

const jobsData = ref<Array<{
    id: number;
    name: string;
    code: string;
    zone: string;
    state: string;
}>>([]);


const jobsUI = computed(() => {
    return jobsData.value.map((job) => {
        return {
            ...job,
        }
    }).filter((job) => {
        let searchContent = dynamicData.value.search.toLowerCase().trim();
        if (searchContent.length == 0){
            return job;
        }
        return job.name.toLowerCase().includes(searchContent) || job.code.toLowerCase().includes(searchContent);
    });
})

const dynamicData = ref<{
    search: string;
}>({
    search: ''
});

const isLoading = ref<boolean>(true);
const page = ref<HTMLElement|null>(null);

const loadJobs = async () => {
    isLoading.value = true;
    jobsData.value = await RequestAPI.get('/jobs');
    isLoading.value = false;
    JobsAndExpenses.refresh();
}

const addJob = async () => {
    Dialog.show(CreateJob, {
        onLoaded($this) {
            $this.on('created', (event:any) => {
                loadJobs();
            })
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        }
    })
}
const deleteJob = async (job:any) => {
    try {
        await RequestAPI.delete(`/jobs/${job.id}`);
        loadJobs();
        toastController.create({
            message: '✅ Job eliminado con éxito',
            duration: 2000
        }).then((toast) => {
            toast.present();
        })
    } catch (error: any) {
        alertController.create({
            header: 'Oops...',
            message: error.response.message,
            buttons: ['OK']
        }).then((alert) => {
            alert.present();
        })
    }
}
const clickJob = async(job:any) => {
    await actionSheetController.create({
        header: 'Opciones',
        buttons: [
            {
                text: 'Editar',
                handler: () => {
                    editJob(job)
                }
            },
            {
                text: 'Eliminar',
                role: 'destructive',
                handler: () => {
                    deleteJob(job)
                }
            },
            {
                text: 'Cancelar',
                role: 'cancel',
                handler: () => {
                    
                }
            }
        ]
    }).then((actionSheet) => {
        actionSheet.present();
    })
}
const editJob = async (job:any) => {
    Dialog.show(EditJob, {
        onLoaded($this) {
            $this.on('created', (event:any) => {
                loadJobs();
            })
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        },
        props: {
            jobCode: job.code
        }
    })
}

loadJobs();
</script>
