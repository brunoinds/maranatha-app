<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button :disabled="isLoading" @click="emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title v-if="readonly">Visualizar {{invoiceType}}</ion-title>
                <ion-title v-if="!readonly">Editar {{invoiceType}}</ion-title>

                <ion-buttons slot="end">
                    <ion-button v-if="!readonly" @click="saveInvoice" :disabled="!(stepsChecks.first && stepsChecks.second && stepsChecks.third) || isLoading">
                        Guardar
                    </ion-button>
                </ion-buttons>
                <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <article>
                <ion-accordion-group ref="accordionGroup">
                    <ion-accordion value="first">
                        <ion-item slot="header" color="light">
                            <ion-label>1. Subir {{invoiceType}}</ion-label>
                            <ion-icon slot="end" :icon="checkmarkCircleOutline" color="success" v-show="stepsChecks.first"></ion-icon>
                        </ion-item>
                        <section slot="content">
                            <ion-progress-bar v-if="isLoadingImage" type="indeterminate"></ion-progress-bar>


                            <ion-img v-if="dynamicData.uploadedImageBase64" :src="'data:image/jpeg;base64,' + dynamicData.uploadedImageBase64"></ion-img>

                            <ion-list v-if="dynamicData.uploadedImageBase64">
                                <ion-item button @click="deleteImageFromCamera" v-if="!readonly"> 
                                    <ion-icon  color="danger" slot="start" :icon="trashBinOutline"></ion-icon>
                                    <ion-label  color="danger">
                                        Borrar Foto de la {{invoiceType}}
                                    </ion-label>
                                </ion-item>
                            </ion-list>
                            <section class="ion-padding" v-if="!dynamicData.uploadedImageBase64 && !isLoadingImage" style="display: flex; align-content: center; justify-content: space-between;">
                                <ion-button expand="block" fill="outline" @click="openCamera()" style="width: 100%;"> 
                                    <ion-icon slot="start" :icon="camera"></ion-icon>
                                    Tomar Foto de la {{invoiceType}}
                                </ion-button>
                                <ion-button fill="outline" @click="openCamera(true)"> 
                                    <ion-icon :icon="attachOutline"></ion-icon>
                                </ion-button>
                            </section>
                        </section>
                    </ion-accordion>
                    <ion-accordion value="second">
                        <ion-item slot="header" color="light">
                            <ion-label>2. Datos de la {{invoiceType}}</ion-label>
                            <ion-icon slot="end" :icon="checkmarkCircleOutline" color="success" v-show="stepsChecks.second"></ion-icon>
                        </ion-item>
                        <section slot="content">
                            <ion-list>
                                <ion-item>
                                    <ion-input :readonly="readonly" label="Código QR" label-placement="stacked" placeholder="" v-model="invoice.qrcode_data"></ion-input>
                                    <ion-button slot="end" fill="clear" @click="openQRCodeScanner" v-if="!readonly"> 
                                        Scanear QR
                                        <ion-icon slot="start" :icon="qrCodeOutline"></ion-icon>
                                    </ion-button>
                                </ion-item>
                                <ion-item>
                                    <ion-input label="Descripción del gasto:" label-placement="stacked" placeholder="Ej.: material para construcción" v-model="invoice.description" :readonly="readonly"></ion-input>
                                </ion-item>
                                <ion-accordion-group>
                                    <ion-accordion value="start" class="datetime-accordion">
                                        <ion-item lines="inset" slot="header">
                                            <ion-input label="Fecha" label-placement="stacked" placeholder="10/10/2023" v-model="invoice.date" :readonly="true"></ion-input>
                                        </ion-item>
                                        <ion-datetime :disabled="readonly" slot="content" presentation="date" v-model="dynamicData.datetimePickerDate" @ion-change="onDatePickerChange"></ion-datetime>
                                    </ion-accordion>
                                </ion-accordion-group>

                                <ion-item>
                                    <ion-label position="stacked">Valor:</ion-label>
                                    <CurrencyInput ref="currencyInput"  :disabled="readonly" class="native-input sc-ion-input-ios" v-model="invoice.amount" :options="{ currency: props.report.money_type, currencyDisplay: 'narrowSymbol', autoDecimalDigits: false, locale: 'es-PE', hideCurrencySymbolOnFocus: false, precision: 2 }"></CurrencyInput>
                                </ion-item>
                                <ion-item>
                                    <ion-input  :readonly="readonly" :label="'Código de ' + invoiceType + ':'" label-placement="stacked" placeholder="AAXX-XXXXXXXX" v-model="invoice.ticket_number"></ion-input>
                                </ion-item>
                                <ion-item>
                                    <ion-input  :readonly="readonly" label="RUC:" label-placement="stacked" placeholder="XXXXXXXXXXX" v-model="invoice.commerce_number"  inputmode="numeric"></ion-input>
                                </ion-item>
                            </ion-list>
                        </section>
                    </ion-accordion>
                    <ion-accordion value="third">
                        <ion-item slot="header" color="light">
                            <ion-label>3. Datos del Expense</ion-label>
                            <ion-icon slot="end" :icon="checkmarkCircleOutline" color="success" v-show="stepsChecks.third"></ion-icon>
                        </ion-item>
                        <section slot="content">
                            <ion-list>
                                <ion-item>
                                    <ion-select  :disabled="readonly" label="Job" label-placement="stacked" interface="action-sheet" placeholder="Selecciona el Job"  v-model="invoice.job_code">
                                        <ion-select-option v-for="job in jobsAndExpensesSelector.jobs" :value="job.code">{{job.code}} - {{ job.name }}</ion-select-option>
                                    </ion-select>
                                </ion-item>
                                <ion-item>
                                    <ion-select  :disabled="readonly" label="Expense" label-placement="stacked" interface="action-sheet" placeholder="Selecciona el Expense"  v-model="invoice.expense_code">
                                        <ion-select-option v-for="expense in jobsAndExpensesSelector.expenses" :value="expense.code">{{ expense.code }} - {{ expense.name }}</ion-select-option>
                                    </ion-select>                  
                                </ion-item>
                            </ion-list>
                        </section>
                    </ion-accordion>
                </ion-accordion-group>
            </article>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonImg, IonToolbar, IonTitle,IonButtons, IonThumbnail, IonAccordion, IonAccordionGroup, IonContent, IonListHeader, IonIcon, IonInput, IonSelect, IonSelectOption, IonModal, IonDatetime, IonDatetimeButton, IonButton, IonList, IonItem, IonLabel, IonProgressBar, toastController, alertController, actionSheetController } from '@ionic/vue';
import { computed, defineComponent, nextTick, onMounted, reactive, ref } from 'vue';
import { EInvoiceType, IInvoice } from '../../interfaces/InvoiceInterfaces';
import { IJob, IExpense } from '../../interfaces/JobsAndExpensesInterfaces';
import { briefcaseOutline, trashBinOutline, camera, cameraOutline, arrowForward, qrCodeOutline, ticketOutline, checkmarkCircleOutline, arrowForwardCircleOutline, cash, attachOutline } from 'ionicons/icons';

import { QRCodeScanner } from '@/dialogs/QRCodeScanner/QRCodeScanner';
//import { Money3Component } from 'v-money3';
import { vMaska } from "maska";
import { DateTime } from "luxon";
import { QRCodeParser } from '@/utils/QRCodeParser/QRCodeParser';
import CurrencyInput from '@/components/CurrencyInput/CurrencyInput.vue';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { DialogEventEmitter } from '@/utils/Dialog/Dialog';
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
import { Session } from '@/utils/Session/Session';
import { JobsAndExpenses } from '@/utils/Stored/JobsAndExpenses';
import { StoredInvoices } from '@/utils/Stored/StoredInvoices';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { PDFModifier } from '@/utils/PDFModifier/PDFModifier';
import { IReport } from '@/interfaces/ReportInterfaces';

const onDatePickerChange = (event: CustomEvent) => {
    const date = event.detail.value.split('T')[0];
    const formatted = DateTime.fromFormat(date, "yyyy-MM-dd").toFormat("dd/MM/yyyy").toString();
    invoice.value.date = formatted;
}
const currencyInput = ref<CurrencyInput|null>(null);
const accordionGroup = ref<any>(null);
const isLoading = ref<boolean>(true);
const isLoadingImage = ref<boolean>(true);

const dynamicData = ref<{
    uploadedImageBase64: null | string,
    originalImageBase64: null | string,
    formErrors: Array<{field: string, message: string}>,
    status: "idle" | "uploading-image" | "creating-invoice" | "success" | "error",
    datetimePickerDate: string
}>({
    uploadedImageBase64: null,
    originalImageBase64: null,
    formErrors: [],
    status: "idle",
    datetimePickerDate: DateTime.now().toISO()
})
const props = defineProps({
    invoice: {
        type: Object as () => IInvoice,
        required: true
    },
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
    report: {
        type: Object as () => IReport,
        required: true
    },
    readonly: {
        type: Boolean,
        default: false
    }
});
const jobsAndExpenses = ref<{jobs: Array<IJob>, expenses: Array<IExpense>}>({
    jobs: [],
    expenses: []
});
const jobsAndExpensesSelector = computed(() => {
    return {
        jobs: jobsAndExpenses.value.jobs,
        expenses: (() => {
            if (invoice.value.job_code.startsWith('000')){
                return jobsAndExpenses.value.expenses.filter((expense) => {
                    return (parseInt(expense.code) >= 700 && parseInt(expense.code) <= 799)
                })
            }else{
                return jobsAndExpenses.value.expenses.filter((expense) => {
                    return !(parseInt(expense.code) >= 700 && parseInt(expense.code) <= 799)
                })
            }
        })()
    }
})


const invoice = ref<IInvoice>({
    ...props.invoice,
    date: DateTime.fromISO(props.invoice.date).toFormat("dd/MM/yyyy").toString(),
});


const invoiceType = computed(() => {
    return invoice.value.type === "Bill" ? "Boleta" : "Factura";
})
const stepsChecks = computed(() => {
    return {
        first: dynamicData.value.uploadedImageBase64 !== null ? true : false,
        second: (invoice.value.description.length !== 0 && invoice.value.date.length !== 0 && invoice.value.ticket_number.length !== 0 && invoice.value.commerce_number.length !== 0 && invoice.value.amount !== 0) ? true : false,
        third: (invoice.value.job_code.length !== 0 && invoice.value.expense_code.length !== 0) ? true : false
    }
})



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

    invoice.value.qrcode_data = response.qrCode;
    invoice.value.ticket_number = response.content.docCode;
    invoice.value.commerce_number = response.content.ruc;
    invoice.value.amount = parseFloat(response.content.price).toFixed(2) as unknown as number;
    currencyInput.value.$el.value = `${invoice.value.amount}`;

    if (response.content.date){
        const ticketDate = DateTime.fromFormat(response.content.date, "yyyy-MM-dd");
        invoice.value.date = ticketDate.toFormat("dd/MM/yyyy");
        dynamicData.value.datetimePickerDate = ticketDate.toISODate() as unknown as string;
    }
}
const openQRCodeScanner = async () => {
    QRCodeScanner.open().onScan().then((content) => {
        setBarcodeData(content);
    })
}
const openCamera = async (forceFromGallery: boolean = false) => {
    const scanDocumentNative = () => {
        return new Promise(async (resolve, reject) => {
            let cameraPermission = await Camera.checkPermissions();
            if (cameraPermission.camera == 'prompt' || cameraPermission.camera == 'prompt-with-rationale'){
                const cameraPermissionRequest = await Camera.requestPermissions();
                if (cameraPermissionRequest.camera == 'denied'){
                    toastController.create({
                        message: "❌ El acceso a la cámara está bloqueado por su teléfono",
                        duration: 2000
                    }).then((toast) => {
                        toast.present();
                    })
                    return;
                }
            }else if (cameraPermission.camera == 'denied'){
                toastController.create({
                    message: "❌ El acceso a la cámara está bloqueado por su teléfono",
                    duration: 2000
                }).then((toast) => {
                    toast.present();
                })
                return;
            }

            cameraPermission = await Camera.checkPermissions();

            if (cameraPermission.camera == 'granted' || cameraPermission.camera == 'limited'){
                const { scannedImages } = await DocumentScanner.scanDocument() as unknown as {scannedImages: Array<string>};
                if (scannedImages.length > 0) {
                    resolve({
                        path: scannedImages[0],
                        webPath: Capacitor.convertFileSrc(scannedImages[0])
                    })
                }
            }
        })
        
    }
    const scanDocumentWeb = () => {
        return new Promise(async (resolve, reject) => {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: true,
                resultType: CameraResultType.Uri,
                source: (() => {
                    if (forceFromGallery){
                        return CameraSource.Photos;
                    }else{
                        return CameraSource.Prompt;
                    }
                })()
            });
            resolve({
                path: image.path as unknown as string,
                webPath: image.webPath as unknown as string
            });
        })
    }
    const openPDFPicker = () => {
        return new Promise(async (resolve, reject) => {
            const result = await FilePicker.pickFiles({
                types: ['application/pdf'],
                multiple: false,
                readData: true
            });

            if (result.files.length == 0){
                return;
            }
            const file = result.files[0];
            let sourcePDF = null;

            if (Capacitor.isNativePlatform()){
                function convertDataURIToBinary(base64:string) {
                    const raw = window.atob(base64);
                    const rawLength = raw.length;
                    const array = new Uint8Array(new ArrayBuffer(rawLength));
                    for(let i = 0; i < rawLength; i++) {
                        array[i] = raw.charCodeAt(i);
                    }
                    return array;
                }

                sourcePDF = {data: convertDataURIToBinary(file.data as string)}
            }else{
                const url = URL.createObjectURL(file.blob as Blob);
                sourcePDF = url;
            }
            const pdf = await PDFModifier.loadPDF(sourcePDF);

            const imageBase64 = await pdf.extractPagesIntoSingleImageAsBase64();

            //Convert base64image into objectUrl:
            const blob = await fetch(`${imageBase64}`).then(res => res.blob());
            const blobUrl = URL.createObjectURL(blob);
            resolve({
                path: blobUrl,
                webPath: blobUrl
            })
        })
    }


    const loadImageFrom = async (image: {path: string, webPath: string}, origin: "Web" | "Native" = "Native") => {

        isLoadingImage.value = true;
        const response = await fetch(image.webPath as unknown as string);
        const blob = await response.blob();
        const file = new File([blob], "image.jpg", {type: blob.type});

        if (file.size == 0){
            alertController.create({
                header: "Oops...",
                message: "Este PDF contiene muchas páginas, no se pudo convertirlo en imagen. Por favor, elige un PDF más pequeño.",
                buttons: ["OK"]
            }).then((alert) => {
                alert.present();
            })
            isLoadingImage.value = false;
            return;
        }

        imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1024
        }).then((compressedFile) => {
            new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(compressedFile);
            }).then((base64ImagePre) => {
                const base64Image = (base64ImagePre as string).split(";base64,")[1];
                const imageSize = (base64Image.length * (3/4)) / 1000000;


                if (imageSize >= 1){
                    alertController.create({
                        header: "Oops...",
                        message: "La imagen es muy pesada, por favor, suba una imagen más ligera (límite de 4MB)",
                        buttons: ["OK"]
                    }).then((alert) => {
                        alert.present();
                    })
                    isLoadingImage.value = false;
                    return;
                }

                dynamicData.value.uploadedImageBase64 = base64Image;
                dynamicData.value.uploadedImageBase64 = base64Image;
                accordionGroup.value.$el.value = "second";
                isLoadingImage.value = false;
            })
        })
        BarcodeScanner.isSupported().then((isSupported) => {
            if (!isSupported){
                return;
            }
            BarcodeScanner.readBarcodesFromImage({
                path: image.path as unknown as string,
            }).then((response) => {
                if (response.barcodes.length == 0){
                    return;
                }
                const barcode = response.barcodes[0];
                setBarcodeData(barcode.rawValue)
            })
        }).catch((error) => {
            
        })
    }

    if (forceFromGallery){
        actionSheetController.create({
            header: "Selecciona una opción",
            buttons: [
                {
                    text: "Subir PDF",
                    handler: () => {
                        openPDFPicker().then(async (image) => {
                            await loadImageFrom(image as unknown as {path: string, webPath: string}, "Web");
                        })
                    }
                },
                {
                    text: "Subir Foto",
                    handler: () => {
                        scanDocumentWeb().then(async (image) => {
                            await loadImageFrom(image as unknown as {path: string, webPath: string});
                        })
                    }
                },
                {
                    text: "Cancelar",
                    role: "cancel"
                }
            ]
        }).then((actionSheet) => {
            actionSheet.present();
        })
    }else if (!Capacitor.isNativePlatform()){
        scanDocumentWeb().then(async (image) => {
            await loadImageFrom(image as unknown as {path: string, webPath: string});
        })
    }else if(Capacitor.isNativePlatform()){
        scanDocumentNative().then(async (image) => {
            await loadImageFrom(image as unknown as {path: string, webPath: string});
        })
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

const saveInvoice = async () => {
    const validationResponse = validateData();
    if (!(await validationResponse).isValid){
        alertController.create({
            header: "Oops...",
            subHeader: "Hay errores en el formulario",
            message: (await validationResponse).errors[0].message,
            buttons: ["OK"]
        }).then((alert) => {
            alert.present();
        })
    }else{
        isLoading.value = true;
        dynamicData.value.status = "creating-invoice";

        const invoiceDocument = {
            ...invoice.value,
            id: 0,
            date: DateTime.fromFormat(invoice.value.date, "dd/MM/yyyy").toISO(),
            image_base64: dynamicData.value.originalImageBase64 == dynamicData.value.uploadedImageBase64 ? null : dynamicData.value.uploadedImageBase64,
        } as unknown as IInvoice;




        try {
            const response = await RequestAPI.patch("/invoices/" + invoice.value.id, invoiceDocument);
            toastController.create({
                message: "✅ La " + invoiceType.value + " se ha guardada con éxito",
                duration: 2000
            }).then((toast) => {
                toast.present();
            })
            isLoading.value = false;
            props.emitter.fire("updated");
            props.emitter.fire("close");
        } catch (error) {
            alertController.create({
                header: "Error",
                message: "No se pudo guardar el documento",
            }).then((alert) => {
                alert.present();
            })
            isLoading.value = false;
        }
    }
}

const loadJobsAndExpenses = async () => {
    const jobs =  await JobsAndExpenses.getJobs() as unknown as Array<IJob>;
    jobsAndExpenses.value.jobs = jobs;

    const expenses = await JobsAndExpenses.getExpenses() as unknown as Array<IExpense>;
    jobsAndExpenses.value.expenses = expenses;
}

const loadImage = async () => {
    isLoadingImage.value = true;
    isLoading.value = true;
    const response = await RequestAPI.get("/invoices/" + invoice.value.id + "/image");

    if (response.image){
        dynamicData.value.uploadedImageBase64 = response.image;
        dynamicData.value.originalImageBase64 = response.image;
    }
    isLoadingImage.value = false;
    isLoading.value = false;
}

onMounted(async () => {
    isLoading.value = false;
    setTimeout(() => {
        accordionGroup.value.$el.value = "first";
    }, 100);
    loadJobsAndExpenses();
    loadImage();

    dynamicData.value.datetimePickerDate = DateTime.fromISO(props.invoice.date).toISODate()?.toString();


})
</script>

<style scoped lang="scss">
.image-holder{
    display: flex;
    align-items: center;
    justify-content: center;
}
.datetime-accordion{
    &::part(content expanded){
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f4f5f8;
    }
}
</style>