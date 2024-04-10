<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Crear Job</ion-title>
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
                    <ion-input label="Zona de Job" placeholder="Ej.: Sur" label-placement="stacked" v-model="dynamicData.zone" :disabled="isLoading"></ion-input>
                </ion-item>
            </ion-list>


            <section class="ion-padding">
                <ion-button expand="block" shape="round" size="default" style="height: 50px" @click="createJob" :disabled="isLoading">
                    <ion-icon :icon="arrowForwardCircleOutline" slot="end"></ion-icon>
                    Crear Job
                </ion-button>
            </section>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { IonButton, IonButtons, IonContent, IonHeader, IonInput,IonIcon, IonItem, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar, alertController, toastController } from '@ionic/vue';
import { ref } from 'vue';
import { DialogEventEmitter } from "../../utils/Dialog/Dialog";
import { arrowForwardCircleOutline } from 'ionicons/icons';



const isLoading = ref<boolean>(false);
const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    }
});
const dynamicData = ref<{
    name: string,
    code: string,
    zone: string,
    state: string
}>({
    name: '',
    code: '',
    zone: '',
    state: 'Active'
});


const createJob = async () => {
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
        name: dynamicData.value.name,
        code: dynamicData.value.code,
        zone: dynamicData.value.zone,
        state: dynamicData.value.state
    }

    RequestAPI.post('/jobs', dataParsed).then((response) => {
        props.emitter.fire('created', {});
        props.emitter.fire('close');

        toastController.create({
            message: '✅ Job creado exitosamente',
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

    if (dynamicData.value.name.trim().length == 0){
        errors.push("Por favor, ingresa el nombre del Job");
    }
    if (dynamicData.value.code.trim().length == 0){
        errors.push("Por favor, ingresa un código para el Job");
    }
    if (dynamicData.value.zone.trim().length == 0){
        errors.push("Por favor, ingresa una zona para el Job");
    }

    return {
        isValid: errors.length == 0,
        errors: errors
    }
}
</script>

<style scoped lang="scss">
</style>