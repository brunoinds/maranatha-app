<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Editar Etapa</ion-title>
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
                    <ion-icon :icon="copyOutline" style="font-size: 94px;" color="primary"></ion-icon>
                    <h2>Editar Etapa de Construcción</h2>
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
                            <ion-item-choose-dialog @click="openExpenseSelector()" placeholder="Selecciona el Expense" label="Expense code:" :value="form.expense_code"/>
                            <ion-item>
                                <ion-select label="Status"  label-placement="stacked" v-model="form.status" :disabled="isLoading" @ionChange="onChangeStatus">
                                    <ion-select-option v-for="type in phaseStatusOptionsUI" :value="type.value">{{type.label}}</ion-select-option>
                                </ion-select>
                            </ion-item>
                            <ion-item>
                                <ion-select label="Color"  label-placement="stacked" v-model="form.color" :disabled="isLoading">
                                    <ion-select-option :value="ProjectColorsDescriptor.colors['green']">Verde</ion-select-option>
                                    <ion-select-option :value="ProjectColorsDescriptor.colors['blue']">Azul</ion-select-option>
                                    <ion-select-option :value="ProjectColorsDescriptor.colors['red']">Rojo</ion-select-option>
                                    <ion-select-option :value="ProjectColorsDescriptor.colors['orange']">Naranja</ion-select-option>
                                    <ion-select-option :value="ProjectColorsDescriptor.colors['purple']">Morado</ion-select-option>
                                    <ion-select-option :value="ProjectColorsDescriptor.colors['teal']">Turquesa</ion-select-option>
                                    <ion-select-option :value="ProjectColorsDescriptor.colors['cyan']">Cian</ion-select-option>
                                    <ion-select-option :value="ProjectColorsDescriptor.colors['pink']">Rosa</ion-select-option>
                                    <ion-select-option :value="ProjectColorsDescriptor.colors['brown']">Marron</ion-select-option>
                                </ion-select>
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
                <ion-accordion value="second">
                    <ion-item slot="header" color="light">
                        <ion-label>
                            <h2><b>2. Reporte Final</b></h2>
                            <p>Crea las tareas que se deben realizar en esta etapa</p>
                        </ion-label>
                    </ion-item>
                    <section slot="content">
                        <article v-if="form.final_report">
                            <ion-list>
                                <ion-item>
                                    <ion-textarea label="Notas:" label-placement="stacked"  v-model="form.final_report.notes" :auto-grow="true" :rows="3" placeholder="Ingresa aqui notas sobre el término de la etapa"></ion-textarea>
                                </ion-item>
                            </ion-list>
                            <br>
                            <ion-list-header>Archivos adjuntos</ion-list-header>
                            <ion-list>
                                <ion-item v-for="(attachmentId, index) in form.final_report.attachments_ids" :key="attachmentId">
                                    <ion-thumbnail slot="start">
                                        <img :src="RequestAPI.getPublicStorageUrl('/projects/' + attachmentId)" />
                                    </ion-thumbnail>
                                    <ion-label>
                                        <h2>Foto # {{ index + 1 }}</h2>
                                    </ion-label>
                                    <ion-button color="primary" fill="clear" slot="end" @click="downloadAttachmentId(attachmentId)" :disabled="isLoading">
                                        <ion-icon :icon="cloudDownloadOutline"></ion-icon>
                                    </ion-button>
                                    <ion-button color="danger" fill="clear" slot="end" @click="form.final_report.attachments_ids = form.final_report.attachments_ids.filter((attachment) => attachment != attachmentId)" :disabled="isLoading">
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
                        </article>
                        <article v-else>
                            <ion-label class="ion-text-center">
                                <br>
                                <p>Para crear el reporte final de la etapa, marca el status de la etapa como "Concluído".</p>
                            </ion-label>
                        </article>
                    </section>
                </ion-accordion>
            </ion-accordion-group>

            <section class="ion-padding">
                <ion-button expand="block" color="danger" size="default" style="height: 50px" @click="deletePhase" :disabled="isLoading">
                    <ion-icon :icon="trashBinOutline" slot="end"></ion-icon>
                    Borrar etapa
                </ion-button>
            </section>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import IonDatetimeItem from '@/components/IonDatetimeItem/IonDatetimeItem.vue';
import IonItemChooseDialog from '@/components/IonItemChooseDialog/IonItemChooseDialog.vue';
import ExpenseSelector from '@/dialogs/ExpenseSelector/ExpenseSelector.vue';
import { EProjectConstructionPhaseStatus, EProjectConstructionTaskStatus, INewProjectConstructionPhase, IProjectConstructionPhase, IProjectJob, ProjectColorsDescriptor, ProjectEnumsDescriptor } from '@/interfaces/ProjectsInterfaces';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { alertController, IonAccordion, IonAccordionGroup, IonListHeader, IonThumbnail, IonTextarea, IonButton, IonToggle, IonRange, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonProgressBar, IonSelect, IonSelectOption, IonTitle, IonToolbar, toastController } from '@ionic/vue';
import { addCircleOutline, closeCircleOutline, cloudDownloadOutline, copyOutline, duplicateOutline, imageOutline, trashBinOutline } from 'ionicons/icons';
import { computed, onMounted, PropType, ref } from 'vue';
import { Dialog, DialogEventEmitter } from "../../utils/Dialog/Dialog";
import { DateTime } from 'luxon';
import { Picker } from '@/utils/Picker/Picker';
import humanFormat from 'human-format';
import { Toolbox } from '@/utils/Toolbox/Toolbox';



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
    }
});
const attachments = ref<{
    name: string,
    base64: string,
    size: string,
}[]>([]);

const form = ref<IProjectConstructionPhase>({
    ...props.projectConstructionPhase,
    scheduled_end_date: DateTime.fromISO(props.projectConstructionPhase.scheduled_end_date).toISO() as unknown as string,
    scheduled_start_date: DateTime.fromISO(props.projectConstructionPhase.scheduled_start_date).toISO() as unknown as string,
    started_at: props.projectConstructionPhase.started_at != null ? DateTime.fromISO(props.projectConstructionPhase.started_at).toISO() as unknown as string : null,
    ended_at: props.projectConstructionPhase.ended_at != null ? DateTime.fromISO(props.projectConstructionPhase.ended_at).toISO() as unknown as string : null,
});
const phaseStatusOptionsUI = computed(() => {
    return Object.entries(EProjectConstructionPhaseStatus).map(([key, value]) => {
        return {
            value: value,
            label: ProjectEnumsDescriptor.constructionPhaseStatus(value)
        }
    });
})

const openExpenseSelector = () => {
    Dialog.show(ExpenseSelector, {
        props: {
            selectedExpenseCode: form.value.expense_code
        },
        onLoaded($this) {
            $this.on('selected', (event:any) => {
                const expense = event.data;
                form.value.expense_code = expense.code;
            })
            
            $this.on('close', () => {
            })
        },
    })
}
const openAttachmentSelector = async () => {
    const photo = await Picker.pickPhoto({
        isProcessingFile: () => {}
    });


    attachments.value.push({
        name: 'Foto #' + (form.value.final_report?.attachments_ids.length || 0 + attachments.value.length + 1),
        base64: photo.base64,
        size: humanFormat(photo.details.size),
    });
}

const onChangeStatus = () => {
    if (form.value.status == EProjectConstructionPhaseStatus.Finished && form.value.final_report == null){
        form.value.final_report = {
            notes: '',
            attachments_ids: []
        }
    }
}
const validateCamps = () => {
    let errors:Array<string> = [];

    if (form.value.name.trim().length == 0){
        errors.push("Por favor, ingresa el nombre de la etapa");
    }
    if (form.value.expense_code.trim().length == 0){
        errors.push("Por favor, selecciona el Expense Code de la etapa");
    }
    if (form.value.scheduled_start_date > form.value.scheduled_end_date){
        errors.push("La fecha programada de término no puede ser menor a la fecha programada de inicio");
    }

    if (form.value.started_at != null && form.value.ended_at != null && form.value.started_at > form.value.ended_at){
        errors.push("La fecha de término no puede ser menor a la fecha de inicio");
    }

    if (form.value.status == EProjectConstructionPhaseStatus.Ongoing && form.value.started_at == null){
        errors.push("Por favor, ingresa la fecha de inicio de la etapa");
    }

    if (form.value.status == EProjectConstructionPhaseStatus.Finished && (form.value.ended_at == null || form.value.started_at == null)){
        errors.push("Por favor, ingresa la fecha de inicio y término de la etapa");
    }





    form.value.tasks.forEach((task, taskIndex) => {
        if (task.name.trim().length == 0){
            errors.push(`Por favor, ingresa el nombre de la tarea ${taskIndex + 1}`);
        }
        if (task.scheduled_start_date > task.scheduled_end_date){
            errors.push(`La fecha programada de término de la tarea ${taskIndex + 1} no puede ser menor a la fecha programada de inicio`);
        }

        if (task.started_at != null && task.ended_at != null && task.started_at > task.ended_at){
            errors.push(`La fecha de término de la tarea ${taskIndex + 1} no puede ser menor a la fecha de inicio`);
        }

        if (task.status == EProjectConstructionTaskStatus.Ongoing && task.started_at == null){
            errors.push(`Por favor, ingresa la fecha de inicio de la tarea ${taskIndex + 1}`);
        }

        if (task.status == EProjectConstructionTaskStatus.Finished && (task.ended_at == null || task.started_at == null)){
            errors.push(`Por favor, ingresa la fecha de inicio y término de la tarea ${taskIndex + 1}`);
        }

        if (task.count_workers <= 0 || task.count_workers.toString().length == 0){
            errors.push(`Por favor, ingresa el número de trabajadores de la tarea ${taskIndex + 1}`);
        }
    });

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
        final_report: form.value.final_report ? {
            ...form.value.final_report,
            attachments_base64: attachments.value.map((attachment) => {
                return attachment.base64;
            })
        } : null
    }

    RequestAPI.put('/projects/construction-phases/' + props.projectConstructionPhase.id, dataParsed).then((response) => {
        props.emitter.fire('updated', {});
        props.emitter.fire('close');
        
        AppEvents.emit('projects:reload');

        toastController.create({
            message: '✅ Etapa guardada exitosamente',
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
const downloadAttachmentId = async (attachmentId:string) => {
    Toolbox.open('archivo-adjunto.png', await RequestAPI.getPublicStorageInBase64('/projects/' + attachmentId));
}
const deletePhase = async () => {
    const alert = await alertController.create({
        header: '¿Estás seguro?',
        message: '¿Estás seguro que deseas borrar esta etapa de construcción? Todas las tareas y reportes asociados a esta etapa serán borrados también.',
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
                    RequestAPI.delete('/projects/construction-phases/' + props.projectConstructionPhase.id).then((response) => {
                        props.emitter.fire('deleted', {});
                        props.emitter.fire('close');
                        
                        AppEvents.emit('projects:reload');
        
                        toastController.create({
                            message: '✅ Etapa borrada exitosamente',
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
    form.value.tasks = [{
        name: 'Tarea 1',
        description: '',
        status: EProjectConstructionTaskStatus.WaitingToStart,
        scheduled_start_date: form.value.scheduled_start_date,
        scheduled_end_date: form.value.scheduled_end_date,
        started_at: null,
        ended_at: null,
        count_workers: 1,
        progress: 0
    }];
})
</script>

<style scoped lang="scss">
</style>