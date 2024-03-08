<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Datos de la Asistencia</ion-title>
                <ion-buttons slot="end">    
                    <ion-button @click="saveAttendance">Guardar</ion-button>
                </ion-buttons>
                <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-list-header>Datos de la Asistencia</ion-list-header>
            <ion-list :inset="true">
                <ion-item>
                    <ion-select label="Job" label-placement="stacked" interface="action-sheet" placeholder="Selecciona el Job" v-model="dynamicData.jobCode">
                        <ion-select-option v-for="job in jobsAndExpenses.jobs" :value="job.code">{{job.code}} - {{ job.name }}</ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item>
                    <ion-select label="Expense" label-placement="stacked" interface="action-sheet" placeholder="Selecciona el Expense" v-model="dynamicData.expenseCode">
                        <ion-select-option v-for="expense in jobsAndExpenses.expenses" :value="expense.code">{{ expense.code }} - {{ expense.name }}</ion-select-option>
                    </ion-select>                  
                </ion-item>
                <ion-item>
                    <ion-label position="stacked">Descripción</ion-label>
                    <ion-input v-model="dynamicData.description" placeholder="Detalles adicionales" :disabled="isLoading"></ion-input>
                </ion-item>
            </ion-list>

            <article class="ion-padding">
                <ion-button :disable="isLoading" color="danger" expand="block" @click="deleteAttendance">
                    <ion-icon shape="round" size="default" :icon="trashBinOutline" slot="start"></ion-icon>
                    Borrar Asistencia
                </ion-button>
            </article>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonImg, IonSkeletonText, IonItemGroup, IonCheckbox, IonItemDivider, IonToolbar, IonTitle, IonButtons, IonThumbnail, IonContent,  IonListHeader, IonIcon, IonInput, IonSelect, IonSelectOption, IonModal, IonDatetime, IonDatetimeButton, IonButton, IonList, IonItem, IonLabel, IonProgressBar, toastController, alertController } from '@ionic/vue';
import { computed, defineComponent, nextTick, onMounted, reactive, ref } from 'vue';
import { briefcaseOutline, trashBinOutline, camera, cameraOutline,  qrCodeOutline, ticketOutline, checkmarkCircleOutline, arrowForwardCircleOutline, cash } from 'ionicons/icons';
import { DialogEventEmitter } from "../../utils/Dialog/Dialog";
import { vMaska } from "maska";
import { EMoneyType, EReportStatus, EReportType, IReport } from '@/interfaces/ReportInterfaces';
import { DateTime } from 'luxon';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { Session } from '@/utils/Session/Session';
import { IReportResponse, StoredReports } from '@/utils/Stored/StoredReports';
import { JobsAndExpenses } from '@/utils/Stored/JobsAndExpenses';
import { IJob, IExpense } from '../../interfaces/JobsAndExpensesInterfaces';
import { IAttendance } from '../../interfaces/AttendanceInterfaces';

const isLoading = ref<boolean>(false);
const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
    attendance: {
        type: Object as () => IAttendance,
        required: true
    }
});
const dynamicData = ref<{
    jobCode: number|null,
    expenseCode: number|null,
    description: string
}>({
    description: props.attendance.description,
    jobCode: props.attendance.job_code,
    expenseCode: props.attendance.expense_code
});

const jobsAndExpenses = ref<{jobs: Array<IJob>, expenses: Array<IExpense>}>({
    jobs: [],
    expenses: []
});

const saveAttendance = async () => {
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
    RequestAPI.put('/attendances/' + props.attendance.id, {
        description: dynamicData.value.description,
        job_code: dynamicData.value.jobCode,
        expense_code: dynamicData.value.expenseCode
    }).then((response) => {
        props.emitter.fire('updated', {
            ...response.attendance
        });
        toastController.create({
            message: '✅ Asistencia actualizada con éxito!',
            duration: 2000
        }).then((toast) => {
            toast.present();
        })
        props.emitter.fire('close');
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

const validateCamps = () => {
    let errors = [];

    if (dynamicData.value.jobCode == null){
        errors.push("Debes seleccionar un Job");
    }
    if (dynamicData.value.expenseCode == null){
        errors.push("Debes seleccionar un Expense");
    }

    return {
        isValid: errors.length == 0,
        errors: errors
    }
}

const loadJobsAndExpenses = async () => {
    const jobs =  await JobsAndExpenses.getJobs() as unknown as Array<IJob>;
    jobsAndExpenses.value.jobs = jobs;

    const expenses = await JobsAndExpenses.getExpenses() as unknown as Array<IExpense>;
    jobsAndExpenses.value.expenses = expenses;
}

const deleteAttendance = async () => {
    isLoading.value = true;
    RequestAPI.delete('/attendances/' + props.attendance.id).then((response) => {
        props.emitter.fire('deleted', {
            ...response.attendance
        });
        toastController.create({
            message: '✅ Asistencia eliminada con éxito!',
            duration: 2000
        }).then((toast) => {
            toast.present();
        })
        props.emitter.fire('close');
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

loadJobsAndExpenses();

</script>

<style scoped lang="scss">
</style>