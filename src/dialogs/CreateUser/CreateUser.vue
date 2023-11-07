<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Crear Cuenta</ion-title>
                <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-list>
                <ion-item>
                    <ion-input label="Nombres y apellidos" label-placement="stacked" placeholder="Ej.: José Quispe Mattos"  v-model="dynamicData.name" :disabled="isLoading"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input label="Correo electrónico" label-placement="stacked" type="email" placeholder="Ej.: correo@gmail.com" @ionInput="onEvents.onEmailInput" @ionBlur="onEvents.onEmailBlur"   v-model="dynamicData.email" :disabled="isLoading"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input label="Usuário" label-placement="stacked" placeholder="Ej.: josequispe" autocapitalize="off"  v-model="dynamicData.username" @ionInput="onEvents.onUsernameInput" @ionBlur="onEvents.onUsernameBlur" :disabled="isLoading"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input label="Contraseña" label-placement="stacked"  v-model="dynamicData.password" type="password" :disabled="isLoading"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input label="Repetir Contraseña" label-placement="stacked"  v-model="dynamicData.repeatPassword" type="password" :disabled="isLoading"></ion-input>
                </ion-item>
            </ion-list>
            <section class="ion-padding">
                <ion-button expand="block" shape="round" size="default" style="height: 50px" @click="createNewAccount" :disabled="isLoading">
                    <ion-icon :icon="arrowForwardCircleOutline" slot="end"></ion-icon>
                    Crear mi cuenta
                </ion-button>
            </section>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonImg, IonToolbar, IonTitle, IonButtons, IonThumbnail, IonContent,  IonListHeader, IonIcon, IonInput, IonSelect, IonSelectOption, IonModal, IonDatetime, IonDatetimeButton, IonButton, IonList, IonItem, IonLabel, IonProgressBar, toastController, alertController } from '@ionic/vue';
import { defineComponent, nextTick, onMounted, reactive, ref } from 'vue';
import { briefcaseOutline,  trashBinOutline, camera, cameraOutline, qrCodeOutline, ticketOutline, checkmarkCircleOutline, arrowForwardCircleOutline, cash } from 'ionicons/icons';
import { DialogEventEmitter } from "../../utils/Dialog/Dialog";
import { vMaska } from "maska";
import { EReportType } from '@/interfaces/ReportInterfaces';
import { values } from 'lodash';
import { DateTime } from 'luxon';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { Session } from '@/utils/Session/Session';
import * as EmailValidator from 'email-validator';


const isLoading = ref<boolean>(false);
const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    }
});
const dynamicData = ref<{
    name: string,
    username: string,
    email: string,
    password: string,
    repeatPassword: string
}>({
    name: '',
    username: '',
    email: '',
    password: '',
    repeatPassword: ''
});

const onEvents = {
    onUsernameInput: (event:any) => {
        const usernameEntered = event.srcElement.value;

        if (usernameEntered.length > 0){
            dynamicData.value.username = usernameEntered.replace(/[^a-zA-Z0-9]/g, '');
        }
    },
    onUsernameBlur: (event:any) => {
        onEvents.onUsernameInput(event);
    },
    onEmailInput: (event:any) => {
        const emailEntered = event.srcElement.value;

        if (emailEntered.length > 0){
            dynamicData.value.email = emailEntered.replace(/[^a-zA-Z0-9@.]/g, '');
        }
    },
    onEmailBlur: (event:any) => {
        onEvents.onEmailInput(event);
    }
}


const createNewAccount = async () => {
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
        username: dynamicData.value.username,
        email: dynamicData.value.email,
        password: dynamicData.value.password
    }

    RequestAPI.post('/users', dataParsed).then((response) => {
        alertController.create({
            header: '¡Éxito!',
            message: 'Usuário creado exitosamente',
            buttons: ['OK']
        }).then(async (alert) => {
            await alert.present();
            await alert.onDidDismiss();

            props.emitter.fire('created', {
                username: dataParsed.username,
                password: dataParsed.password
            });
            props.emitter.fire('close');
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
        errors.push("Por favor, ingresa sus nombres y apellidos");
    }
    if (dynamicData.value.username.trim().length == 0){
        errors.push("Por favor, ingresa un nombre de usuario");
    }
    if (dynamicData.value.email.trim().length == 0){
        errors.push("Por favor, ingresa un correo electrónico");
    }
    if (!EmailValidator.validate(dynamicData.value.email.trim())){
        errors.push("Por favor, ingresa un correo electrónico válido");
    }
    if (dynamicData.value.password.trim().length < 8){
        errors.push("Por favor, ingresa una contraseña de al menos 8 caracteres");
    }
    if (dynamicData.value.password.trim().length == 0){
        errors.push("Por favor, ingresa una contraseña");
    }
    if (dynamicData.value.repeatPassword.trim().length == 0){
        errors.push("Por favor, repite la contraseña");
    }
    if (dynamicData.value.password.trim() != dynamicData.value.repeatPassword.trim()){
        errors.push("Las contraseñas no coinciden");
    }

    return {
        isValid: errors.length == 0,
        errors: errors
    }
}
</script>

<style scoped lang="scss">
</style>