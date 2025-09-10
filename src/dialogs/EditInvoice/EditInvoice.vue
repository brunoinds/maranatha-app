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
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
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
                            <ion-progress-bar v-if="isLoadingImageCompression" type="indeterminate"></ion-progress-bar>


                            <ion-img v-if="dynamicData.uploadedImageBase64" :src="'data:image/jpeg;base64,' + dynamicData.uploadedImageBase64"></ion-img>
                            <ion-list v-if="dynamicData.uploadedImageBase64">
                                <ion-item button @click="deleteImageFromCamera" v-if="!readonly"> 
                                    <ion-icon  color="danger" slot="start" :icon="trashBinOutline"></ion-icon>
                                    <ion-label  color="danger">
                                        Borrar Foto de la {{invoiceType}}
                                    </ion-label>
                                </ion-item>
                            </ion-list>


                            <ion-img v-if="dynamicData.currentPdfThumbnailBase64" :src="dynamicData.currentPdfThumbnailBase64"></ion-img>
                            <ion-list v-if="dynamicData.uploadedPdfBase64">
                                <ion-item button @click="previewPdfFile"> 
                                    <ion-icon color="primary" slot="start" :icon="documentOutline"></ion-icon>
                                    <ion-label>
                                        <h2>Archivo PDF</h2>
                                        <p>Tamaño de {{ pdfUI.size }}</p>
                                    </ion-label>
                                    <ion-button color="danger" slot="end" @click="deletePdfFromStore" v-if="!readonly">
                                        <ion-icon slot="icon-only" :icon="trashBinOutline"></ion-icon>
                                    </ion-button>
                                </ion-item>
                            </ion-list> 


                            <section class="ion-padding" v-if="(!dynamicData.uploadedImageBase64 && !dynamicData.uploadedPdfBase64) && !isLoadingImageCompression" style="display: flex; align-content: center; justify-content: space-between;">
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
                                    <ion-input :readonly="readonly" :label="'Código de ' + invoiceType + ':'" label-placement="stacked" placeholder="AAXX-XXXXXXXX" v-model="invoice.ticket_number"></ion-input>
                                </ion-item>
                                <ion-item>
                                    <ion-input :readonly="readonly" label="RUC:" label-placement="stacked" placeholder="XXXXXXXXXXX" v-model="invoice.commerce_number"  inputmode="text"></ion-input>
                                </ion-item>

                                <ion-item>
                                    <ion-input label="Proveedor:" label-placement="stacked" placeholder="Ingresa el nombre del proveedor" v-model="invoice.provider"></ion-input>
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
                                <ion-item-choose-dialog :disabled="readonly" @click="openJobSelector('fromSingleJobSelector', {})" placeholder="Selecciona el Job" label="Job:" :value="invoice.job_code"/>
                                <ion-item-choose-dialog :disabled="readonly" @click="openExpenseSelector()" placeholder="Selecciona el Expense" label="Expense:" :value="invoice.expense_code"/>
                            </ion-list>
                        </section>
                    </ion-accordion>
                </ion-accordion-group>
            </article>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { actionSheetController, alertController, IonAccordion, IonAccordionGroup, IonButton, IonButtons, IonContent, IonDatetime, IonHeader, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar, toastController } from '@ionic/vue';
import { attachOutline, camera, checkmarkCircleOutline, documentOutline, qrCodeOutline, trashBinOutline } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { IInvoice } from '../../interfaces/InvoiceInterfaces';
import { EExpenseUses, IExpense, IJob } from '../../interfaces/JobsAndExpensesInterfaces';

import CurrencyInput from '@/components/CurrencyInput/CurrencyInput.vue';
import IonItemChooseDialog from '@/components/IonItemChooseDialog/IonItemChooseDialog.vue';
import { QRCodeScanner } from '@/dialogs/QRCodeScanner/QRCodeScanner';
import { Dialog, DialogEventEmitter } from '@/utils/Dialog/Dialog';
import { QRCodeParser } from '@/utils/QRCodeParser/QRCodeParser';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import imageCompression from 'browser-image-compression';
import { DateTime } from "luxon";


import ExpenseSelector from '@/dialogs/ExpenseSelector/ExpenseSelector.vue';
import JobSelector from '@/dialogs/JobSelector/JobSelector.vue';
import { IReport } from '@/interfaces/ReportInterfaces';
import { PDFModifier } from '@/utils/PDFModifier/PDFModifier';
import { JobsAndExpenses } from '@/utils/Stored/JobsAndExpenses';
import { Capacitor } from '@capacitor/core';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import humanFormat from 'human-format';
import { ImagePicker } from '@/utils/Camera/ImagePicker';

const onDatePickerChange = (event: CustomEvent) => {
    const date = event.detail.value.split('T')[0];
    const formatted = DateTime.fromFormat(date, "yyyy-MM-dd").toFormat("dd/MM/yyyy").toString();
    invoice.value.date = formatted;
}
const currencyInput = ref<CurrencyInput|null>(null);
const accordionGroup = ref<any>(null);
const isLoading = ref<boolean>(true);
const isLoadingImageCompression = ref<boolean>(true);

const dynamicData = ref<{
    uploadedImageBase64: null | string,
    originalImageBase64: null | string,
    uploadedPdfBase64: null | string,
    originalPdfBase64: null | string,
    currentPdfThumbnailBase64: null | string,
    formErrors: Array<{field: string, message: string}>,
    status: "idle" | "uploading-image" | "creating-invoice" | "success" | "error",
    datetimePickerDate: string
}>({
    uploadedImageBase64: null,
    originalImageBase64: null,
    uploadedPdfBase64: null,
    originalPdfBase64: null,
    currentPdfThumbnailBase64: null,
    formErrors: [],
    status: "idle",
    datetimePickerDate: DateTime.now().toISO() as unknown as string
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
const invoice = ref<IInvoice>({
    ...props.invoice,
    date: DateTime.fromISO(props.invoice.date).toFormat("dd/MM/yyyy").toString(),
});
const invoiceType = computed(() => {
    return invoice.value.type === "Bill" ? "Boleta" : "Factura";
})
const stepsChecks = computed(() => {
    return {
        first: (dynamicData.value.uploadedImageBase64 !== null || dynamicData.value.uploadedPdfBase64 !== null) ? true : false,
        second: (invoice.value.description.length !== 0 && invoice.value.date.length !== 0 && invoice.value.ticket_number.length !== 0 && invoice.value.commerce_number.length !== 0 && invoice.value.amount !== 0 && ((props.report.country == 'PY') ? invoice.value.provider != null && invoice.value.provider.trim().length > 0 : true)) ? true : false,
        third: (invoice.value.job_code.length !== 0 && invoice.value.expense_code.length !== 0) ? true : false
    }
})
const pdfUI = computed(() => {
    const pdfSize = (dynamicData.value.uploadedPdfBase64) ? dynamicData.value.uploadedPdfBase64.length : 0;
    //As the file is a base64, the real file size is 4/3 of the base64 size:
    const pdfSizeInBytes = (pdfSize * 3) / 4;
    return {
        size: humanFormat(pdfSizeInBytes, {unit: 'B', decimals: 2}),
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
                const result = await ImagePicker.scanDocument();
                resolve({
                    path: result.path,
                    webPath: result.webPath,
                    details: {
                    }
                })
            }
        })
        
    }
    const scanDocumentWeb = () => {
        return new Promise(async (resolve, reject) => {
            try {
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
                    webPath: image.webPath as unknown as string,
                    details: {

                    }
                });
            } catch (error) {
                
            }
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
            let sourcePDF:null|Blob = null;

            if (Capacitor.isNativePlatform()){
                const convertBase64toBlob = (base64: string) => {
                    const byteCharacters = atob(base64);
                    const byteNumbers = new Array(byteCharacters.length);
                    
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    
                    const byteArray = new Uint8Array(byteNumbers);
                    return new Blob([byteArray], { type: 'application/pdf' });
                }

                const blob = convertBase64toBlob(file.data);
                sourcePDF = blob
            }else{
                sourcePDF = file.blob as Blob;
            }
            const blobUrl = URL.createObjectURL(sourcePDF);
            const pdf = await PDFModifier.loadPDF(blobUrl);
            const imageBase64 = await pdf.extractPagesIntoSingleImageAsBase64();
            dynamicData.value.currentPdfThumbnailBase64 = imageBase64;

            resolve({
                path: blobUrl,
                webPath: blobUrl,
            })
        })
    }


    const loadImageFrom = async (image: {path: string, webPath: string, details: {[key: string]:any}}, origin: "Web" | "Native" = "Native") => {
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
            maxWidthOrHeight: (image.details.pages) ? ((image.details.pages > 1) ? undefined : 1024)  : 1024
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
                if (imageSize >= 4){
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
        /* BarcodeScanner.isSupported().then((isSupported) => {
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
            
        }) */
    }
    const loadPdfFrom = async (pdf: {path: string, webPath: string}) => {
        isLoadingImageCompression.value = true;
        const response = await fetch(pdf.webPath as unknown as string);
        const blob = await response.blob();

        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        }).then((base64PdfPre) => {
            const base64Pdf = (base64PdfPre as string).split(";base64,")[1];
            const pdfSize = (base64Pdf.length * (3/4)) / 1000000;

            if (pdfSize >= 4){
                alertController.create({
                    header: "Oops...",
                    message: "El archivo PDF es muy pesado, por favor, suba un documento más ligero (límite de 4MB)",
                    buttons: ["OK"]
                }).then((alert) => {
                    alert.present();
                })
                isLoadingImageCompression.value = false;
                return;
            }
            dynamicData.value.uploadedPdfBase64 = base64Pdf;
            accordionGroup.value.$el.value = "second";
        }).catch((error) => {
            isLoadingImageCompression.value = false;
            alertController.create({
                header: "Oops...",
                message: "No se pudo cargar el PDF",
                buttons: ["OK"]
            }).then((alert) => {
                alert.present();
            })
        })
        isLoadingImageCompression.value = false;
    }

    if (forceFromGallery){
        actionSheetController.create({
            header: "Selecciona una opción",
            buttons: [
                {
                    text: "Subir PDF",
                    handler: () => {
                        openPDFPicker().then(async (pdf) => {
                            await loadPdfFrom(pdf as unknown as any);
                        })
                    }
                },
                {
                    text: "Subir Foto",
                    handler: () => {
                        scanDocumentWeb().then(async (image) => {
                            await loadImageFrom(image as unknown as any);
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
const deletePdfFromStore = () => {
    dynamicData.value.uploadedPdfBase64 = null;
    dynamicData.value.currentPdfThumbnailBase64 = null;
}

const validateData = async () => {
    const formErrors: Array<{field: string, message: string}> = [];

    if (!dynamicData.value.uploadedImageBase64 && !dynamicData.value.uploadedPdfBase64){
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
            pdf_base64: dynamicData.value.originalPdfBase64 == dynamicData.value.uploadedPdfBase64 ? null : dynamicData.value.uploadedPdfBase64
        } as unknown as IInvoice;

        if ((invoiceDocument as any).pdf_base64 || invoiceDocument.pdf){
            invoiceDocument.image = null;
            (invoiceDocument as any).image_base64 = null;
        }

        if ((invoiceDocument as any).image_base64 || invoiceDocument.image){
            invoiceDocument.pdf = null;
            (invoiceDocument as any).pdf_base64 = null;
        }



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
    isLoadingImageCompression.value = true;
    isLoading.value = true;
    const response = await RequestAPI.get("/invoices/" + invoice.value.id + "/image");

    if (response.image){
        dynamicData.value.uploadedImageBase64 = response.image;
        dynamicData.value.originalImageBase64 = response.image;
    }
    isLoadingImageCompression.value = false;
    isLoading.value = false;
}

const loadPdf = async () => {
    isLoadingImageCompression.value = true;
    isLoading.value = true;
    const response = await RequestAPI.get("/invoices/" + invoice.value.id + "/pdf");

    if (response.pdf){
        dynamicData.value.uploadedPdfBase64 = response.pdf;
        dynamicData.value.originalPdfBase64 = response.pdf;
    }

    const pdf = await PDFModifier.loadPDF((() => {
        const byteCharacters = atob(response.pdf);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });


        return URL.createObjectURL(blob as Blob);
    })());

    const imageBase64 = await pdf.extractPagesIntoSingleImageAsBase64();
    dynamicData.value.currentPdfThumbnailBase64 = imageBase64;


    isLoading.value = false;
    isLoadingImageCompression.value = false;
}

const openJobSelector = (origin: string, data:any) => {
    Dialog.show(JobSelector, {
        props: {
            includeDisabledJobs: false,
            selectedJobCode: invoice.value.job_code,
            jobsFilterCallback(job: IJob){
                if (props.report.zone){
                    if (props.report.country){
                        return job.zone.toLowerCase() == props.report.zone.toLowerCase() && job.country.toLowerCase() == props.report.country.toLowerCase();
                    }else{
                        return job.zone.toLowerCase() == props.report.zone.toLowerCase();
                    }
                }else{
                    if (props.report.country){
                        return job.country.toLowerCase() == props.report.country.toLowerCase();
                    }
                }
                return true;
            }
        },
        onLoaded($this) {
            $this.on('selected', (event:any) => {
                const job = event.data;
                if (origin == 'fromSingleJobSelector'){
                    invoice.value.job_code = job.code;
                }
            })
            
        },
    })
}

const openExpenseSelector = () => {
    Dialog.show(ExpenseSelector, {
        props: {
            expensesFilterCallback(expense: IExpense){
                if (!expense.uses.includes(EExpenseUses.Reports)){
                    return false;
                }
                if (invoice.value.job_code.startsWith('000')){
                    return expense.code.length == 3;
                }else{
                    return expense.code.length != 3;
                }
            },
            selectedExpenseCode: invoice.value.expense_code
        },
        onLoaded($this) {
            $this.on('selected', (event:any) => {
                const expense = event.data;
                invoice.value.expense_code = expense.code;
            })
        },
    })
}

const previewPdfFile = () => {
    if (!dynamicData.value.uploadedPdfBase64){
        return;
    }
    if (Capacitor.isNativePlatform()){
        Toolbox.openNative('archivo-pdf.pdf', dynamicData.value.uploadedPdfBase64 as string);
    }else{
        function base64ToBlob(base64, mimeType = 'application/pdf') {
            const byteCharacters = atob(base64);
            const byteNumbers = new Array(byteCharacters.length);
            
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            
            const byteArray = new Uint8Array(byteNumbers);
            return new Blob([byteArray], { type: mimeType });
        }
        //Generate a Blob from the base64:
        const base64 = dynamicData.value.uploadedPdfBase64 as string;
        const blob = base64ToBlob(base64);

        //Create a URL from the Blob:
        const blobUrl = URL.createObjectURL(blob);

        let link = document.createElement('a');
        link.href = blobUrl;
        link.download = 'archivo-pdf.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

onMounted(async () => {
    isLoading.value = false;
    setTimeout(() => {
        accordionGroup.value.$el.value = "first";
    }, 100);
    loadJobsAndExpenses();
    dynamicData.value.datetimePickerDate = DateTime.fromISO(props.invoice.date).toISODate()?.toString() as unknown as string;

    if (props.invoice.image){
        loadImage();
    }else if (props.invoice.pdf){
        loadPdf();
    }
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
        background-color: var(--ion-color-light-tint);
    }
}
</style>