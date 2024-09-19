<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Editar Reporte de Construcción</ion-title>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <section class="ion-padding">
                <article style="text-align: center;">
                    <br>
                    <ion-icon :icon="documentAttachOutline" style="font-size: 94px;" color="primary"></ion-icon>
                    <h2>Reporte Diário de Construcción</h2>
                </article>
            </section>

            <article>
                <ion-accordion-group ref="accordionGroupEl">
                    <ion-accordion value="first">
                        <ion-item slot="header" color="light">
                            <ion-label>
                                <h2><b>1. Datos del reporte</b></h2>
                                <p>Selecciona los productos que deseas solicitar</p>
                            </ion-label>
                        </ion-item>
                        <section slot="content">
                            <ion-list>
                                <ion-item>
                                    <ion-label>
                                        <h2><b>Tarea:</b> {{ constructionTask.name }}</h2>
                                        <p><b>Etapa:</b> {{ constructionPhase.name }}</p>
                                    </ion-label>
                                </ion-item>
                                <ion-item>
                                    <ion-input label="Cantidad de trabajadores hoy:" type="number" label-placement="stacked" inputmode="numeric" :min="0" v-model="form.count_workers"></ion-input>
                                </ion-item>
                                <ion-item>
                                    <ion-label position="stacked" style="font-size: 13px;">
                                        ¿Cuál es el progreso total de esta tarea?
                                    </ion-label>
                                    <ion-range :pin="true" :min="0" :max="100" v-model="form.progress" :pin-formatter="(value: number) => `${value}%`"></ion-range>
                                </ion-item>
                            </ion-list>
                        </section>
                    </ion-accordion>
                    <ion-accordion value="second">
                        <ion-item slot="header" color="light">
                            <ion-label>
                                <h2><b>2. Registro del progreso</b></h2>
                                <p>Completa los datos del pedido</p>
                            </ion-label>
                        </ion-item>
                        <section slot="content">
                            <ion-list>
                                <ion-item>
                                    <ion-textarea label="Notas:" label-placement="stacked"  v-model="form.notes" :auto-grow="true" :rows="3" placeholder="Ingresa aqui notas sobre el avance"></ion-textarea>
                                </ion-item>
                            </ion-list>
                            <br>
                            <ion-list-header>Archivos adjuntos</ion-list-header>
                            <ion-list>
                                <ion-item v-for="(attachmentId, index) in form.attachments_ids" :key="attachmentId">
                                    <ion-thumbnail slot="start">
                                        <img :src="RequestAPI.getPublicStorageUrl('/projects/' + attachmentId)" />
                                    </ion-thumbnail>
                                    <ion-label>
                                        <h2>Foto # {{ index + 1 }}</h2>
                                    </ion-label>
                                    <ion-button color="danger" fill="clear" slot="end" @click="attachments.splice(attachments.indexOf(attachment), 1)" :disabled="isLoading">
                                        <ion-icon :icon="closeCircleOutline"></ion-icon>
                                    </ion-button>
                                </ion-item>
                                <ion-item v-for="attachment in attachments" :key="attachment.name">
                                    <ion-thumbnail slot="start">
                                        <img :src="'data:image/jpeg;base64,' + attachment.base64" />
                                    </ion-thumbnail>
                                    <ion-label>
                                        <h2>{{ attachment.name }}</h2>
                                        <p>{{ attachment.size }}</p>
                                    </ion-label>
                                    <ion-button color="danger" fill="clear" slot="end" @click="attachments.splice(attachments.indexOf(attachment), 1)" :disabled="isLoading">
                                        <ion-icon :icon="closeCircleOutline"></ion-icon>
                                    </ion-button>
                                </ion-item>
                            </ion-list>

                            <section class="ion-padding">
                                <ion-button expand="block" fill="outline" size="default" style="height: 50px" @click="openAttachmentSelector" :disabled="isLoading">
                                    <ion-icon :icon="imageOutline" slot="end"></ion-icon>
                                    Agregar foto
                                </ion-button>
                            </section>
                        </section>
                    </ion-accordion>
                </ion-accordion-group>
            </article>


            <section class="ion-padding">
                <ion-button expand="block" shape="round" size="default" style="height: 50px" @click="saveReport" :disabled="isLoading">
                    <ion-icon :icon="arrowForwardCircleOutline" slot="end"></ion-icon>
                    Guardar Reporte Diário
                </ion-button>
            </section>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { INewProjectConstructionTaskDailyReport, IProjectConstructionPhase, IProjectConstructionTask, IProjectConstructionTaskDailyReport, IProjectJob, IProjectStructure } from '@/interfaces/ProjectsInterfaces';
import { IUser } from '@/interfaces/UserInterfaces';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { Picker } from '@/utils/Picker/Picker';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { ProjectsStore } from '@/utils/Stored/ProjecsStore';
import { UsersStore } from '@/utils/Stored/UsersStore';
import { alertController, IonAccordion, IonAccordionGroup, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonProgressBar, IonRange, IonTextarea, IonThumbnail, IonTitle, IonToolbar, toastController } from '@ionic/vue';
import humanFormat from 'human-format';
import { arrowForwardCircleOutline, closeCircleOutline, documentAttachOutline, imageOutline } from 'ionicons/icons';
import { DateTime } from 'luxon';
import { computed, onMounted, PropType, ref } from 'vue';
import { DialogEventEmitter } from "../../utils/Dialog/Dialog";



const isLoading = ref<boolean>(false);
const usersData = ref<IUser[]>([]);
const structuresData = ref<IProjectStructure[]>([]);

const attachments = ref<{
    name: string,
    base64: string,
    size: string,
}[]>([]);

const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    projectJob: {
        type: Object as PropType<IProjectJob>,
        required: true
    },
    constructionTask: {
        type: Object as PropType<IProjectConstructionTask>,
        required: true
    },
    constructionPhase: {
        type: Object as PropType<IProjectConstructionPhase>,
        required: true
    },
    dailyReport: {
        type: Object as PropType<IProjectConstructionTaskDailyReport>,
        required: true
    }
});

const minimumProgress = computed(() => {
    let minimum = 0;
    props.constructionTask.daily_reports.filter((item) => {
        return item.id != props.dailyReport.id;
    })
    .toSorted((a, b) => {
        return a.date > b.date ? -1 : 1;
    })
    .forEach((report) => {
        if (report.progress > minimum){
            minimum = report.progress;
        }
    });
    return minimum;
})


const minimumAlert = computed(() => {
    if (parseInt(form.value.progress as unknown as string) < minimumProgress.value){
        return `${minimumProgress.value}%`;
    }else{
        return null;
    }
})

const form = ref<IProjectConstructionTaskDailyReport>({
    id: props.dailyReport.id,
    date: props.dailyReport.date,
    count_workers: props.dailyReport.count_workers,
    progress: props.dailyReport.progress,
    notes: props.dailyReport.notes,
    attachments_ids: props.dailyReport.attachments_ids,
    created_at: props.dailyReport.created_at,
});

const saveReport = async () => {
    const validationResponse = validateCamps();

    if (!validationResponse.isValid){
        alertController.create({
            header: 'Oops...',
            message: validationResponse.errors[0] as string,
            buttons: ['OK']
        }).then((alert) => {
            alert.present();
        });
        return;
    }


    isLoading.value = true;


    const dataParsed = {
        ...form.value,
        count_workers: parseInt(form.value.count_workers as unknown as string),
        progress: parseInt(form.value.progress as unknown as string),
        attachments_base64: attachments.value.map((attachment) => {
            return attachment.base64;
        })
    }

    RequestAPI.put(`/projects/construction-tasks/${props.constructionTask.id}/daily-reports`, dataParsed).then((response) => {
        props.emitter.fire('created', response);
        props.emitter.fire('close');

        AppEvents.emit('projects:reload');
        toastController.create({
            message: '✅ Reporte creado exitosamente',
            duration: 2000
        }).then(async (toast) => {
            await toast.present();
        });
    }).catch((error) => {
        alertController.create({
            header: 'Oops...',
            message: error.response.message,
            buttons: ['OK']
        }).then(async (alert) => {
            await alert.present();
        });
    }).finally(() => {
        isLoading.value = false;
    });
}
const validateCamps = () => {
    let errors:Array<string> = [];

    if (form.value.count_workers.trim().length == 0){
        errors.push('Debes ingresar la cantidad de trabajadores');
    }

    if (parseInt(form.value.progress as unknown as string) < minimumProgress.value){
        errors.push('El progreso no puede ser menor al progreso mínimo de la tarea');
    }

    return {
        isValid: errors.length == 0,
        errors: errors
    }
}

const openAttachmentSelector = async () => {
    const photo = await Picker.pickPhoto({
        isProcessingFile: () => {}
    });


    attachments.value.push({
        name: 'Foto #' + (form.value.attachments_ids.length + attachments.value.length + 1),
        base64: photo.base64,
        size: humanFormat(photo.details.size),
    });
}



onMounted(async () => {
    usersData.value = await UsersStore.getUsers();
    structuresData.value = await ProjectsStore.getStructures();
})
</script>

<style scoped lang="scss">
</style>