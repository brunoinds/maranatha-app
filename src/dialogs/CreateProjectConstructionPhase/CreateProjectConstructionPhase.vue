<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Crear Etapa</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="create">Crear</ion-button>
                </ion-buttons>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <section class="ion-padding">
                <article style="text-align: center;">
                    <br>
                    <ion-icon :icon="duplicateOutline" style="font-size: 94px;" color="primary"></ion-icon>
                    <h2>Nueva Etapa de Construcción</h2>
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
                                <ion-select label="Status"  label-placement="stacked" v-model="form.status" :disabled="isLoading">
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
                            <h2><b>2. Tareas</b></h2>
                            <p>Crea las tareas que se deben realizar en esta etapa</p>
                        </ion-label>
                    </ion-item>
                    <section slot="content">
                        <ion-accordion-group class="ion-padding">
                            <ion-accordion  v-for="(task, taskIndex) in form.tasks" style="background-color: var(--ion-color-light-tint); padding: 5px; border-radius: 14px; margin-bottom: 5px;">
                                <ion-card slot="header" :style="{margin: 0, cursor: 'pointer'}">
                                    <ion-card-header :style="{'--background': form.color, padding: '8px'}">
                                        <ion-card-title :style="{color: 'white', fontSize: '0.9rem'}">{{task.name}}</ion-card-title>
                                    </ion-card-header>
                                </ion-card>
                                <ion-card slot="content" :style="{margin: 0}">
                                    <ion-card-content :style="{padding: 0}">
                                        <ion-list>
                                            <ion-item>
                                                <ion-input label="Nombre" label-placement="stacked" v-model="task.name" :disabled="isLoading"></ion-input>
                                            </ion-item>
                                            <ion-item>
                                                <ion-input label="Descripción" label-placement="stacked" v-model="task.description" :disabled="isLoading"></ion-input>
                                            </ion-item>
                                            <ion-item>
                                                <ion-input label="Número de trabajadores:" type="number" label-placement="stacked" inputmode="numeric" :min="0" v-model="task.count_workers"></ion-input>
                                            </ion-item>
                                            <ion-item>
                                                <ion-select label="Status"  label-placement="stacked" v-model="task.status" :disabled="isLoading">
                                                    <ion-select-option v-for="type in taskStatusOptionsUI" :value="type.value">{{type.label}}</ion-select-option>
                                                </ion-select>
                                            </ion-item>
                                            <ion-item>
                                                <ion-label position="stacked" style="font-size: 13px;">
                                                    ¿Cuál es el progreso total de esta tarea?
                                                </ion-label>
                                                <ion-range :pin="true" :min="0" :max="100" v-model="task.progress" :pin-formatter="(value: number) => `${value}%`"></ion-range>
                                            </ion-item>
                                            <ion-item>
                                            <ion-label position="stacked">Fecha programada de início</ion-label>
                                                <IonDatetimeItem design="text" presentation="date" v-model="task.scheduled_start_date" :disabled="isLoading" :value="task.scheduled_start_date"></IonDatetimeItem>
                                            </ion-item>
                                            <ion-item>
                                                <ion-label position="stacked">Fecha programada de término</ion-label>
                                                <IonDatetimeItem design="text" presentation="date" v-model="task.scheduled_end_date" :disabled="isLoading" :value="task.scheduled_end_date"></IonDatetimeItem>
                                            </ion-item>
                                            <ion-item>
                                                <ion-label position="stacked">Fecha de início</ion-label>
                                                <IonDatetimeItem v-if="task.started_at != null" design="text" presentation="date" v-model="task.started_at" :disabled="isLoading" :value="task.started_at"></IonDatetimeItem>
                                                <ion-toggle style="margin: auto;" slot="end" :enable-on-off-labels="true" @ionChange="(e) => {e.detail.checked == false ? task.started_at = null : task.started_at = DateTime.now().toISO()}" :value="task.started_at != null" :disabled="isLoading"></ion-toggle>
                                            </ion-item>
                                            <ion-item>
                                                <ion-label position="stacked">Fecha de término</ion-label>
                                                <IonDatetimeItem v-if="task.ended_at != null" design="text" presentation="date" v-model="task.ended_at" :disabled="isLoading" :value="task.ended_at"></IonDatetimeItem>
                                                <ion-toggle style="margin: auto;" slot="end" :enable-on-off-labels="true" @ionChange="(e) => {e.detail.checked == false ? task.ended_at = null : task.ended_at = DateTime.now().toISO()}" :value="task.ended_at != null" :disabled="isLoading"></ion-toggle>
                                            </ion-item>
                                            <ion-item v-if="form.tasks.length > 1">
                                                <ion-button color="danger" expand="block" fill="clear" @click="deleteTask(taskIndex)">
                                                    <ion-icon :icon="trashBinOutline" slot="start"></ion-icon>
                                                    Borrar Tarea
                                                </ion-button>
                                            </ion-item>
                                        </ion-list>
                                    </ion-card-content>
                                </ion-card>
                            </ion-accordion>
                            <br>
                            <ion-button expand="block" @click="createTask"> 
                                <ion-icon :icon="addCircleOutline" slot="start"></ion-icon>
                                Agregar Tarea
                            </ion-button>
                        </ion-accordion-group>
                    </section>
                </ion-accordion>
            </ion-accordion-group>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import IonDatetimeItem from '@/components/IonDatetimeItem/IonDatetimeItem.vue';
import IonItemChooseDialog from '@/components/IonItemChooseDialog/IonItemChooseDialog.vue';
import ExpenseSelector from '@/dialogs/ExpenseSelector/ExpenseSelector.vue';
import { EProjectConstructionPhaseStatus, EProjectConstructionTaskStatus, INewProjectConstructionPhase, IProjectJob, ProjectColorsDescriptor, ProjectEnumsDescriptor } from '@/interfaces/ProjectsInterfaces';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { alertController, IonAccordion, IonAccordionGroup, IonButton, IonToggle, IonRange, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonProgressBar, IonSelect, IonSelectOption, IonTitle, IonToolbar, toastController } from '@ionic/vue';
import { addCircleOutline, duplicateOutline, trashBinOutline } from 'ionicons/icons';
import { computed, onMounted, PropType, ref } from 'vue';
import { Dialog, DialogEventEmitter } from "../../utils/Dialog/Dialog";
import { DateTime } from 'luxon';



const isLoading = ref<boolean>(false);
const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
    projectJob: {
        type: Object as PropType<IProjectJob>,
        required: true
    }
});

const form = ref<INewProjectConstructionPhase>({
    name: 'Nova etapa',
    description: '',
    expense_code: '',
    color: (() => {
        const getRandomColor = () => {
            const colors = Object.values(ProjectColorsDescriptor.colors);
            return colors[Math.floor(Math.random() * colors.length)];
        }
        return getRandomColor();
    })(),
    tasks: [],
    project_job_id: props.projectJob.id,
    status: EProjectConstructionPhaseStatus.WaitingToStart,
    scheduled_start_date: props.projectJob.scheduled_start_date,
    scheduled_end_date: props.projectJob.scheduled_end_date,
    started_at: null,
    ended_at: null,
    progress: 0,
});
const phaseStatusOptionsUI = computed(() => {
    return Object.entries(EProjectConstructionPhaseStatus).map(([key, value]) => {
        return {
            value: value,
            label: ProjectEnumsDescriptor.constructionPhaseStatus(value)
        }
    });
})

const taskStatusOptionsUI = computed(() => {
    return Object.entries(EProjectConstructionTaskStatus).map(([key, value]) => {
        return {
            value: value,
            label: ProjectEnumsDescriptor.constructionTaskStatus(value)
        }
    });
})

const createTask = () => {
    form.value.tasks.push({
        name: 'Tarea ' + (form.value.tasks.length + 1),
        description: '',
        status: EProjectConstructionTaskStatus.WaitingToStart,
        scheduled_start_date: form.value.scheduled_start_date,
        scheduled_end_date: form.value.scheduled_end_date,
        started_at: null,
        ended_at: null,
        count_workers: 1,
        progress: 0
    });
}
const deleteTask = (taskIndex: number) => {
    form.value.tasks = form.value.tasks.filter((task, index) => index != taskIndex);
}
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
        tasks: form.value.tasks.map((task) => {
            return {
                ...task,
                count_workers: parseInt(task.count_workers as any),
                progress: parseInt(task.progress as any)
            }
        })
    }

    RequestAPI.post('/projects/construction-phases', dataParsed).then((response) => {
        props.emitter.fire('created', {});
        props.emitter.fire('close');
        
        AppEvents.emit('projects:reload');

        toastController.create({
            message: '✅ Etapa creada exitosamente',
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