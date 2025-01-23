<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Nuevo Reporte</ion-title>
                <ion-buttons slot="end">    
                    <ion-button @click="createNewReport">Crear</ion-button>
                </ion-buttons>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <ion-list :inset="true">
                <ion-item>
                    <ion-select label="Tipo de documento" label-placement="stacked" interface="action-sheet" v-model="dynamicData.type" :disabled="isLoading">
                        <ion-select-option value="Bill">Boletas</ion-select-option>
                        <ion-select-option value="Facture">Facturas</ion-select-option>
                    </ion-select>
                </ion-item>

                <ion-item>
                    <ion-select label="Tipo de moneda" label-placement="stacked" interface="action-sheet" v-model="dynamicData.moneyType" :disabled="isLoading">
                        <ion-select-option value="PEN">Soles (S/.)</ion-select-option>
                        <ion-select-option value="USD">Dólares ($)</ion-select-option>
                        <ion-select-option value="BRL">Reales (R$)</ion-select-option>
                        <ion-select-option value="PYG">Guaranies (₲)</ion-select-option>
                    </ion-select>
                </ion-item>

                <ion-item>
                    <ion-select label="País" label-placement="stacked" interface="action-sheet" v-model="dynamicData.country" :disabled="isLoading">
                        <ion-select-option value="PE">Perú 🇵🇪</ion-select-option>
                        <ion-select-option value="BR">Brasil 🇧🇷</ion-select-option>
                        <ion-select-option value="PY">Paraguay 🇵🇾</ion-select-option>
                        <ion-select-option value="US">EE. UU. 🇺🇸</ion-select-option>
                    </ion-select>
                </ion-item>


                <ion-item>
                    <ion-select label="Zona:" label-placement="stacked" interface="action-sheet" v-model="dynamicData.zone" :disabled="isLoading">
                        <ion-select-option v-for="zone in  _.uniq(jobsAndExpenses.jobs.map(job => job.zone))">{{ zone }}</ion-select-option>
                    </ion-select>
                </ion-item>

                <ion-item v-if="false">
                    <ion-label position="stacked">Fecha de Inicio</ion-label>
                    <input class="native-input sc-ion-input-ios" v-maska data-maska="##/##/####" v-model="dynamicData.startDate" :disabled="isLoading">
                </ion-item>
                <ion-item v-if="false">
                    <ion-label position="stacked">Fecha de Término</ion-label>
                    <input class="native-input sc-ion-input-ios" v-maska data-maska="##/##/####" v-model="dynamicData.endDate" :disabled="isLoading">
                </ion-item>

                <ion-item>
                    <ion-input label="Nombre del reporte" label-placement="stacked" placeholder="Nombre del reporte"  v-model="dynamicTitle" :disabled="isLoading"></ion-input>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonImg, IonToolbar, IonTitle, IonButtons, IonThumbnail, IonContent,  IonListHeader, IonIcon, IonInput, IonSelect, IonSelectOption, IonModal, IonDatetime, IonDatetimeButton, IonButton, IonList, IonItem, IonLabel, IonProgressBar, toastController, alertController } from '@ionic/vue';
import { defineComponent, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { briefcaseOutline, trashBinOutline, camera, cameraOutline, qrCodeOutline, ticketOutline, checkmarkCircleOutline, arrowForwardCircleOutline, cash } from 'ionicons/icons';
import { DialogEventEmitter } from "../../utils/Dialog/Dialog";
import { vMaska } from "maska";
import { ECountryType, EMoneyType, EReportStatus, EReportType, IReport } from '@/interfaces/ReportInterfaces';
import { DateTime } from 'luxon';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { Session } from '@/utils/Session/Session';
import { IReportResponse, StoredReports } from '@/utils/Stored/StoredReports';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import _ from 'lodash';
import { IExpense, IJob } from '@/interfaces/JobsAndExpensesInterfaces';
import { JobsAndExpenses } from '@/utils/Stored/JobsAndExpenses';

const isLoading = ref<boolean>(false);
const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    }
});
const dynamicData = ref<{
    type: EReportType,
    startDate: string,
    endDate: string,
    moneyType: EMoneyType,
    country: ECountryType,
    zone: string
}>({
    type: EReportType.Bill,
    moneyType: EMoneyType.PEN,
    startDate: (DateTime.now().set({ day: 1}).toFormat("dd/MM/yyyy") as unknown as string).toString(),
    endDate: (DateTime.now().set({ day: 1}).plus({ month: 1}).minus({ day: 1}).toFormat("dd/MM/yyyy") as unknown as string).toString(),
    country: ECountryType.PE,
    zone: 'NoZone'
});
const dynamicTitle = ref('');

const jobsAndExpenses = ref<{jobs: Array<IJob>, expenses: Array<IExpense>}>({
    jobs: [],
    expenses: []
});

const loadJobsAndExpenses = async () => {
    const jobs =  await JobsAndExpenses.getJobs() as unknown as Array<IJob>;
    jobsAndExpenses.value.jobs = jobs.filter((job) => {
        return job.state == "Active"
    });

    const expenses = await JobsAndExpenses.getExpenses() as unknown as Array<IExpense>;
    jobsAndExpenses.value.expenses = expenses;

    nextTick(() => {
        dynamicData.value.zone = jobsAndExpenses.value.jobs[0].zone;
    });
}


const createNewReport = async () => {
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

    const reportData:IReportResponse = {
        id: 0,
        title: dynamicTitle.value,
        type: dynamicData.value.type,
        money_type: dynamicData.value.moneyType,
        country: dynamicData.value.country,
        zone: dynamicData.value.zone,
        from_date: DateTime.fromFormat(dynamicData.value.startDate, "dd/MM/yyyy").toISO() as string,
        to_date: DateTime.fromFormat(dynamicData.value.endDate, "dd/MM/yyyy").toISO() as string,
        status: EReportStatus.Draft,
        user_id: (await Session.getCurrentSession())?.id() as unknown as number,
        created_at: DateTime.now().toISO() as string,
        updated_at: DateTime.now().toISO() as string,
        exported_pdf: null,
        rejection_reason: null,
        rejected_at: null,
        approved_at: null,
        submitted_at: null,
        invoices: {
            count: 0,
            total_amount: 0,
        }
    }
    StoredReports.addReport(reportData).then((report:IReportResponse) => {
        props.emitter.fire('created', {
            ...report
        });
        toastController.create({
            message: '✅ Reporte creado con éxito',
            duration: 2000
        }).then((toast) => {
            toast.present();
        })
        props.emitter.fire('close');
    }).catch((e) => {
        alertController.create({
            header: 'Oops...',
            message: e.getMessage(),
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

    if (dynamicTitle.value.trim().length == 0){
        errors.push("El nombre del reporte no puede estar vacío");
    }

    if (dynamicData.value.zone.trim().length == 0){
        errors.push("Por favor, selecciona una zona");
    }

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

    return {
        isValid: errors.length == 0,
        errors: errors
    }
}

/* watch(dynamicData, (newValue) => {
    dynamicTitle.value = generateDefaultTitle();
}, { deep: true });
 */
/* const generateDefaultTitle = () => {
    return (() => {
        try {
            const startDate = DateTime.fromFormat(dynamicData.value.startDate, "dd/MM/yyyy");
            //Use Intl and get the month name in es-PE:
            const monthName = new Intl.DateTimeFormat('es-PE', { month: 'long'}).formatToParts(startDate.toJSDate())[0].value;
            const moneyName = Toolbox.moneyName(dynamicData.value.moneyType);
            //The report title will be: "Boletas Enero 2021":
            return `${monthName} - ${dynamicData.value.type == EReportType.Bill ? 'Boletas' : 'Facturas'} en ${moneyName.toLowerCase()}`;
        } catch (error) {
            return dynamicTitle.value;
        }
    })();
}

dynamicTitle.value = generateDefaultTitle(); */


onMounted(() => {
    loadJobsAndExpenses();
})
</script>

<style scoped lang="scss">
</style>