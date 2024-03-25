<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Nueva Asistencia</ion-title>
                <ion-buttons slot="end">    
                    <ion-button @click="createNewAttendance">Crear</ion-button>
                </ion-buttons>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <ion-list-header>Datos de la Asistencia</ion-list-header>
            <ion-list :inset="true">
                <ion-item>
                    <ion-label position="stacked">Fecha de Inicio</ion-label>
                    <input class="native-input sc-ion-input-ios" v-maska data-maska="##/##/####" v-model="dynamicData.startDate" :disabled="isLoading">
                </ion-item>
                <ion-item>
                    <ion-label position="stacked">Fecha de Término</ion-label>
                    <input class="native-input sc-ion-input-ios" v-maska data-maska="##/##/####" v-model="dynamicData.endDate" :disabled="isLoading">
                </ion-item>
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

            <ion-list-header>Trabajadores Involuncrados:</ion-list-header>
            <ion-list :inset="true">
                <ion-item-group v-for="team in workersTeamsList" :key="team.team">
                    <ion-item-divider>
                        <ion-label>EQUIPO {{ team.team }}</ion-label>
                    </ion-item-divider>
                    <ion-item v-for="worker in team.workers" :key="worker.dni">
                        <ion-checkbox justify="space-between" v-model="worker.isSelected">{{worker.name}}</ion-checkbox>
                    </ion-item>
                </ion-item-group>

                <!--Generate 20 skeletons:-->
                <ion-skeleton-text v-for="i in 20" :key="i" animated style="height: 40px" v-if="workersTeamsList.length == 0"></ion-skeleton-text>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonImg, IonSkeletonText, IonItemGroup, IonCheckbox, IonItemDivider, IonToolbar, IonTitle, IonButtons, IonThumbnail, IonContent,  IonListHeader, IonIcon, IonInput, IonSelect, IonSelectOption, IonModal, IonDatetime, IonDatetimeButton, IonButton, IonList, IonItem, IonLabel, IonProgressBar, toastController, alertController } from '@ionic/vue';
import { computed, defineComponent, nextTick, onMounted, reactive, ref } from 'vue';
import { briefcaseOutline, trashBinOutline, camera, cameraOutline, qrCodeOutline, ticketOutline, checkmarkCircleOutline, arrowForwardCircleOutline, cash } from 'ionicons/icons';
import { DialogEventEmitter } from "../../utils/Dialog/Dialog";
import { vMaska } from "maska";
import { EMoneyType, EReportStatus, EReportType, IReport } from '@/interfaces/ReportInterfaces';
import { DateTime } from 'luxon';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { Session } from '@/utils/Session/Session';
import { IReportResponse, StoredReports } from '@/utils/Stored/StoredReports';
import { JobsAndExpenses } from '@/utils/Stored/JobsAndExpenses';
import { IJob, IExpense } from '../../interfaces/JobsAndExpensesInterfaces';

const isLoading = ref<boolean>(false);
const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    }
});
const dynamicData = ref<{
    startDate: string,
    endDate: string,
    jobCode: number|null,
    expenseCode: number|null,
    description: string
}>({
    description: '',
    jobCode: null,
    expenseCode: null,
    startDate: (DateTime.now().set({ day: 1}).toFormat("dd/MM/yyyy") as unknown as string).toString(),
    endDate: (DateTime.now().set({ day: 1}).plus({ month: 1}).minus({ day: 1}).toFormat("dd/MM/yyyy") as unknown as string).toString()
});

const workersTeamsList = ref<Array<{team: string, workers: [{dni: string, name: string, isSelected: boolean}]}>>([]);
const jobsAndExpenses = ref<{jobs: Array<IJob>, expenses: Array<IExpense>}>({
    jobs: [],
    expenses: []
});

const selectedWorkers = computed<Array<{dni: string, name: string, isSelected: boolean}>>(() => {
    let workersSelected:Array<{dni: string, name: string, isSelected: boolean}> = [];

    workersTeamsList.value.forEach((team) => {
        team.workers.forEach((worker) => {
            if (worker.isSelected){
                workersSelected.push(worker);
            }
        });
    });
    return workersSelected;
});

const createNewAttendance = async () => {
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
    RequestAPI.post('/attendances-with-workers', {
        user_id: (await Session.getCurrentSession())?.id(),
        description: dynamicData.value.description.length > 0 ? dynamicData.value.description : null,
        job_code: dynamicData.value.jobCode,
        expense_code: dynamicData.value.expenseCode,
        from_date: DateTime.fromFormat(dynamicData.value.startDate, "dd/MM/yyyy").toISO(),
        to_date: DateTime.fromFormat(dynamicData.value.endDate, "dd/MM/yyyy").toISO(),
        workers_dni: selectedWorkers.value.map((worker) => worker.dni)
    }).then((response) => {
        props.emitter.fire('created', {
            ...response.attendance
        });
        toastController.create({
            message: '✅ Asistencia creada con éxito!',
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
    const isStartDateValid = DateTime.fromFormat(dynamicData.value.startDate, "dd/MM/yyyy").isValid;
    const isEndDateValid = DateTime.fromFormat(dynamicData.value.endDate, "dd/MM/yyyy").isValid;

    if (!isStartDateValid){
        errors.push(DateTime.fromFormat(dynamicData.value.startDate, "dd/MM/yyyy").invalidExplanation);
    }
    if (!isEndDateValid){
        errors.push(DateTime.fromFormat(dynamicData.value.endDate, "dd/MM/yyyy").invalidExplanation);
    }

    if (isStartDateValid && isEndDateValid){
        const startDate = DateTime.fromFormat(dynamicData.value.startDate, "dd/MM/yyyy");
        const endDate = DateTime.fromFormat(dynamicData.value.endDate, "dd/MM/yyyy");

        if (startDate > endDate){
            errors.push("La fecha de inicio no puede ser mayor a la fecha de término");
        }
    }

    if (dynamicData.value.jobCode == null){
        errors.push("Debes seleccionar un Job");
    }
    if (dynamicData.value.expenseCode == null){
        errors.push("Debes seleccionar un Expense");
    }

    if (selectedWorkers.value.length == 0){
        errors.push("Debes seleccionar al menos un trabajador");
    }

    return {
        isValid: errors.length == 0,
        errors: errors
    }
}

const loadWorkersTeamsList = async () => {
    const workersTeamsListFetched = await RequestAPI.get('/workers-list');
    const workersTeamsListGrouped = workersTeamsListFetched.filter((worker) => {
        return worker.is_active
    }).reduce((acc, worker) => {
        const team = worker.team;
        const workerData = {
            dni: worker.dni,
            name: worker.name,
            isSelected: false
        }

        if (acc[team] == undefined){
            acc[team] = {
                team: team,
                workers: []
            }
        }

        acc[team].workers.push(workerData);

        return acc;
    }, {});

    const workersTeamsListArray = Object.keys(workersTeamsListGrouped).map((key) => {
        return workersTeamsListGrouped[key];
    });
    
    workersTeamsList.value = workersTeamsListArray;
}
const loadJobsAndExpenses = async () => {
    const jobs =  await JobsAndExpenses.getJobs() as unknown as Array<IJob>;
    jobsAndExpenses.value.jobs = jobs;

    const expenses = await JobsAndExpenses.getExpenses() as unknown as Array<IExpense>;
    jobsAndExpenses.value.expenses = expenses;
}

loadJobsAndExpenses();
loadWorkersTeamsList();

</script>

<style scoped lang="scss">
</style>