<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button :disabled="isLoading" @click="emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Ingreso de Productos</ion-title>
                <ion-buttons slot="end">
                    <ion-button>Crear</ion-button>
                </ion-buttons>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <article>
                <ion-accordion-group ref="accordionGroupEl">
                    <ion-accordion value="first">
                        <ion-item slot="header" color="light">
                            <ion-label>1. Datos de la compra</ion-label>
                        </ion-item>
                        <section slot="content">

                            <header>
                                <ion-list v-if="dynamicData.uploadedImageBase64">
                                    <ion-item> 
                                        <ion-img slot="start" style="height: 80px;" v-if="dynamicData.uploadedImageBase64" :src="'data:image/jpeg;base64,' + dynamicData.uploadedImageBase64"></ion-img>
                                        <ion-button slot="end" fill="clear" color="danger" @click="deleteImageFromCamera"> 
                                                Borrar Foto
                                            <ion-icon slot="start" :icon="trashBinOutline"></ion-icon>
                                        </ion-button>
                                    </ion-item>
                                </ion-list>
                                <article class="ion-padding" v-if="!dynamicData.uploadedImageBase64" style="display: flex; align-content: center; justify-content: space-between;">
                                    <ion-button expand="block" fill="outline" @click="openCamera()" style="width: 100%;" v-if="!dynamicData.isLoadingImageCompression"> 
                                        <ion-icon slot="start" :icon="camera"></ion-icon>
                                        Tomar Foto de la Boleta
                                    </ion-button>
                                    <ion-button fill="outline" @click="openCamera(true)" v-if="!dynamicData.isLoadingImageCompression"> 
                                        <ion-icon :icon="attachOutline"></ion-icon>
                                    </ion-button>
                                    <ion-progress-bar v-if="dynamicData.isLoadingImageCompression" type="indeterminate"></ion-progress-bar>
                                </article>
                            </header>

                            



                            <ion-list>
                                <ion-item>
                                    <ion-input label="Código QR" label-placement="stacked" placeholder="" v-model="warehouseIncome.qrcode_data"></ion-input>
                                    <ion-button slot="end" fill="clear" @click="openQRCodeScanner"> 
                                        Scanear QR
                                        <ion-icon slot="start" :icon="qrCodeOutline"></ion-icon>
                                    </ion-button>
                                </ion-item>
                                <ion-item>
                                    <ion-input label="Observaciones:" label-placement="stacked" placeholder="Ej.: material para construcción" v-model="warehouseIncome.description"></ion-input>
                                </ion-item>
                                <ion-accordion-group ref="datetimeAccordionGroupEl">
                                    <ion-accordion value="start" ref="datetimeAccordion" class="datetime-accordion">
                                        <ion-item lines="inset" slot="header">
                                            <ion-input label="Fecha" label-placement="stacked" placeholder="10/10/2023" v-model="warehouseIncome.date" :readonly="true"></ion-input>
                                        </ion-item>
                                        <ion-datetime slot="content" presentation="date" v-model="dynamicData.datetimePickerDate" @ion-change="onDatePickerChange"></ion-datetime>
                                    </ion-accordion>
                                </ion-accordion-group>
                                <ion-item>
                                    <ion-label position="stacked">Valor:</ion-label>
                                    <CurrencyInput ref="currencyInputEl" class="native-input sc-ion-input-ios" v-model="warehouseIncome.amount" :options="{ currency: warehouseIncome.currency, currencyDisplay: 'narrowSymbol', autoDecimalDigits: false, locale: 'es-PE', hideCurrencySymbolOnFocus: false, precision: 2}"></CurrencyInput>
                                </ion-item>
                                <ion-item>
                                    <ion-input :label="'Código de Boleta/Factura:'" label-placement="stacked" placeholder="AAXX-XXXXXXXX" v-model="warehouseIncome.ticket_number"></ion-input>
                                </ion-item>
                                <ion-item>
                                    <ion-input label="RUC:" label-placement="stacked" placeholder="XXXXXXXXXXX" v-model="warehouseIncome.commerce_number"  inputmode="numeric"></ion-input>
                                </ion-item>
                            </ion-list>

                            <ion-list>
                                <ion-item button @click="(e) => {openJobSelector(); e.stopPropagation()}">
                                    <ion-input :readonly="true" label="Job:" label-placement="stacked" placeholder="Selecciona el Job" v-model="warehouseIncome.job_code"></ion-input>
                                </ion-item>
                                <ion-item button @click="(e) => {openExpenseSelector(); e.stopPropagation()}">
                                    <ion-input :readonly="true" label="Expense:" label-placement="stacked" placeholder="Selecciona el Expense" v-model="warehouseIncome.expense_code"></ion-input>
                                </ion-item>
                            </ion-list>


                            

                            
                        </section>
                    </ion-accordion>
                    <ion-accordion value="second">
                        <ion-item slot="header" color="light">
                            <ion-label>2. Productos</ion-label>
                        </ion-item>
                        <section slot="content">
                            
                        </section>
                    </ion-accordion>
                </ion-accordion-group>
            </article>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonImg, IonToolbar, IonTitle,IonButtons, IonThumbnail, IonAccordion, IonAccordionGroup, IonContent, IonListHeader, IonIcon, IonInput, IonSelect, IonSelectOption, IonModal, IonDatetime, IonDatetimeButton, IonButton, IonList, IonItem, IonLabel, IonProgressBar, IonText, toastController, alertController, actionSheetController } from '@ionic/vue';
import { computed, defineComponent, nextTick, onMounted, reactive, ref } from 'vue';
import { EInvoiceType, IInvoice, INewInvoice } from '../../interfaces/InvoiceInterfaces';
import { IJob, IExpense, EExpenseUses } from '../../interfaces/JobsAndExpensesInterfaces';
import { briefcaseOutline, trashBinOutline, camera, cameraOutline, arrowForward, qrCodeOutline, ticketOutline, checkmarkCircleOutline, arrowForwardCircleOutline, cash, attachOutline, addOutline, removeCircleOutline } from 'ionicons/icons';

import { QRCodeScanner } from '@/dialogs/QRCodeScanner/QRCodeScanner';
import { vMaska } from "maska";
import { DateTime } from "luxon";
import { QRCodeParser } from '@/utils/QRCodeParser/QRCodeParser';
import CurrencyInput from '@/components/CurrencyInput/CurrencyInput.vue';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { Dialog, DialogEventEmitter } from '@/utils/Dialog/Dialog';
import { TStorage } from '@/utils/Toolbox/TStorage';

import { BarcodeDetect }  from '@/utils/BarcodeDetect/BarcodeDetect';
import {
    BarcodeScanner,
    BarcodeFormat,
    LensFacing,
} from '@capacitor-mlkit/barcode-scanning';
import imageCompression from 'browser-image-compression';
import { DocumentScanner } from 'capacitor-document-scanner'
import { Capacitor } from '@capacitor/core';
import { StoredInvoices } from '@/utils/Stored/StoredInvoices';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { PDFModifier } from '@/utils/PDFModifier/PDFModifier';
import { CurrencyFly } from '@/utils/CurrencyFly/CurrencyFly';
import { StoredReports } from '@/utils/Stored/StoredReports';
import { IReport } from '@/interfaces/ReportInterfaces';
import JobSelector from '@/dialogs/JobSelector/JobSelector.vue';
import ExpenseSelector from '@/dialogs/ExpenseSelector/ExpenseSelector.vue';
import { INewWarehouseIncome } from '@/interfaces/InventoryInterfaces';
import { ImagePicker } from '@/utils/Camera/ImagePicker';





const datetimeAccordionGroupEl = ref<any>(null);
const currencyInputEl = ref<CurrencyInput|null>(null);
const accordionGroupEl = ref<any>(null);
const isLoading = ref<boolean>(true);


const dynamicData = ref<{
    uploadedImageBase64: null | string,
    datetimePickerDate: string,
    isLoadingImageCompression: boolean,
}>({
    uploadedImageBase64: null,
    isLoadingImageCompression: false,
    datetimePickerDate: DateTime.now().toISODate() as unknown as string,
})
const props = defineProps({
    warehouseId: {
        type: Number,
        required: true
    },
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
});

const warehouseIncome = ref<INewWarehouseIncome>({
    inventory_warehouse_id: props.warehouseId,
    description: "",
    date: DateTime.now().toFormat("dd/MM/yyyy").toString(),
    ticket_number: "",
    commerce_number: "",
    amount: 0,
    currency: "PEN",
    qrcode_data: "",
    job_code: "",
    expense_code: "",
    image: ""
});


const onDatePickerChange = (event: CustomEvent) => {
    const date = event.detail.value.split('T')[0];
    const formatted = DateTime.fromFormat(date, "yyyy-MM-dd").toFormat("dd/MM/yyyy").toString();

    const previousDate = DateTime.fromFormat(invoice.value.date, "dd/MM/yyyy");
    const newDate = DateTime.fromFormat(formatted, "dd/MM/yyyy");

    invoice.value.date = formatted;

    //Check if the day of the month is the same:
    if (previousDate.day == newDate.day){
        return;
    }else{
        datetimeAccordionGroupEl.value.$el.value = undefined;
    }
}

const setBarcodeData = (qrCodeContent:string) => {
    const response = QRCodeParser.parseBuyCode(qrCodeContent);

    if (!response.isValid || !response.content){
        toastController.create({
            message: "❌ El código QR no es válido",
            duration: 2000
        }).then((toast) => {
            toast.present();
        })
        return;
    }

    warehouseIncome.value.qrcode_data = response.qrCode;
    warehouseIncome.value.ticket_number = response.content.docCode;
    
    warehouseIncome.value.commerce_number = response.content.ruc;
    warehouseIncome.value.amount = parseFloat(response.content.price).toFixed(2) as unknown as number;
    currencyInputEl.value.$el.value = `${warehouseIncome.value.amount}`;

    if (response.content.date){
        const ticketDate = DateTime.fromFormat(response.content.date, "yyyy-MM-dd");
        warehouseIncome.value.date = ticketDate.toFormat("dd/MM/yyyy");
        dynamicData.value.datetimePickerDate = ticketDate.toISODate() as unknown as string;
    }
}
const openQRCodeScanner = async () => {
    QRCodeScanner.open().onScan().then((content) => {
        setBarcodeData(content);
    })
}
const openCamera = async (forceFromGallery: boolean = false) => {
    const response = await ImagePicker.loadInvoiceDocument({
        forceFromGallery
    })

    dynamicData.value.uploadedImageBase64 = response.image;

    if (response.barcode){
        setBarcodeData(response.barcode);
    }
}
const deleteImageFromCamera = () => {
    dynamicData.value.uploadedImageBase64 = null;
}
const validateData = async () => {
    const formErrors: Array<{field: string, message: string}> = [];

    if (!dynamicData.value.uploadedImageBase64){
        formErrors.push({
            field: "image",
            message: "La foto de la " + invoiceType + " es requerida"
        })
    }
    if (!invoice.value.date){
        formErrors.push({
            field: "date",
            message: "La fecha es requerida"
        })
    }else{
        const dt = DateTime.fromFormat(invoice.value.date, "dd/MM/yyyy");
        if (!dt.isValid){
            formErrors.push({
                field: "date",
                message: "La fecha no es válida " + dt.invalidExplanation
            })
        }
    }
    if (!invoice.value.amount){
        formErrors.push({
            field: "amount",
            message: "El monto es requerido"
        })
    }
    if (!invoice.value.ticket_number || invoice.value.ticket_number.trim().length == 0){
        formErrors.push({
            field: "ticket_number",
            message: "El número de " +invoiceType.value+ " es requerido"
        })
    }
    if (!invoice.value.commerce_number || invoice.value.commerce_number.trim().length == 0){
        formErrors.push({
            field: "commerce_number",
            message: "El RUC es requerido"
        })
    }
    if (!invoice.value.job_code){
        formErrors.push({
            field: "job_code",
            message: "El Job es requerido"
        })
    }
    if (!invoice.value.expense_code){
        formErrors.push({
            field: "expense_code",
            message: "El Expense es requerido"
        })
    }
    if (!invoice.value.description || invoice.value.description.trim().length == 0){
        formErrors.push({
            field: "description",
            message: "La descripción del gasto es requerida"
        })
    }

    if (formErrors.length > 0){
        return {
            isValid: false,
            errors: formErrors
        };
    }else{
        return {
            isValid: true,
            errors: []
        };
    }
}



const openJobSelector = () => {
    Dialog.show(JobSelector, {
        props: {
            includeDisabledJobs: false
        },
        onLoaded($this) {
            $this.on('selected', (event:any) => {
                const job = event.data;
                warehouseIncome.value.job_code = job.code;
            })
            
        },
    })
}
const openExpenseSelector = () => {
    Dialog.show(ExpenseSelector, {
        props: {
            selectedExpenseCode: warehouseIncome.value.expense_code
        },
        onLoaded($this) {
            $this.on('selected', (event:any) => {
                const expense = event.data;
                warehouseIncome.value.expense_code = expense.code;
            })
            
            $this.on('close', () => {
            })
        },
    })
}


onMounted(async () => {
    isLoading.value = false;
    setTimeout(() => {
        accordionGroupEl.value.$el.value = "first";
    }, 100);
})
</script>

<style scoped lang="scss">
.image-holder{
    display: flex;
    align-items: center;
    justify-content: center;
}

.display-error-holder{
    height: 70px;
}
.display-error{
    position: absolute;
    bottom: 2px;
}

.datetime-accordion{
    &::part(content expanded){
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--ion-color-light-tint);
    }
}
</style>