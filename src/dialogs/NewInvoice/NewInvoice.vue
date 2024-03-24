<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button :disabled="isLoading" @click="emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Añadir {{invoiceType}}</ion-title>
                <ion-buttons slot="end" v-if="false">
                    <ion-button @click="createNewInvoice" :disabled="!(stepsChecks.first && stepsChecks.second && stepsChecks.third)">
                        <ion-icon slot="end" :icon="arrowForwardCircleOutline"></ion-icon>
                        Añadir
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


                            <ion-img v-if="dynamicData.uploadedImageBase64" :src="'data:image/jpeg;base64,' + dynamicData.uploadedImageBase64"></ion-img>


                            <ion-list v-if="dynamicData.uploadedImageBase64">
                                <ion-item button @click="deleteImageFromCamera"> 
                                    <ion-icon  color="danger" slot="start" :icon="trashBinOutline"></ion-icon>
                                    <ion-label  color="danger">
                                        Borrar Foto de la {{invoiceType}}
                                    </ion-label>
                                </ion-item>
                            </ion-list>
                            
                            <section class="ion-padding" v-if="!dynamicData.uploadedImageBase64" style="display: flex; align-content: center; justify-content: space-between;">
                                <ion-button expand="block" fill="outline" @click="openCamera()" style="width: 100%;" v-if="!isLoadingImageCompression"> 
                                    <ion-icon slot="start" :icon="camera"></ion-icon>
                                    Tomar Foto de la {{invoiceType}}
                                </ion-button>
                                <ion-button fill="outline" @click="openCamera(true)" v-if="!isLoadingImageCompression"> 
                                    <ion-icon :icon="attachOutline"></ion-icon>
                                </ion-button>
                                <ion-progress-bar v-if="isLoadingImageCompression" type="indeterminate"></ion-progress-bar>
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
                                    <ion-input label="Código QR" label-placement="stacked" placeholder="" v-model="invoice.qrcode_data"></ion-input>
                                    <ion-button slot="end" fill="clear" @click="openQRCodeScanner"> 
                                        Scanear QR
                                        <ion-icon slot="start" :icon="qrCodeOutline"></ion-icon>
                                    </ion-button>
                                </ion-item>
                                <ion-item>
                                    <ion-input label="Descripción del gasto:" label-placement="stacked" placeholder="Ej.: material para construcción" v-model="invoice.description"></ion-input>
                                </ion-item>
                                <ion-accordion-group>
                                    <ion-accordion value="start" class="datetime-accordion">
                                        <ion-item lines="inset" slot="header">
                                            <ion-input label="Fecha" label-placement="stacked" placeholder="10/10/2023" v-model="invoice.date" :readonly="true"></ion-input>
                                        </ion-item>
                                        <ion-datetime slot="content" presentation="date" v-model="dynamicData.datetimePickerDate" @ion-change="onDatePickerChange"></ion-datetime>
                                    </ion-accordion>
                                </ion-accordion-group>
                                <ion-item>
                                    <ion-label position="stacked">Valor:</ion-label>
                                    <CurrencyInput ref="currencyInput" class="native-input sc-ion-input-ios" v-model="invoice.amount" :options="{ currency: props.report.money_type, currencyDisplay: 'narrowSymbol', autoDecimalDigits: false, locale: 'es-PE', hideCurrencySymbolOnFocus: false, precision: 2}"></CurrencyInput>
                                </ion-item>
                                <ion-item>
                                    <ion-input @ionInput="checkTicketOnInput"  :class="(isRepeatedTicket) ? 'display-error-holder' : ''" :label="'Código de ' + invoiceType + ':'" label-placement="stacked" placeholder="AAXX-XXXXXXXX" v-model="invoice.ticket_number">
                                        <div slot="end" v-if="isRepeatedTicket" :class="(isRepeatedTicket) ? 'display-error' : ''"><ion-text color="danger" style="font-size: 10px">⚠️ Este ticket ya ha sido ingresado anteriormente</ion-text></div>
                                    </ion-input>
                                </ion-item>
                                <ion-item>
                                    <ion-input @ionInput="checkTicketOnInput" label="RUC:" label-placement="stacked" placeholder="XXXXXXXXXXX" v-model="invoice.commerce_number"  inputmode="numeric"></ion-input>
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
                                <ion-item v-if="dynamicData.listSelectedJobs.length == 0">
                                    <ion-select label="Job" label-placement="stacked" interface="action-sheet" placeholder="Selecciona el Job"  v-model="invoice.job_code" @ion-change="(ev) => {dynamicData.listSelectedJobs = []; addJobToList(ev.detail.value)}">
                                        <ion-select-option v-for="job in jobsAndExpensesSelector.jobs" :value="job.code">{{job.code}} - {{ job.name }}</ion-select-option>
                                    </ion-select>
                                </ion-item>
                            </ion-list>
                            <ion-accordion-group  v-if="dynamicData.listSelectedJobs.length > 0">
                                <ion-accordion value="start" class="jobs-accordion">
                                    <ion-item lines="inset" slot="header">
                                        <ion-input label="Jobs" label-placement="stacked" placeholder="Selecciona el Job" :value="dynamicData.listSelectedJobs.map((i) => {return i.job.code}).join(', ')" :readonly="true"></ion-input>
                                    </ion-item>
                                    <section slot="content">
                                        <ion-list>
                                            <ion-item v-for="(jobItem, index) in dynamicData.listSelectedJobs" :key="jobItem.id">
                                                <div slot="start"></div>
                                                <ion-select style="flex: 1 1 80%;max-width: 75%;min-width: 75%;" :label="'Job ' + (index + 1) " label-placement="stacked" interface="action-sheet" placeholder="Selecciona el Job" v-model="jobItem.job">
                                                    <ion-select-option v-for="job in jobsAndExpensesSelector.jobs" :value="job">{{job.code}} - {{ job.name }}</ion-select-option>
                                                </ion-select>
                                                
                                                <ion-input min="0" max="100" style="flex: 30%; min-width: 85px; max-width: 85px;" :class="!selectedJobsPercentageIsCompleted ? 'jl-not-completed' : ''"  label="Porcentaje" label-placement="stacked" type="number" placeholder="100" v-model="jobItem.percentage" inputmode="decimal"></ion-input>
                                                
                                                <ion-button fill="clear" slot="end" @click="dynamicData.listSelectedJobs = dynamicData.listSelectedJobs.filter(e => e.id != jobItem.id); removeFromJobList()">
                                                    <ion-icon :icon="removeCircleOutline"></ion-icon>
                                                </ion-button>
                                            </ion-item>
                                        </ion-list>

                                        <p v-if="!selectedJobsPercentageIsCompleted" style="font-size: 10px; margin-left: 33px; color: red; text-align: right; margin-right: 12px;">La sumatória de los porcentajes tiene que ser igual a 100%</p>

                                        <ion-button expand="block" fill="clear" @click="addJobToList()">
                                            <ion-icon :icon="addOutline" slot="start"></ion-icon>
                                            Agregar Job
                                        </ion-button>
                                    </section>
                                </ion-accordion>
                            </ion-accordion-group>

                            <ion-list>
                                <ion-item>
                                    <ion-select label="Expense" label-placement="stacked" interface="action-sheet" placeholder="Selecciona el Expense"  v-model="invoice.expense_code">
                                        <ion-select-option v-for="expense in jobsAndExpensesSelector.expenses" :value="expense.code">{{ expense.code }} - {{ expense.name }}</ion-select-option>
                                    </ion-select>                  
                                </ion-item>
                            </ion-list>
                        </section>
                    </ion-accordion>
                </ion-accordion-group>
                <section class="ion-padding">
                    <ion-button expand="block" shape="round" size="default" style="height: 50px" @click="createNewInvoice" :disabled="!(stepsChecks.first && stepsChecks.second && stepsChecks.third) || isLoading">
                        <ion-icon :icon="arrowForwardCircleOutline" slot="end"></ion-icon>
                        Añadir {{invoiceType}}
                    </ion-button>
                </section>
            </article>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonImg, IonToolbar, IonTitle,IonButtons, IonThumbnail, IonAccordion, IonAccordionGroup, IonContent, IonListHeader, IonIcon, IonInput, IonSelect, IonSelectOption, IonModal, IonDatetime, IonDatetimeButton, IonButton, IonList, IonItem, IonLabel, IonProgressBar, IonText, toastController, alertController, actionSheetController } from '@ionic/vue';
import { computed, defineComponent, nextTick, onMounted, reactive, ref } from 'vue';
import { EInvoiceType, IInvoice, INewInvoice } from '../../interfaces/InvoiceInterfaces';
import { IJob, IExpense } from '../../interfaces/JobsAndExpensesInterfaces';
import { briefcaseOutline, trashBinOutline, camera, cameraOutline, arrowForward, qrCodeOutline, ticketOutline, checkmarkCircleOutline, arrowForwardCircleOutline, cash, attachOutline, addOutline, removeCircleOutline } from 'ionicons/icons';

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
import { CurrencyFly } from '@/utils/CurrencyFly/CurrencyFly';
import { StoredReports } from '@/utils/Stored/StoredReports';
import { IReport } from '@/interfaces/ReportInterfaces';

const onDatePickerChange = (event: CustomEvent) => {
    const date = event.detail.value.split('T')[0];
    const formatted = DateTime.fromFormat(date, "yyyy-MM-dd").toFormat("dd/MM/yyyy").toString();
    invoice.value.date = formatted;
}

const currencyInput = ref<CurrencyInput|null>(null);
const accordionGroup = ref<any>(null);
const isLoading = ref<boolean>(true);
const isLoadingImageCompression = ref<boolean>(false);
const isRepeatedTicket = ref<boolean>(false);
const dynamicData = ref<{
    uploadedImageBase64: null | string,
    formErrors: Array<{field: string, message: string}>,
    status: "idle" | "uploading-image" | "creating-invoice" | "success" | "error",
    datetimePickerDate: string,
    listSelectedJobs: Array<{id: string, job: IJob, percentage: number}>,
}>({
    uploadedImageBase64: null,
    formErrors: [],
    status: "idle",
    datetimePickerDate: DateTime.now().toISODate() as unknown as string,
    listSelectedJobs: []
})
const props = defineProps({
    reportId: {
        type: Number,
        required: true
    },
    report: {
        type: Object as () => IReport,
        required: true
    },
    reportInvoices: {
        type: Array,
        required: true,
    },
    type: {
        type: String,
        required: true
    },
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
    autoShowCamera: {
        type: Boolean,
        required: false,
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

const addJobToList = (jobCode: null|string = null) => {
    dynamicData.value.listSelectedJobs.forEach((item) => {
        item.percentage = (100 / (dynamicData.value.listSelectedJobs.length + 1)).toFixed(2) as unknown as number;
    })

    dynamicData.value.listSelectedJobs.push({
        id: (dynamicData.value.listSelectedJobs.length + 1).toString(),
        job: (jobCode) ?  jobsAndExpensesSelector.value.jobs.find((job) => job.code == jobCode) as IJob : jobsAndExpensesSelector.value.jobs[0],
        percentage: (100 / (dynamicData.value.listSelectedJobs.length + 1)).toFixed(2) as unknown as number
    })
}
const removeFromJobList = () => {
    dynamicData.value.listSelectedJobs.forEach((item) => {
        item.percentage = (100 / (dynamicData.value.listSelectedJobs.length)).toFixed(2) as unknown as number;
    })
}
const selectedJobsPercentageIsCompleted = computed(()=> {
    let totalPercentage = 0;
    dynamicData.value.listSelectedJobs.forEach((item) => {
        totalPercentage += parseFloat(item.percentage);
    })

    totalPercentage = Math.round(totalPercentage);
    return totalPercentage == 100;
})
const checkTicketOnInput = (event: CustomEvent) => {
    if (invoice.value.ticket_number.trim().length == 0 || invoice.value.commerce_number.trim().length == 0){
        isRepeatedTicket.value = false;
        return;
    }

    RequestAPI.get('/invoices/ticket-number/check', {
        ticket_number: invoice.value.ticket_number,
        commerce_number: invoice.value.commerce_number
    }).then((response) => {
        isRepeatedTicket.value = response.exists;
    })
}

const invoice = ref<INewInvoice>({
    report_id: props.reportId,
    type: props.type as unknown as EInvoiceType,
    description: "",
    ticket_number: "",
    commerce_number: "",
    date: DateTime.now().toFormat("dd/MM/yyyy").toString(),
    job_code: "",
    expense_code: "",
    amount: 0 as unknown as number,
    qrcode_data: "",
    image: null
});

const invoiceType = computed(() => {
    return invoice.value.type === "Bill" ? "Boleta" : "Factura";
})
const stepsChecks = computed(() => {
    return {
        first: dynamicData.value.uploadedImageBase64 !== null ? true : false,
        second: (invoice.value.description.length !== 0 && invoice.value.date.length !== 0 && invoice.value.ticket_number.length !== 0 && invoice.value.commerce_number.length !== 0 && invoice.value.amount !== 0) ? true : false,
        third: (invoice.value.job_code.length !== 0 && invoice.value.expense_code.length !== 0 && (dynamicData.value.listSelectedJobs.length > 0 ? selectedJobsPercentageIsCompleted.value :  true)) ? true : false
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

    checkTicketOnInput({
        detail: {
            value: response.content.docCode
        }
    } as any)

    if (response.content.date){
        const ticketDate = DateTime.fromFormat(response.content.date, "yyyy-MM-dd");
        invoice.value.date = ticketDate.toFormat("dd/MM/yyyy");
        dynamicData.value.datetimePickerDate = ticketDate.toISODate() as unknown as string;
    }   




    /*if (response.country == 'Brazil'){
        //Ask if want to convert the amount to USD:
        alertController.create({
            header: 'Converter a USD',
            message: `El monto de la ${invoiceType.value.toLowerCase()} está en BRL, ¿desea convertirlo a USD?`,
            buttons: [
                {
                    text: 'No'
                },
                {
                    text: 'Converter',
                    handler: async () => {
                        const result = await CurrencyFly.convert(parseFloat(response.content.price), {
                            from: 'BRL',
                            to: 'USD',
                            date: DateTime.fromFormat(response.content.date, "yyyy-MM-dd").toJSDate()
                        })

                        const exchangeTypeResponse = await CurrencyFly.getExchangeInfo({
                            from: 'BRL',
                            to: 'USD',
                            date: DateTime.fromFormat(response.content.date, "yyyy-MM-dd").toJSDate()
                        })

                        alertController.create({
                            header: 'Monto convertido',
                            subHeader: `1 ${exchangeTypeResponse.from} = ${exchangeTypeResponse.value} ${exchangeTypeResponse.to} (${DateTime.fromFormat(exchangeTypeResponse.date, "yyyy-MM-dd").toFormat("dd/MM/yyyy")})`,
                            message: `El valor en USD es de $${result.toFixed(2)}`,
                            buttons: [
                                {
                                    text: 'Rechazar',
                                    role: 'cancel'
                                },
                                {
                                    text: `Aceptar $${result.toFixed(2)}`,
                                    handler: () => {
                                        invoice.value.amount = result.toFixed(2) as unknown as number;
                                        currencyInput.value.$el.value = `${invoice.value.amount}`;
                                    }
                                }
                            ]
                        }).then((alert) => {
                            alert.present();
                        })
                    }
                }
            ]
        }).then((alert) => {
            alert.present();
        })
    }*/
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
        isLoadingImageCompression.value = true;
        const response = await fetch(image.webPath as unknown as string);
        const blob = await response.blob();
        const file = new File([blob], "image.jpg", {type: blob.type});

        console.log("Original Image size: ", (file.size / 1000000) + "MB");

        if (file.size == 0){
            alertController.create({
                header: "Oops...",
                message: "Este PDF contiene muchas páginas, no se pudo convertirlo en imagen. Por favor, elige un PDF más pequeño.",
                buttons: ["OK"]
            }).then((alert) => {
                alert.present();
            })
            isLoadingImageCompression.value = false;
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

                console.log("Compressed Image size: ", imageSize);
                if (imageSize >= 1){
                    alertController.create({
                        header: "Oops...",
                        message: "La imagen es muy pesada, por favor, suba una imagen más ligera (límite de 4MB)",
                        buttons: ["OK"]
                    }).then((alert) => {
                        alert.present();
                    })
                    isLoadingImageCompression.value = false;
                    return;
                }

                dynamicData.value.uploadedImageBase64 = base64Image;
                dynamicData.value.uploadedImageBase64 = base64Image;
                accordionGroup.value.$el.value = "second";
                isLoadingImageCompression.value = false;
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
const createNewInvoice = async () => {
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

        



        const createMultiplesInvoices = async () => {
            const listInvoicesToCreate = dynamicData.value.listSelectedJobs.map((selectedJob, i) => {
                return {
                    ...invoice.value,
                    description: invoice.value.description + ` [${(i+1)}/${dynamicData.value.listSelectedJobs.length} - ${(selectedJob.percentage * 1).toFixed(0)}%]`,
                    job_code: selectedJob.job.code,
                    amount: parseFloat((invoice.value.amount * (selectedJob.percentage / 100)).toFixed(2)),
                    id: i,
                    date: DateTime.fromFormat(invoice.value.date, "dd/MM/yyyy").toISO(),
                    image: dynamicData.value.uploadedImageBase64,
                    report_id: parseInt(props.reportId.toString())
                } as unknown as IInvoice;
            });

            if (props.reportInvoices.length + listInvoicesToCreate.length > 28){
                //Abort and show message:
                alertController.create({
                    header: "Oops...",
                    subHeader: "No se puede crear más de 28 documentos en un reporte",
                    message: "Cada job elegido para el documento se convertirá en un documento separado y el límite de 28 documentos por reporte se superará.",
                    buttons: ["OK"]
                }).then((alert) => {
                    alert.present();
                })
                isLoading.value = false;
                dynamicData.value.status = "idle";
                return;
            }




            try {
                for (let i = 0; i < listInvoicesToCreate.length; i++){
                    const invoiceCreated = await StoredInvoices.addInvoice(listInvoicesToCreate[i]);
                }

                toastController.create({
                    message: "✅ La " + invoiceType.value + " se ha creado con éxito",
                    duration: 2000
                }).then((toast) => {
                    toast.present();
                })
                isLoading.value = false;
                props.emitter.fire("created");
                props.emitter.fire("close");
            } catch (error) {
                alertController.create({
                    header: "Error",
                    message: "No se pudo crear el documento",
                }).then((alert) => {
                    alert.present();
                })
                isLoading.value = false;
            }
        }

        const createSingleInvoice = async () => {
            const invoiceDocument = {
                ...invoice.value,
                id: 0,
                date: DateTime.fromFormat(invoice.value.date, "dd/MM/yyyy").toISO(),
                image: dynamicData.value.uploadedImageBase64,
                report_id: parseInt(props.reportId.toString())
            } as unknown as IInvoice;

            try {
                const invoiceCreated = await StoredInvoices.addInvoice(invoiceDocument);
                const newInvoiceId = invoiceCreated.id;

                toastController.create({
                    message: "✅ La " + invoiceType.value + " se ha creado con éxito",
                    duration: 2000
                }).then((toast) => {
                    toast.present();
                })
                isLoading.value = false;
                props.emitter.fire("created");
                props.emitter.fire("close");
            } catch (error) {
                alertController.create({
                    header: "Error",
                    message: "No se pudo crear el documento",
                }).then((alert) => {
                    alert.present();
                })
                isLoading.value = false;
            }
        }


        if (dynamicData.value.listSelectedJobs.length > 0){
            createMultiplesInvoices();
        }else{
            createSingleInvoice();
        }
    }
}
const loadJobsAndExpenses = async () => {
    const jobs =  await JobsAndExpenses.getJobs() as unknown as Array<IJob>;
    jobsAndExpenses.value.jobs = jobs;

    const expenses = await JobsAndExpenses.getExpenses() as unknown as Array<IExpense>;
    jobsAndExpenses.value.expenses = expenses;
}
onMounted(async () => {
    isLoading.value = false;
    setTimeout(() => {
        accordionGroup.value.$el.value = "first";
    }, 100);

    if (props.autoShowCamera){
        openCamera();
    }
    loadJobsAndExpenses();
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
        background-color: #f4f5f8;
    }
}

.jl-not-completed{
    color: red;
}
</style>