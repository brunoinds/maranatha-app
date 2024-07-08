<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Editar Cuenta</ion-title>

                <ion-buttons slot="end" :disabled="isLoading">
                    <ion-button @click="updateAccount">Guardar</ion-button>
                </ion-buttons>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
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
                <ion-item>
                    <ion-select label="Permisos" label-placement="stacked" v-model="dynamicData.permissions" :disabled="isLoading" :multiple="true">
                        <ion-select-option v-for="permission in userPermissionsAvailable" :value="permission.id">{{ permission.name }}</ion-select-option>
                    </ion-select>
                </ion-item>
            </ion-list>
            <section class="ion-padding">
                <ion-button expand="block" shape="round" size="default" color="danger" style="height: 50px" @click="deleteUser" :disabled="isLoading">
                    <ion-icon :icon="trashBinOutline" slot="end"></ion-icon>
                    Borrar cuenta
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
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { userPermissionsAvailable } from '@/interfaces/UserInterfaces';


const isLoading = ref<boolean>(false);
const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
    account: {
        type: Object,
        required: true
    }
});
const dynamicData = ref<{
    id: number,
    name: string,
    username: string,
    email: string,
    password: string,
    repeatPassword: string,
    permissions: Array<string>,
    roles: Array<string>
}>({
    id: props.account.id,
    name: props.account.name,
    username: props.account.username,
    email: props.account.email,
    password: '',
    repeatPassword: '',
    permissions: props.account.permissions,
    roles: props.account.roles
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


const updateAccount = async () => {
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


    let dataParsed = {
        name: dynamicData.value.name,
        username: dynamicData.value.username,
        email: dynamicData.value.email,
        password: dynamicData.value.password,
        permissions: dynamicData.value.permissions,
        roles: dynamicData.value.roles
    }

    if (dataParsed.name == props.account.name){
        delete dataParsed.name;
    }
    if (dataParsed.username == props.account.username){
        delete dataParsed.username;
    }
    if (dataParsed.email == props.account.email){
        delete dataParsed.email;
    }
    if (dataParsed.password == ''){
        delete dataParsed.password;
    }


    RequestAPI.patch('/users/' + props.account.id, dataParsed).then((response) => {
        alertController.create({
            header: '¡Éxito!',
            message: 'Datos actualizados exitosamente',
            buttons: ['OK']
        }).then(async (alert) => {
            await alert.present();
            await alert.onDidDismiss();
            AppEvents.emit('all:reload');

            props.emitter.fire('updated', {
                
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
    if (dynamicData.value.password.trim().length < 8 && dynamicData.value.password.trim().length > 0){
        errors.push("Por favor, ingresa una contraseña de al menos 8 caracteres");
    }
    if (dynamicData.value.password.trim() != dynamicData.value.repeatPassword.trim()){
        errors.push("Las contraseñas no coinciden");
    }

    return {
        isValid: errors.length == 0,
        errors: errors
    }
}


const deleteUser = async () => {
    alertController.create({
        header: '¿Estás seguro?',
        message: '¿Estás seguro que deseas borrar este usuario y todas las boletas/facturas relacionadas a él? Esta acción no se puede deshacer.',
        buttons: [
            {
                text: 'Cancelar',
                role: 'cancel'
            },
            {
                text: 'Borrar',
                role: 'destructive',
                handler: () => {
                    isLoading.value = true;
                    RequestAPI.delete(`/users/${props.account.id}`).then((response) => {
                        props.emitter.fire('deleted', {
                            
                        });
                        toastController.create({
                            message: '✅ Usuario borrado con éxito',
                            duration: 2000
                        }).then((toast) => {
                            toast.present();
                        })
                        props.emitter.fire('close');
                        AppEvents.emit('all:reload');
                    }).catch((error) => {
                        alertController.create({
                            header: 'Oops...',
                            message: error.response.message,
                            buttons: ['OK']
                        }).then((alert) => {
                            alert.present();
                        });
                    }).finally(() => {
                        isLoading.value = false;
                    });
                }
            }
        ]
    }).then((alert) => {
        alert.present();
    })
}
</script>

<style scoped lang="scss">
</style>