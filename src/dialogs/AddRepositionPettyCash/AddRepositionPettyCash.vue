<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Depósito de Reposición</ion-title>
                <ion-buttons slot="end">    
                    <ion-button @click="createDeposit">Depositar</ion-button>
                </ion-buttons>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <section class="ion-padding">
                <section class="ion-padding deposit-camp">
                    <CurrencyInput ref="currencyInput" class="native-input sc-ion-input-ios" style="text-align: center; font-size: 48px;" :disabled="true" v-model="dynamicData.amount" :options="{ currency: moneyType, autoDecimalDigits: false, currencyDisplay: 'narrowSymbol', locale: 'es-PE', hideCurrencySymbolOnFocus: false }"></CurrencyInput>
                </section>
            </section>
            
            
            <ion-list>
                <ion-item>
                    <ion-input label="Descripción" label-placement="stacked" placeholder="Descripcion"  v-model="dynamicData.description" :disabled="isLoading"></ion-input>
                </ion-item>

                <ion-item>
                    <ion-label position="stacked">Fecha del Depósito</ion-label>
                    <input class="native-input sc-ion-input-ios" v-maska data-maska="##/##/####" v-model="dynamicData.date" :disabled="isLoading">
                </ion-item>



                <ion-item>
                    <ion-input :label="'Código de transacción:'" label-placement="stacked" placeholder="XXXXXXXXX" v-model="dynamicData.ticketNumber"></ion-input>
                </ion-item>

                <section>
                    <ion-list v-if="dynamicData.receiptBase64 != null">
                        <ion-item>
                            <ion-thumbnail slot="start">
                                <ion-img :src="'data:image/jpeg;base64,' + dynamicData.receiptBase64"></ion-img>
                            </ion-thumbnail>
                            <ion-button fill="outline" color="danger" @click="dynamicData.receiptBase64 = null"> 
                                <ion-icon slot="start" :icon="trashBinOutline"></ion-icon>
                                Borrar Foto del Voucher
                            </ion-button>
                        </ion-item>
                    </ion-list>
                    <section class="ion-padding" v-if="!dynamicData.receiptBase64">
                        <ion-button expand="block" fill="outline" @click="loadReceiptImage" v-if="!isLoadingImageCompression"> 
                            <ion-icon slot="start" :icon="camera"></ion-icon>
                            Cargar Foto del Voucher
                        </ion-button>
                        <ion-progress-bar v-if="isLoadingImageCompression" type="indeterminate"></ion-progress-bar>
                    </section>
                </section>

            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonImg, IonToolbar, IonTitle, IonButtons, IonThumbnail, IonContent,  IonListHeader, IonIcon, IonInput, IonSelect, IonSelectOption, IonModal, IonDatetime, IonDatetimeButton, IonButton, IonList, IonItem, IonLabel, IonProgressBar, toastController, alertController, actionSheetController } from '@ionic/vue';
import { defineComponent, nextTick, onMounted, reactive, ref } from 'vue';
import { briefcaseOutline, trashBinOutline, camera, cameraOutline, qrCodeOutline, ticketOutline, checkmarkCircleOutline, arrowForwardCircleOutline, cash } from 'ionicons/icons';
import { DialogEventEmitter } from "../../utils/Dialog/Dialog";
import { vMaska } from "maska";
import { DateTime } from 'luxon';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { Session } from '@/utils/Session/Session';
import { IReportResponse, StoredReports } from '@/utils/Stored/StoredReports';
import CurrencyInput from '@/components/CurrencyInput/CurrencyInput.vue';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import imageCompression from 'browser-image-compression';
import { EReportStatus, IReport } from '@/interfaces/ReportInterfaces';
import { useRouter } from 'vue-router';
import { Capacitor } from '@capacitor/core';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { PDFModifier } from '@/utils/PDFModifier/PDFModifier';
const router = useRouter();
const isLoadingImageCompression = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
    userId: {
        type: Number,
        required: true
    },
    report: {
        type: Object as () => IReport,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    moneyType: {
        type: String,
        required: true
    }
});
const dynamicData = ref<{
    description: string,
    amount: number,
    date: string,
    ticketNumber: string,
    receiptBase64: string|null
}>({
    description: 'Reembolso de reporte "' + props.report.title + '"',
    amount: props.totalAmount,
    date: (DateTime.now().toFormat("dd/MM/yyyy") as unknown as string).toString(),
    ticketNumber: '',
    receiptBase64: null
});

const createDeposit = async () => {
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
    try {
        const responseEditReport = await RequestAPI.patch(`/reports/${props.report.id}`, {
            status: EReportStatus.Restituted
        })

        const responseBalances = await RequestAPI.get('/balance/reports/' + props.report.id + '/balances')
        
        const responseBalance = responseBalances.find((balance: any) => {
            return balance.model == 'Restitution'
        });

        RequestAPI.patch('/balances/' + responseBalance.id, {
            description: dynamicData.value.description,
            ticket_number: dynamicData.value.ticketNumber,
            date: DateTime.fromFormat(dynamicData.value.date, "dd/MM/yyyy").set({
                hour: DateTime.now().hour,
                minute: DateTime.now().minute,
                second: DateTime.now().plus({ second: 1}).second,
            }).toISO(),
            receipt_base64: dynamicData.value.receiptBase64
        }).then((response) => {
            props.emitter.fire('created', {
                ...response.balance
            });
            toastController.create({
                message: '✅ Depósito creado con éxito',
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
    } catch (error:any) {
        alertController.create({
            header: 'Oops...',
            message: error.toString(),
            buttons: ['OK']
        }).then((alert) => {
            alert.present();
        });
    }
}

const validateCamps = () => {
    let errors = [];

    if (dynamicData.value.description.trim().length == 0){
        errors.push("La descripción no puede estar vacía");
    }
    
    const isDateValid = DateTime.fromFormat(dynamicData.value.date, "dd/MM/yyyy").isValid;

    if (!isDateValid){
        errors.push(DateTime.fromFormat(dynamicData.value.date, "dd/MM/yyyy").invalidExplanation);
    }

    if (dynamicData.value.amount <= 0){
        errors.push("El monto debe ser mayor a 0");
    }

    return {
        isValid: errors.length == 0,
        errors: errors
    }
}


const loadReceiptImage = async () => {
    const getCameraImage = async () => {
        const image = await Camera.getPhoto({
            quality: 90,
            allowEditing: false,
            resultType: CameraResultType.Uri,
            source: CameraSource.Prompt,
            saveToGallery: true,
            correctOrientation: true
        });

        return {
            webPath: image.webPath as unknown as string
        }
    }
    const getPDFImage = async () => {
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
    const getImageOrPDF = async () => {
        return new Promise((resolve, reject) => {
            actionSheetController.create({
                header: 'Tipo de documento',
                buttons: [
                    {
                        text: 'Foto',
                        handler: () => {
                            getCameraImage().then((image) => {
                                resolve(image)
                            })
                        }
                    },
                    {
                        text: 'PDF',
                        handler: () => {
                            getPDFImage().then((image) => {
                                resolve(image)
                            })
                        }
                    },
                    {
                        text: 'Cancelar',
                        role: 'cancel'
                    }
                ]
            }).then((actionSheet) => {
                actionSheet.present();
            })
        })
        
    }

    const image = await getImageOrPDF() as any;

    isLoadingImageCompression.value = true;
    const response = await fetch(image.webPath as unknown as string);
    const blob = await response.blob();
    const file = new File([blob], "image.jpg", {type: blob.type});


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
            dynamicData.value.receiptBase64 = base64Image;
            isLoadingImageCompression.value = false;
        })
    })
}
</script>

<style scoped lang="scss">

.deposit-camp{
    background-color: #f7f7f7;
    border-radius: 19px;
    &:focus-within{
        background-color: #f4f4f4;
    }
}
</style>