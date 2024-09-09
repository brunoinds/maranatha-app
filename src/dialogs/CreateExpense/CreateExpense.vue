<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Crear Expense</ion-title>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <ion-list>
                <ion-item>
                    <ion-input label="Nombre del Expense" placeholder="Ej.: Gastos Miscelaneos" label-placement="stacked" v-model="dynamicData.name" :disabled="isLoading"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input label="Código de Expense" placeholder="Ej.: 1003" label-placement="stacked" v-model="dynamicData.code" :disabled="isLoading"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-select label="Uso"  label-placement="stacked" v-model="dynamicData.uses" :disabled="isLoading" :multiple="true">
                        <ion-select-option :value="EExpenseUses.Attendances">Asistencias</ion-select-option>
                        <ion-select-option :value="EExpenseUses.Reports">Reportes</ion-select-option>
                        <ion-select-option :value="EExpenseUses.Inventory">Inventário</ion-select-option>
                    </ion-select>
                </ion-item>
            </ion-list>


            <section class="ion-padding">
                <ion-button expand="block" shape="round" size="default" style="height: 50px" @click="createExpense" :disabled="isLoading">
                    <ion-icon :icon="arrowForwardCircleOutline" slot="end"></ion-icon>
                    Crear Expense
                </ion-button>
            </section>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { IonButton, IonButtons, IonContent, IonHeader, IonSelect, IonSelectOption, IonInput,IonIcon, IonItem, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar, alertController, toastController } from '@ionic/vue';
import { ref } from 'vue';
import { DialogEventEmitter } from "../../utils/Dialog/Dialog";
import { arrowForwardCircleOutline } from 'ionicons/icons';
import { EExpenseUses } from '@/interfaces/JobsAndExpensesInterfaces';



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
    uses: Array<string>,
}>({
    name: '',
    code: '',
    uses: [EExpenseUses.Reports, EExpenseUses.Attendances]
});


const createExpense = async () => {
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
        uses: dynamicData.value.uses
    }

    RequestAPI.post('/expenses', dataParsed).then((response) => {
        props.emitter.fire('created', {});
        props.emitter.fire('close');

        toastController.create({
            message: '✅ Expense creado exitosamente',
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
    if (dynamicData.value.uses.length == 0){
        errors.push("Por favor, selecciona al menos un uso para el Expense");
    }

    return {
        isValid: errors.length == 0,
        errors: errors
    }
}
</script>

<style scoped lang="scss">
</style>