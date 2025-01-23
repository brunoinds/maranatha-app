<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Editar Job</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="saveJob">Guardar</ion-button>
                </ion-buttons>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <ion-list>
                <ion-item>
                    <ion-input label="Nombre de Job" placeholder="Ej.: Proyecto Palisades" label-placement="stacked" v-model="dynamicData.name" :disabled="isLoading"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input label="Código de Job" placeholder="Ej.: 0000.23" label-placement="stacked" v-model="dynamicData.code" :disabled="isLoading"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-select label="País" label-placement="stacked" interface="action-sheet" v-model="dynamicData.country" :disabled="isLoading">
                        <ion-select-option value="PE">Perú 🇵🇪</ion-select-option>
                        <ion-select-option value="BR">Brasil 🇧🇷</ion-select-option>
                        <ion-select-option value="PY">Paraguay 🇵🇾</ion-select-option>
                        <ion-select-option value="US">EE. UU. 🇺🇸</ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item>
                    <ion-input label="Zona de Job" placeholder="Ej.: Sur" label-placement="stacked" v-model="dynamicData.zone" :disabled="isLoading"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input label="¿Está activo?" label-placement="stacked" :readonly="true" :value="dynamicData.stateBoolean ? 'Activo' : 'Inactivo'" :disabled="isLoading"></ion-input>

                    <ion-toggle slot="end" :enable-on-off-labels="true" v-model="dynamicData.stateBoolean" :disabled="isLoading"></ion-toggle>
                </ion-item>
            </ion-list>
            
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { IonButton, IonButtons, IonContent, IonHeader, IonSelect, IonSelectOption, IonInput,IonToggle, IonItem, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar, alertController, toastController } from '@ionic/vue';
import { onMounted, ref } from 'vue';
import { DialogEventEmitter } from "../../utils/Dialog/Dialog";
import { arrowForwardCircleOutline } from 'ionicons/icons';
import { JobsAndExpenses } from '@/utils/Stored/JobsAndExpenses';


const jobData = ref<any>(null);
const isLoading = ref<boolean>(false);
const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
    jobCode: {
        type: String,
        required: true
    }
});
const dynamicData = ref<{
    name: string,
    code: string,
    zone: string,
    state: string,
    stateBoolean: boolean,
    country: string
}>({
    name: '',
    code: '',
    zone: '',
    state: 'Active',
    stateBoolean: true,
    country: ''
});



const loadJob = async () => {
    isLoading.value = true;

    const jobs = await RequestAPI.get('/jobs');
    const job = jobs.find((job:any) => job.code == props.jobCode);
    jobData.value = job;
    dynamicData.value.name = job.name;
    dynamicData.value.code = sanitizeCode(job.code);
    dynamicData.value.zone = job.zone;
    dynamicData.value.state = job.state;
    dynamicData.value.country = job.country;
    dynamicData.value.stateBoolean = job.state == 'Active';

    isLoading.value = false;



    function sanitizeCode(code: string): string{
        if (code === null) {
            return '';
        }

        // First remove anything inside [], including []:
        code = code.replace(/\[[^\]]*\]/g, '');

        if (code.includes('-')) {
            code = code.split('-')[0].trim();
        }

        return code;
    }
}

const saveJob = async () => {
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
        id: jobData.value.id,
        name: dynamicData.value.name,
        zone: dynamicData.value.zone,
        state: dynamicData.value.state,
        country: dynamicData.value.country,
        code: `${dynamicData.value.code}-${dynamicData.value.country}[${dynamicData.value.zone}]`
    }

    RequestAPI.patch('/jobs/' + jobData.value.id, dataParsed).then((response) => {
        props.emitter.fire('created', {});
        props.emitter.fire('close');

        toastController.create({
            message: '✅ Job guardado exitosamente',
            duration: 2000
        }).then(async (toast) => {
            await toast.present();
        });

        JobsAndExpenses.refresh();
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

    if (dynamicData.value.name.trim().length == 0){
        errors.push("Por favor, ingresa el nombre del Job");
    }
    if (dynamicData.value.code.trim().length == 0){
        errors.push("Por favor, ingresa un código para el Job");
    }
    if (dynamicData.value.zone.trim().length == 0){
        errors.push("Por favor, ingresa una zona para el Job");
    }
    if (dynamicData.value.country.trim().length == 0){
        errors.push("Por favor, selecciona el país del Job");
    }

    if (dynamicData.value.stateBoolean == false){
        dynamicData.value.state = 'Inactive';
    }else{
        dynamicData.value.state = 'Active';
    }

    return {
        isValid: errors.length == 0,
        errors: errors
    }
}


onMounted(() => {
    loadJob();
});
</script>

<style scoped lang="scss">
</style>