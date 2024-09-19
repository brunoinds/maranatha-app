<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Editar Tarea</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="create">Guardar</ion-button>
                </ion-buttons>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <section class="ion-padding">
                <article style="text-align: center;">
                    <br>
                    <ion-icon :icon="duplicateOutline" style="font-size: 94px;" color="primary"></ion-icon>
                    <h2>Editar Tarea de Construcción</h2>
                </article>
            </section>
            <ion-accordion-group value="first">
                <ion-accordion value="first">
                    <ion-item slot="header" color="light">
                        <ion-label>
                            <h2><b>1. Dados de la etapa</b></h2>
                            <p>Estipula etapas y tareas predeterminadas para todos los proyectos que contegan esta estructura</p>
                        </ion-label>
                    </ion-item>
                    <section slot="content">
                        <ion-list>
                            <ion-item>
                                <ion-input label="Nombre" label-placement="stacked" v-model="form.name" :disabled="isLoading"></ion-input>
                            </ion-item>
                            <ion-item>
                                <ion-input label="Descripción" label-placement="stacked" v-model="form.description" :disabled="isLoading"></ion-input>
                            </ion-item>
                            <ion-item>
                                <ion-input label="Número de trabajadores:" type="number" label-placement="stacked" inputmode="numeric" :min="0" v-model="form.count_workers"></ion-input>
                            </ion-item>
                            <ion-item>
                                <ion-select label="Status"  label-placement="stacked" v-model="form.status" :disabled="isLoading">
                                    <ion-select-option v-for="type in taskStatusOptionsUI" :value="type.value">{{type.label}}</ion-select-option>
                                </ion-select>
                            </ion-item>
                            <ion-item>
                                <ion-label position="stacked" style="font-size: 13px;">
                                    ¿Cuál es el progreso total de esta tarea?
                                </ion-label>
                                <ion-range :pin="true" :min="0" :max="100" v-model="form.progress" :pin-formatter="(value: number) => `${value}%`"></ion-range>
                            </ion-item>
                            <ion-item>
                            <ion-label position="stacked">Fecha programada de início</ion-label>
                                <IonDatetimeItem design="text" presentation="date" v-model="form.scheduled_start_date" :disabled="isLoading" :value="form.scheduled_start_date"></IonDatetimeItem>
                            </ion-item>
                            <ion-item>
                                <ion-label position="stacked">Fecha programada de término</ion-label>
                                <IonDatetimeItem design="text" presentation="date" v-model="form.scheduled_end_date" :disabled="isLoading" :value="form.scheduled_end_date"></IonDatetimeItem>
                            </ion-item>
                            <ion-item>
                                <ion-label position="stacked">Fecha de início</ion-label>
                                <IonDatetimeItem v-if="form.started_at != null" design="text" presentation="date" v-model="form.started_at" :disabled="isLoading" :value="form.started_at"></IonDatetimeItem>
                                <ion-toggle style="margin: auto;" slot="end" :enable-on-off-labels="true" @ionChange="(e) => {e.detail.checked == false ? form.started_at = null : form.started_at = DateTime.now().toISO()}" :value="form.started_at != null" :disabled="isLoading"></ion-toggle>
                            </ion-item>
                            <ion-item>
                                <ion-label position="stacked">Fecha de término</ion-label>
                                <IonDatetimeItem v-if="form.ended_at != null" design="text" presentation="date" v-model="form.ended_at" :disabled="isLoading" :value="form.ended_at"></IonDatetimeItem>
                                <ion-toggle style="margin: auto;" slot="end" :enable-on-off-labels="true" @ionChange="(e) => {e.detail.checked == false ? form.ended_at = null : form.ended_at = DateTime.now().toISO()}" :value="form.ended_at != null" :disabled="isLoading"></ion-toggle>
                            </ion-item>
                        </ion-list>
                    </section>
                </ion-accordion>
            </ion-accordion-group>
            <section class="ion-padding">
                <ion-button expand="block" color="danger" size="default" style="height: 50px" @click="deleteTask" :disabled="isLoading">
                    <ion-icon :icon="trashBinOutline" slot="end"></ion-icon>
                    Borrar tarea
                </ion-button>
            </section>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import IonDatetimeItem from '@/components/IonDatetimeItem/IonDatetimeItem.vue';
import { EProjectConstructionTaskStatus, INewProjectConstructionTask, IProjectConstructionPhase, IProjectConstructionTask, IProjectJob, ProjectEnumsDescriptor } from '@/interfaces/ProjectsInterfaces';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { alertController, IonAccordion, IonAccordionGroup, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonProgressBar, IonRange, IonSelect, IonSelectOption, IonTitle, IonToggle, IonToolbar, toastController } from '@ionic/vue';
import { duplicateOutline, trashBinOutline } from 'ionicons/icons';
import { DateTime } from 'luxon';
import { computed, onMounted, PropType, ref } from 'vue';
import { DialogEventEmitter } from "../../utils/Dialog/Dialog";


const isLoading = ref<boolean>(false);
const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
    projectJob: {
        type: Object as PropType<IProjectJob>,
        required: true
    },
    projectConstructionPhase: {
        type: Object as PropType<IProjectConstructionPhase>,
        required: true
    },
    projectConstructionTask: {
        type: Object as PropType<IProjectConstructionTask>,
        required: true
    }
});

const form = ref<IProjectConstructionTask>({
    ...props.projectConstructionTask,
    scheduled_end_date: DateTime.fromISO(props.projectConstructionTask.scheduled_end_date).toISO() as unknown as string,
    scheduled_start_date: DateTime.fromISO(props.projectConstructionTask.scheduled_start_date).toISO() as unknown as string,
    started_at: props.projectConstructionTask.started_at != null ? DateTime.fromISO(props.projectConstructionTask.started_at).toISO() as unknown as string : null,
    ended_at: props.projectConstructionTask.ended_at != null ? DateTime.fromISO(props.projectConstructionTask.ended_at).toISO() as unknown as string : null,
});

const taskStatusOptionsUI = computed(() => {
    return Object.entries(EProjectConstructionTaskStatus).map(([key, value]) => {
        return {
            value: value,
            label: ProjectEnumsDescriptor.constructionTaskStatus(value)
        }
    });
})

const validateCamps = () => {
    let errors:Array<string> = [];

    if (form.value.name.trim().length == 0){
        errors.push("Por favor, ingresa el nombre de la etapa");
    }
    if (form.value.scheduled_start_date > form.value.scheduled_end_date){
        errors.push("La fecha programada de término no puede ser menor a la fecha programada de inicio");
    }

    if (form.value.started_at != null && form.value.ended_at != null && form.value.started_at > form.value.ended_at){
        errors.push("La fecha de término no puede ser menor a la fecha de inicio");
    }

    if (form.value.status == EProjectConstructionTaskStatus.Ongoing && form.value.started_at == null){
        errors.push("Por favor, ingresa la fecha de inicio de la etapa");
    }

    if (form.value.status == EProjectConstructionTaskStatus.Finished && (form.value.ended_at == null || form.value.started_at == null)){
        errors.push("Por favor, ingresa la fecha de inicio y término de la etapa");
    }


    return {
        isValid: errors.length == 0,
        errors: errors
    }
}
const create = async () => {
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
        count_workers: parseInt(form.value.count_workers as any),
        progress: parseInt(form.value.progress as any)
    }

    RequestAPI.put('/projects/construction-tasks/' + props.projectConstructionTask.id ,  dataParsed).then((response) => {
        props.emitter.fire('updated', {});
        props.emitter.fire('close');
        
        AppEvents.emit('projects:reload');

        toastController.create({
            message: '✅ Tarea guardada exitosamente',
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
const deleteTask = async () => {
    const alert = await alertController.create({
        header: '¿Estás seguro?',
        message: '¿Estás seguro que deseas borrar esta tarea de construcción? Los reportes diários de esta tarea también serán borrados.',
        buttons: [
            {
                text: 'Cancelar',
                role: 'cancel',
            },
            {
                text: 'Borrar etapa',
                role: 'destructive',
                handler: async () => {
                    isLoading.value = true;
                    RequestAPI.delete('/projects/construction-tyasks/' + props.projectConstructionTask.id).then((response) => {
                        props.emitter.fire('deleted', {});
                        props.emitter.fire('close');
                        
                        AppEvents.emit('projects:reload');
        
                        toastController.create({
                            message: '✅ Tarea borrada exitosamente',
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
            }
        ]
    });
    await alert.present();
}

onMounted(() => {

})
</script>

<style scoped lang="scss">
</style>