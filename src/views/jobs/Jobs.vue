<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/"></ion-back-button>
                </ion-buttons>
                <ion-title>Jobs</ion-title>
                <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
                <ion-buttons slot="end">
                    <ion-button @click="addJob">
                        <ion-icon :icon="addOutline"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-list v-if="!isLoading">
                <ion-item v-for="job in jobs" :key="job.id" @click="clickJob(job)" button>
                    <ion-label>
                        <h2><b>{{ job.name }}</b></h2>
                        <p><b>Código: </b>{{job.code}}</p>
                        <p><b>Zona: </b>{{job.zone}}</p>
                    </ion-label>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonImg, IonAvatar, IonProgressBar,IonButtons, IonBackButton, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController, actionSheetController, toastController } from '@ionic/vue';
import { RequestAPI } from '../../utils/Requests/RequestAPI';
import { computed, ref } from 'vue';

import { addOutline, albumsOutline, alertCircleOutline, checkmarkCircleOutline, close, logIn } from 'ionicons/icons';
import { useRouter } from 'vue-router';

const jobsData = ref<Array<{
    id: number;
    name: string;
    code: string;
    zone: string;
}>>([]);
const isLoading = ref<boolean>(true);
const router = useRouter();
const page = ref<HTMLElement|null>(null);

const loadJobs = async () => {
    isLoading.value = true;
    jobsData.value = await RequestAPI.get('/jobs');
    isLoading.value = false;
}

const jobs = computed(() => {
    const data = jobsData.value.map((job) => {
        return {
            id: job.id,
            name: job.name,
            code: job.code,
            zone: job.zone
        }
    });
    return data;
});

const addJob = async (prefiled:any = null) => {
    const alert = await alertController.create({
        header: 'Nuevo Job',
        inputs: [
            {
                type: 'text',
                placeholder: 'Nombre',
                value: prefiled ? prefiled.name : null
            },
            {
                type: 'text',
                placeholder: 'Code',
                value: prefiled ? prefiled.code : null
            },
            {
                type: 'text',
                placeholder: 'Zona',
                value: prefiled ? prefiled.zone : null
            }
        ],
        buttons: [
            {
                text: 'Cancelar',
                role: 'cancel',
                handler: () => {
                    
                },
            },
            {
                text: 'Crear',
                role: 'confirm'
            }
        ]
    });

    await alert.present();

    const { role, data } = await alert.onDidDismiss();

    if (role != "confirm"){
        return;
    }

    const dataParsed = {
        name: data.values[0],
        code: data.values[1],
        zone: data.values[2]
    }

    if (dataParsed.zone == null || dataParsed.zone.trim().length == 0){
        dataParsed.zone = "NoZone";
    }

    RequestAPI.post('/jobs', dataParsed).then((response) => {
        alertController.create({
            header: '¡Éxito!',
            message: 'Job creado exitosamente',
            buttons: ['OK']
        }).then(async (alert) => {
            await alert.present();
            await alert.onDidDismiss();
            loadJobs();
        });
    }).catch((error) => {
        alertController.create({
            header: 'Oops...',
            message: error.response.message,
            buttons: ['OK']
        }).then(async (alert) => {
            await alert.present();
            await alert.onDidDismiss();
            addJob(dataParsed);
        });
    });
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
    } catch (error) {
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
    const alert = await alertController.create({
        header: 'Editar Job',
        inputs: [
        {
                type: 'text',
                placeholder: 'Nombre',
                value: job.name
            },
            {
                type: 'text',
                placeholder: 'Code',
                value: job.code
            },
            {
                type: 'text',
                placeholder: 'Zone',
                value: job.zone
            }
        ],
        buttons: [
            {
                text: 'Cancelar',
                role: 'cancel',
                handler: () => {
                    
                },
            },
            {
                text: 'Guardar',
                role: 'confirm'
            }
        ]
    });

    await alert.present();
    const { role, data } = await alert.onDidDismiss();

    if (role != "confirm"){
        return;
    }

    const dataParsed = {
        id: job.id,
        name: data.values[0],
        code: data.values[1],
        zone: data.values[2]
    }

    if (dataParsed.zone == null || dataParsed.zone.trim().length == 0){
        dataParsed.zone = "NoZone";
    }

    RequestAPI.patch('/jobs/' + job.id, dataParsed).then((response) => {
        alertController.create({
            header: '¡Éxito!',
            message: 'Job guardado exitosamente',
            buttons: ['OK']
        }).then(async (alert) => {
            await alert.present();
            await alert.onDidDismiss();
            loadJobs();
        });
    }).catch((error) => {
        alertController.create({
            header: 'Oops...',
            message: error.response.message,
            buttons: ['OK']
        }).then(async (alert) => {
            await alert.present();
            await alert.onDidDismiss();
            editJob(job);
        });
    });
}

loadJobs();
</script>
