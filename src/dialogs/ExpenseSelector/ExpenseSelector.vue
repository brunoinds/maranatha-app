<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Elegir Expense</ion-title>
            </ion-toolbar>
            <ion-toolbar>
                <ion-searchbar v-model="dynamicData.search" :animated="true" placeholder="Buscar Expense"></ion-searchbar>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <ion-list>
                <ion-item button v-for="expense in expenses" @click="selectExpense(expense)" :key="expense.code">
                    <ion-label>
                        <h2>{{ expense.name }}</h2>
                        <p>{{ expense.code }}</p>
                    </ion-label>

                    <ion-icon v-if="selectedExpenseCode && selectedExpenseCode == expense.code" color="primary" :icon="checkmarkOutline" slot="end"></ion-icon>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonImg, IonToolbar, IonSearchbar, IonTitle, IonButtons, IonThumbnail, IonContent,  IonListHeader, IonIcon, IonInput, IonSelect, IonSelectOption, IonModal, IonDatetime, IonDatetimeButton, IonButton, IonList, IonItem, IonLabel, IonProgressBar, toastController, alertController } from '@ionic/vue';
import { computed, defineComponent, nextTick, onMounted, reactive, ref } from 'vue';
import { briefcaseOutline, checkmarkOutline, trashBinOutline, camera, cameraOutline, qrCodeOutline, ticketOutline, checkmarkCircleOutline, arrowForwardCircleOutline, cash } from 'ionicons/icons';
import { DialogEventEmitter } from "../../utils/Dialog/Dialog";
import { vMaska } from "maska";
import { EReportType } from '@/interfaces/ReportInterfaces';
import { values } from 'lodash';
import { DateTime } from 'luxon';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { Session } from '@/utils/Session/Session';
import * as EmailValidator from 'email-validator';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { JobsAndExpenses } from '@/utils/Stored/JobsAndExpenses';
import { IExpense } from '@/interfaces/JobsAndExpensesInterfaces';


const isLoading = ref<boolean>(true);
const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
    expensesFilterCallback: {
        type: Function,
        required: false
    },
    selectedExpenseCode: {
        type: String,
        required: false
    }
});

const expensesDatas = ref<Array<IExpense>>([]);

const selectExpense = (job: IExpense) => {
    props.emitter.fire('selected', job);
    props.emitter.fire('close');
}

const expenses = computed<Array<IExpense>>(() => {
    let expensesList = expensesDatas.value;
    if (props.expensesFilterCallback){
        expensesList = expensesList.filter((expense) => {
            return props.expensesFilterCallback(expense);
        });
    }



    let searchContent = dynamicData.value.search.toLowerCase().trim();
    if (searchContent.length == 0){
        return expensesList;
    }

    return expensesList.filter((expense) => {
        return expense.name.toLowerCase().includes(searchContent) || expense.code.toLowerCase().includes(searchContent);
    });
});

const dynamicData = ref<{
    search: string
}>({
    search: ''
});


onMounted(async () => {
    isLoading.value = true;
    expensesDatas.value =  (await JobsAndExpenses.getExpenses() as unknown as Array<IExpense>);

    isLoading.value = false;
});
</script>

<style scoped lang="scss">
</style>