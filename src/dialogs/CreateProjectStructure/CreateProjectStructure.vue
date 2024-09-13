<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Crear Estructura de Proyectos</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="create">Crear</ion-button>
                </ion-buttons>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <ion-accordion-group value="first">
                <ion-accordion value="first">
                    <ion-item slot="header" color="light">
                        <ion-label>
                            <h2><b>1. Dados de la estructura</b></h2>
                            <p>Estipula etapas y tareas predeterminadas para todos los proyectos que contegan esta estructura</p>
                        </ion-label>
                    </ion-item>
                    <section slot="content">
                        <ion-list>
                            <ion-item>
                                <ion-input label="Nombre de la Estructura" label-placement="stacked" v-model="form.name" :disabled="isLoading"></ion-input>
                            </ion-item>
                            <ion-item>
                                <ion-input label="Tipo" label-placement="stacked" v-model="form.structure_type" :disabled="isLoading"></ion-input>
                            </ion-item>
                            <ion-item>
                                <ion-select label="Tipo de Construcción"  label-placement="stacked" v-model="form.building_type" :disabled="isLoading">
                                    <ion-select-option v-for="type  in constructionTypesOptionsUI" :value="type.value">{{type.label}}</ion-select-option>
                                </ion-select>
                            </ion-item>
                            <ion-item>
                                <ion-input label="Cantidad de Ejes" type="number" label-placement="stacked" inputmode="numeric" :min="1" v-model="form.axes_count"></ion-input>
                            </ion-item>
                            <ion-item>
                                <ion-input label="Cantidad de Vigas" type="number" label-placement="stacked" inputmode="numeric" :min="1" v-model="form.beams_count"></ion-input>
                            </ion-item>
                            <ion-item>
                                <ion-input label="Cantidad de Columnas" type="number" label-placement="stacked" inputmode="numeric" :min="1" v-model="form.columns_count"></ion-input>
                            </ion-item>
                            <ion-item>
                                <ion-input label="Cantidad de Largeros" type="number" label-placement="stacked" inputmode="numeric" :min="1" v-model="form.stringers_count"></ion-input>
                            </ion-item>
                            <ion-item>
                                <ion-input label="Cantidad de Vistas" type="number" label-placement="stacked" inputmode="numeric" :min="1" v-model="form.facades_count"></ion-input>
                            </ion-item>
                        </ion-list>
                    </section>
                </ion-accordion>
                <ion-accordion value="second">
                    <ion-item slot="header" color="light">
                        <ion-label>
                            <h2><b>2. Etapas y tareas</b></h2>
                            <p>Estipula etapas y tareas predeterminadas para todos los proyectos que contegan esta estructura</p>
                        </ion-label>
                    </ion-item>
                    <section slot="content">
                        <ion-accordion-group class="ion-padding">
                            <ion-accordion  v-for="(phase, phaseIndex) in form.default_phases.construction" style="background-color: var(--ion-color-light-tint); padding: 5px; border-radius: 14px; margin-bottom: 5px;">
                                <ion-card slot="header" :style="{margin: 0, cursor: 'pointer'}">
                                    <ion-card-header :style="{'--background': phase.color, padding: '11px'}">
                                        <ion-card-title :style="{color: 'white', fontSize: '1rem'}">{{phase.name}}</ion-card-title>
                                    </ion-card-header>
                                </ion-card>
                                <ion-card slot="content" :style="{margin: 0}">
                                    <ion-card-content :style="{padding: 0}">
                                        <ion-list>
                                            <ion-item>
                                                <ion-input label="Nombre" label-placement="stacked" v-model="phase.name" :disabled="isLoading"></ion-input>
                                            </ion-item>
                                            <ion-item>
                                                <ion-input label="Descripción" label-placement="stacked" v-model="phase.description" :disabled="isLoading"></ion-input>
                                            </ion-item>
                                            <ion-item>
                                                <ion-input label="Expense Code" label-placement="stacked" v-model="phase.expense_code" :disabled="isLoading"></ion-input>
                                            </ion-item>
                                            <ion-item>
                                                <ion-select label="Color"  label-placement="stacked" v-model="phase.color" :disabled="isLoading">
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
                                        </ion-list>
                                        <br>
                                        <ion-list-header>Tareas</ion-list-header>
                                        <article>
                                            <ion-accordion-group class="ion-padding" :style="{paddingBottom: '0px'}">
                                                <ion-accordion v-for="(task, taskIndex) in phase.tasks" style="background-color: var(--ion-color-light-tint); padding: 6px; border-radius: 14px; margin-bottom: 5px;">
                                                    <ion-card slot="header" :style="{margin: 0, cursor: 'pointer'}">
                                                        <ion-card-header :style="{'--background': phase.color, padding: '8px'}">
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
                                                                    <ion-input label="Duración de Días" type="number" label-placement="stacked" inputmode="numeric" :min="1" v-model="task.average_days"></ion-input>
                                                                </ion-item>
                                                                <ion-item v-if="phase.tasks.length > 1">
                                                                    <ion-button color="danger" expand="block" fill="clear" @click="deleteTask(phase, taskIndex)">
                                                                        <ion-icon :icon="trashBinOutline" slot="start"></ion-icon>
                                                                        Borrar Tarea
                                                                    </ion-button>
                                                                </ion-item>
                                                            </ion-list>
                                                        </ion-card-content>
                                                    </ion-card>
                                                </ion-accordion>
                                            </ion-accordion-group>
                                            <section class="ion-padding">
                                                <ion-button expand="block" fill="outline" @click="createTask(phase)">
                                                    <ion-icon :icon="addCircleOutline" slot="start"></ion-icon>
                                                    Agregar Tarea
                                                </ion-button>
                                                <ion-button v-if="form.default_phases.construction.length > 1" color="danger" expand="block" fill="clear" @click="deletePhase(phaseIndex)">
                                                    <ion-icon :icon="trashBinOutline" slot="start"></ion-icon>
                                                    Borrar Etapa
                                                </ion-button>
                                            </section>
                                        </article>
                                    </ion-card-content>
                                </ion-card>
                            </ion-accordion>
                            <br>
                            <ion-button expand="block" @click="createPhase"> 
                                <ion-icon :icon="addCircleOutline" slot="start"></ion-icon>
                                Agregar Etapa
                            </ion-button>
                        </ion-accordion-group>
                    </section>
                </ion-accordion>
            </ion-accordion-group>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { IonButton, IonButtons, IonContent, IonHeader, IonCard, IonListHeader, IonCardContent, IonCardTitle,IonCardHeader, IonSelect, IonLabel, IonAccordionGroup, IonAccordion, IonSelectOption,IonDatetime, IonInput,IonIcon, IonItem, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar, alertController, toastController } from '@ionic/vue';
import { computed, onMounted, ref } from 'vue';
import { DialogEventEmitter } from "../../utils/Dialog/Dialog";
import { addCircleOutline, arrowForwardCircleOutline, checkmarkDoneCircleOutline, listCircleOutline, trashBinOutline } from 'ionicons/icons';
import { EProjectStructureBuildingType, IDefaultConstructionPhase, INewProjectStructure, ProjectColorsDescriptor, ProjectEnumsDescriptor } from '@/interfaces/ProjectsInterfaces';
import { AppEvents } from '@/utils/AppEvents/AppEvents';



const isLoading = ref<boolean>(false);
const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    }
});

const form = ref<INewProjectStructure>({
    name: '',
    structure_type: '',
    building_type: EProjectStructureBuildingType.Church,
    axes_count: 0,
    beams_count: 0,
    columns_count: 0,
    stringers_count: 0,
    facades_count: 0,
    default_phases: {
        construction: [],
        studio: []
    }
});


const constructionTypesOptionsUI = computed(() => {
    return Object.entries(EProjectStructureBuildingType).map(([key, value]) => {
        return {
            value: value,
            label: ProjectEnumsDescriptor.structureBuildingType(value)
        }
    });
})

const createPhase = () => {
    form.value.default_phases.construction.push({
        name: 'Etapa ' + (form.value.default_phases.construction.length + 1),
        description: '',
        expense_code: '',
        color: (() => {
            const getRandomColor = () => {
                const colors = Object.values(ProjectColorsDescriptor.colors);
                return colors[Math.floor(Math.random() * colors.length)];
            }

            //Get random color, but always different from the previous one:
            let color = getRandomColor();
            while (color == form.value.default_phases.construction[form.value.default_phases.construction.length - 1].color){
                color = getRandomColor();
            }

            return color;
        })(),
        average_days: 1,
        tasks: [{
            name: 'Tarea 1',
            description: '',
            average_days: 1
        }],
    });
}
const deletePhase = (phaseIndex: number) => {
    form.value.default_phases.construction = form.value.default_phases.construction.filter((phase, index) => index != phaseIndex);
}
const createTask = (phase: IDefaultConstructionPhase) => {
    phase.tasks.push({
        name: 'Tarea ' + (phase.tasks.length + 1),
        description: '',
        average_days: 1
    });
}
const deleteTask = (phase: IDefaultConstructionPhase, taskIndex: number) => {
    phase.tasks = phase.tasks.filter((task, index) => index != taskIndex);
}

const validateCamps = () => {
    let errors:Array<string> = [];

    if (form.value.name.trim().length == 0){
        errors.push("Por favor, ingresa el nombre de la estructura");
    }
    if (form.value.structure_type.trim().length == 0){
        errors.push("Por favor, ingresa el tipo de estructura");
    }
    if (form.value.building_type.trim().length == 0){
        errors.push("Por favor, ingresa el tipo de construcción");
    }


    //For each phase:
    form.value.default_phases.construction.forEach((phase, phaseIndex) => {
        if (phase.name.trim().length == 0){
            errors.push(`Por favor, ingresa el nombre de la etapa ${phaseIndex + 1}`);
        }
        if (phase.expense_code.trim().length == 0){
            errors.push(`Por favor, ingresa el Expense Code de la etapa ${phaseIndex + 1}`);
        }
        if (phase.average_days < 1){
            errors.push(`Por favor, ingresa la duración promedio de la etapa ${phaseIndex + 1}`);
        }

        //For each task:
        phase.tasks.forEach((task, taskIndex) => {
            if (task.name.trim().length == 0){
                errors.push(`Por favor, ingresa el nombre de la tarea ${taskIndex + 1} de la etapa ${phaseIndex + 1}`);
            }
            if (task.average_days < 1){
                errors.push(`Por favor, ingresa la duración promedio de la tarea ${taskIndex + 1} de la etapa ${phaseIndex + 1}`);
            }
        });
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
        ...form.value
    }

    RequestAPI.post('/projects/structures', dataParsed).then((response) => {
        props.emitter.fire('created', {});
        props.emitter.fire('close');
        
        AppEvents.emit('projects:reload');

        toastController.create({
            message: '✅ Estrucutra creada exitosamente',
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
    form.value.default_phases.construction.push({
        name: 'Etapa 1',
        description: '',
        expense_code: '',
        color: ProjectColorsDescriptor.colors['green'],
        average_days: 1,
        tasks: [{
            name: 'Tarea 1',
            description: '',
            average_days: 1
        }],
    });
})
</script>

<style scoped lang="scss">
</style>