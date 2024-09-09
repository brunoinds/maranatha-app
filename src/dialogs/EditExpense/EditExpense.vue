<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Editar Expense</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="saveExpense">Guardar</ion-button>
                </ion-buttons>
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
                    <ion-select label="Uso" label-placement="stacked" v-model="dynamicData.uses" :disabled="isLoading" :multiple="true">
                        <ion-select-option :value="EExpenseUses.Attendances">Asistencias</ion-select-option>
                        <ion-select-option :value="EExpenseUses.Reports">Reportes</ion-select-option>
                        <ion-select-option :value="EExpenseUses.Inventory">Inventário</ion-select-option>
                    </ion-select>
                </ion-item>
            </ion-list>
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
    },
    expenseCode: {
        type: String,
        required: true
    },
    expenseId: {
        type: String,
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


const saveExpense = async () => {
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
        id: props.expenseId,
        name: dynamicData.value.name,
        code: dynamicData.value.code,
        uses: dynamicData.value.uses
    }

    RequestAPI.patch('/expenses/' + props.expenseId, dataParsed).then((response) => {
        props.emitter.fire('created', {});
        props.emitter.fire('close');

        toastController.create({
            message: '✅ Expense guardado exitosamente',
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


const loadExpense = async () => {
    isLoading.value = true;

    const expenses = await RequestAPI.get('/expenses');
    const expense = expenses.find((expense:any) => expense.code == props.expenseCode);
    dynamicData.value.name = expense.name;
    dynamicData.value.code = expense.code;
    dynamicData.value.uses = expense.uses;

    isLoading.value = false;
}

loadExpense();
</script>

<style scoped lang="scss">
</style>