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
                            <ion-list v-if="dynamicData.uploadedImageBase64">
                                <ion-item>
                                    <ion-thumbnail slot="start">
                                        <ion-img :src="'data:image/jpeg;base64,' + dynamicData.uploadedImageBase64"></ion-img>
                                    </ion-thumbnail>
                                    <ion-button fill="outline" color="danger" @click="deleteImageFromCamera"> 
                                        <ion-icon slot="start" :icon="trashBinOutline"></ion-icon>
                                        Borrar Foto de la {{invoiceType}}
                                    </ion-button>
                                </ion-item>
                            </ion-list>
                            <section class="ion-padding" v-if="!dynamicData.uploadedImageBase64">
                                <ion-button expand="block" fill="outline" @click="openCamera"> 
                                    <ion-icon slot="start" :icon="camera"></ion-icon>
                                    Tomar Foto de la {{invoiceType}}
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
                                    <ion-input label="Código QR" label-placement="stacked" placeholder="" v-model="invoice.qrcode_data"></ion-input>
                                    <ion-button slot="end" fill="clear" @click="openQRCodeScanner"> 
                                        Scanear QR
                                        <ion-icon slot="start" :icon="qrCodeOutline"></ion-icon>
                                    </ion-button>
                                </ion-item>
                                <ion-item>
                                    <ion-input label="Descripción del gasto:" label-placement="stacked" placeholder="Ej.: material para construcción" v-model="invoice.description"></ion-input>
                                </ion-item>
                                <ion-item>
                                    <ion-label position="stacked">Fecha:</ion-label>
                                    <input class="native-input sc-ion-input-ios" v-maska data-maska="##/##/####" v-model="invoice.date" inputmode="numeric">
                                </ion-item>

                                <ion-item>
                                    <ion-label position="stacked">Valor:</ion-label>
                                    <CurrencyInput ref="currencyInput" class="native-input sc-ion-input-ios" v-model="invoice.amount" :options="{ currency: 'PEN', autoDecimalDigits: true, currencyDisplay: 'hidden' }"></CurrencyInput>
                                </ion-item>
                                <ion-item>
                                    <ion-input :label="'Código de ' + invoiceType + ':'" label-placement="stacked" placeholder="AAXX-XXXXXXXX" v-model="invoice.ticket_number"></ion-input>
                                </ion-item>
                                <ion-item>
                                    <ion-input label="RUC:" label-placement="stacked" placeholder="XXXXXXXXXXX" v-model="invoice.commerce_number"  inputmode="numeric"></ion-input>
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
                                    <ion-select label="Job" label-placement="stacked" interface="action-sheet" placeholder="Selecciona el Job"  v-model="invoice.job_code">
                                        <ion-select-option v-for="job in jobsAndExpensesSelector.jobs" :value="job.code">{{ job.name }}</ion-select-option>
                                    </ion-select>                    
                                </ion-item>
                                <ion-item>
                                    <ion-select label="Expense" label-placement="stacked" interface="action-sheet" placeholder="Selecciona el Expense"  v-model="invoice.expense_code">
                                        <ion-select-option v-for="expense in jobsAndExpensesSelector.expenses" :value="expense.code">{{ expense.name }}</ion-select-option>
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
import { IonPage, IonHeader, IonImg, IonToolbar, IonTitle,IonButtons, IonThumbnail, IonAccordion, IonAccordionGroup, IonContent, IonListHeader, IonIcon, IonInput, IonSelect, IonSelectOption, IonModal, IonDatetime, IonDatetimeButton, IonButton, IonList, IonItem, IonLabel, IonProgressBar, toastController, alertController } from '@ionic/vue';
import { computed, defineComponent, nextTick, onMounted, reactive, ref } from 'vue';
import { EInvoiceType, IInvoice, INewInvoice } from '../../interfaces/InvoiceInterfaces';
import { IJob, IExpense } from '../../interfaces/JobsAndExpensesInterfaces';
import { briefcaseOutline, trashBinOutline, camera, cameraOutline, arrowForward, qrCodeOutline, ticketOutline, checkmarkCircleOutline, arrowForwardCircleOutline, cash } from 'ionicons/icons';

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


const currencyInput = ref<CurrencyInput|null>(null);
const accordionGroup = ref<any>(null);
const isLoading = ref<boolean>(true);
const dynamicData = ref<{
    uploadedImageBase64: null | string,
    formErrors: Array<{field: string, message: string}>,
    status: "idle" | "uploading-image" | "creating-invoice" | "success" | "error"
}>({
    uploadedImageBase64: "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=", //!!
    formErrors: [],
    status: "idle"
})
const props = defineProps({
    reportId: {
        type: Number,
        required: true
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
            if (invoice.value.job_code == "0000"){
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

/* For tests porpuses
const invoice = ref<INewInvoice>({
    report_id: props.reportId,
    type: props.type as unknown as EInvoiceType,
    description: "Test", 
    ticket_number: "123", 
    commerce_number: "123", 
    date: DateTime.now().toFormat("dd/MM/yyyy").toString(),
    job_code: "708", 
    expense_code: "1008", 
    amount: 10 as unknown as number,
    qrcode_data: "",
    image: null
});
*/
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
            message: "El código QR no es válido",
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
    }
}
const openQRCodeScanner = async () => {
    QRCodeScanner.open().onScan().then((content) => {
        setBarcodeData(content);
    })
}
const openCamera = async () => {
    const scanDocumentNative = () => {
        return new Promise(async (resolve, reject) => {
            let cameraPermission = await Camera.checkPermissions();
            if (cameraPermission.camera == 'prompt' || cameraPermission.camera == 'prompt-with-rationale'){
                const cameraPermissionRequest = await Camera.requestPermissions();
                if (cameraPermissionRequest.camera == 'denied'){
                    toastController.create({
                        message: "El acceso a la cámara está bloqueado por su teléfono",
                        duration: 2000
                    }).then((toast) => {
                        toast.present();
                    })
                    return;
                }
            }else if (cameraPermission.camera == 'denied'){
                toastController.create({
                    message: "El acceso a la cámara está bloqueado por su teléfono",
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
                source: CameraSource.Camera
            });
            resolve({
                path: image.path as unknown as string,
                webPath: image.webPath as unknown as string
            });
        })
    }


    const loadImageFrom = async (image: {path: string, webPath: string}, origin: "Web" | "Native" = "Native") => {
        const response = await fetch(image.webPath as unknown as string);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const file = new File([blob], "image.jpg", {type: blob.type});

        imageCompression(file, {
            maxSizeMB: 1,
        }).then((compressedFile) => {
            new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(compressedFile);
            }).then((base64ImagePre) => {
                const base64Image = (base64ImagePre as string).split(";base64,")[1];
                dynamicData.value.uploadedImageBase64 = base64Image;
                dynamicData.value.uploadedImageBase64 = base64Image;

                accordionGroup.value.$el.value = "second";
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
        })
    }

    if (Capacitor.isNativePlatform()){
        scanDocumentNative().then(async (image) => {
            await loadImageFrom(image as unknown as {path: string, webPath: string});
        })
    }else{
        scanDocumentWeb().then(async (image) => {
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
                message: "La " + invoiceType.value + " se ha creado con éxito",
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
</style>@/utils/Stored/JobsAndExpenses