<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Elegir Usuários</ion-title>

                <ion-buttons slot="end" v-if="allowMultipleChoice">
                    <ion-button @click="selectWorkers()">Listo</ion-button>
                </ion-buttons>
            </ion-toolbar>
            <ion-toolbar>
                <ion-searchbar v-model="dynamicData.search" :animated="true" placeholder="Buscar Usuário"></ion-searchbar>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <ion-list>
                <ion-item button v-for="worker in workers" @click="selectWorker(worker)" :key="worker.id">
                    <ion-label>
                        <h2><b>{{ worker.name }}</b></h2>
                    </ion-label>
                    <ion-icon v-if="(selectedUserId && selectedUserId == worker.id) || (allowMultipleChoice ? selectedWorkers.find((item) => {return item.id == worker.id}) : false)" color="primary" :icon="checkmarkOutline" slot="end"></ion-icon>
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


import { Toolbox } from '@/utils/Toolbox/Toolbox';
import { IWorker } from '@/interfaces/WorkerInterfaces';
import _ from 'lodash';

const {isLoading, startLoading } = Toolbox.useIsLoading();

const workersData = ref<Array<IWorker>>([]);

const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
    usersFilterCallback: {
        type: Function,
        required: false
    },
    selectedUserId: {
        type: String,
        required: false
    },
    allowMultipleChoice: {
        type: Boolean,
        required: false,
        default: false
    },
    selectedUsersIds: {
        type: Array,
        required: false
    }
});
const dynamicData = ref<{
    search: string
}>({
    search: ''
});


const selectedWorkers = ref<Array<any>>([]);

const selectWorker = (worker: IUser) => {
    if (!props.allowMultipleChoice){
        props.emitter.fire('selected', worker);
        props.emitter.fire('close');
        return;
    }

    if (selectedWorkers.value.includes(worker)){
        selectedWorkers.value = selectedWorkers.value.filter((selectedWorker) => {
            return selectedWorker.id != worker.id;
        });
    } else {
        selectedWorkers.value.push(worker);
    }
}
const selectWorkers = () => {
    props.emitter.fire('selected', selectedWorkers.value);
    props.emitter.fire('close');
}

const workers = computed<Array<IUser>>(() => {
    let workersList = workersData.value;
    if (props.usersFilterCallback){
        workersList = workersList.filter((worker) => {
            return props.usersFilterCallback(worker);
        });
    }
    if (dynamicData.value.search.length > 0){
        workersList = workersList.filter((worker) => {
            return worker.name.toLowerCase().includes(dynamicData.value.search.toLowerCase()) || worker.username.toLowerCase().includes(dynamicData.value.search.toLowerCase());
        });
    }
    return workersList;
});




onMounted(async () => {
    startLoading(async () => {
        workersData.value = await RequestAPI.get('/users');
        if (!props.selectedUsersIds) return;
        selectedWorkers.value = props.selectedUsersIds.map((id) => {
            return workersData.value.find((worker) => {
                return worker.id == id;
            });
        });
    })
});
</script>

<style scoped lang="scss">
</style>