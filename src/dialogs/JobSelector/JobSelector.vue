<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Elegir Job</ion-title>
            </ion-toolbar>
            <ion-toolbar>
                <ion-searchbar v-model="dynamicData.search" :animated="true" placeholder="Buscar Job"></ion-searchbar>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <ion-list>
                <ion-item button v-for="job in jobs" @click="selectJob(job)" :key="job.code">
                    <ion-label>
                        <h2>{{ job.name }}</h2>
                        <p>{{ job.code }}</p>
                    </ion-label>
                    <ion-icon v-if="selectedJobCode && selectedJobCode == job.code" color="primary" :icon="checkmarkOutline" slot="end"></ion-icon>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonImg, IonToolbar, IonSearchbar, IonTitle, IonButtons, IonThumbnail, IonContent,  IonListHeader, IonIcon, IonInput, IonSelect, IonSelectOption, IonModal, IonDatetime, IonDatetimeButton, IonButton, IonList, IonItem, IonLabel, IonProgressBar, toastController, alertController } from '@ionic/vue';
import { computed, defineComponent, nextTick, onMounted, reactive, ref } from 'vue';
import { briefcaseOutline,  trashBinOutline, checkmarkOutline, camera, cameraOutline, qrCodeOutline, ticketOutline, checkmarkCircleOutline, arrowForwardCircleOutline, cash } from 'ionicons/icons';
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
import { IJob } from '@/interfaces/JobsAndExpensesInterfaces';


const isLoading = ref<boolean>(true);
const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
    includeDisabledJobs: {
        type: Boolean,
        required: true
    },
    selectedJobCode: {
        type: String,
        required: false
    },
    jobsFilterCallback: {
        type: Function,
        required: false
    }
});

const jobsDatas = ref<Array<IJob>>([]);

const selectJob = (job: IJob) => {
    props.emitter.fire('selected', job);
    props.emitter.fire('close');
}

const jobs = computed<Array<IJob>>(() => {
    let jobsList = jobsDatas.value;
    if (props.jobsFilterCallback){
        jobsList = jobsList.filter((job) => {
            return props.jobsFilterCallback(job);
        });
    }

    let searchContent = dynamicData.value.search.toLowerCase().trim();
    if (searchContent.length == 0){
        return jobsList;
    }

    return jobsList.filter((job) => {
        return job.name.toLowerCase().includes(searchContent) || job.code.toLowerCase().includes(searchContent);
    });
});

const dynamicData = ref<{
    search: string
}>({
    search: ''
});


onMounted(async () => {
    isLoading.value = true;
    
    if (props.includeDisabledJobs){
        jobsDatas.value =  (await JobsAndExpenses.getJobs() as unknown as Array<IJob>);
    }else{
        jobsDatas.value =  (await JobsAndExpenses.getJobs() as unknown as Array<IJob>).filter((job) => {
            return job.state == "Active"
        });
    }

    isLoading.value = false;
});
</script>

<style scoped lang="scss">
</style>