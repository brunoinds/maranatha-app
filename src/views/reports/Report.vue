<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <IonButtons slot="start">
                    <IonBackButton :disable="isLoading || loadingProcess" defaultHref="/my-reports"></IonBackButton>
                </IonButtons>
                <IonTitleSubtitle  v-show="isLoading == false" :title="report?.title" :subtitle="loadingProcess ? loadingProcess.stage.name : ''"></IonTitleSubtitle>

                <IonButtons slot="end" v-if="!isOfflineReport">
                    <ion-button @click="editReport" v-if="report.status == 'Draft'" :disabled="loadingProcess">
                        <ion-icon :icon="ellipsisHorizontal"></ion-icon>
                    </ion-button>
                </IonButtons>
                <ion-progress-bar v-if="loadingProcess ? true : isLoading" :type="loadingProcess ? (loadingProcess.iddle ? 'indeterminate' : 'determinate') : 'indeterminate'" :value="loadingProcess ? (loadingProcess.iddle ? undefined : loadingProcess.percentage) : undefined"></ion-progress-bar>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <article v-if="reportData != null">
                <ion-list>
                    <ion-item>
                        <ion-label>
                            <h1><b>{{ report.title }}</b></h1>
                            <p>{{reportType}}s</p>
                            <p>{{report.from_date}} - {{ report.to_date }}</p>
                        </ion-label>
                        <ion-chip color="warning" v-if="report.status == 'Draft'">
                            <ion-icon :icon="alertCircleOutline"></ion-icon>
                            <ion-label>{{reportStatus}}</ion-label>
                        </ion-chip>
                        <ion-chip color="primary" v-if="report.status == 'Submitted'">
                            <ion-icon :icon="sendOutline"></ion-icon>
                            <ion-label>{{reportStatus}}</ion-label>
                        </ion-chip>
                        <ion-chip color="success" v-if="report.status == 'Approved'">
                            <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                            <ion-label>{{reportStatus}}</ion-label>
                        </ion-chip>
                        <ion-chip color="danger" v-if="report.status == 'Rejected'">
                            <ion-icon :icon="closeCircleOutline"></ion-icon>
                            <ion-label>{{reportStatus}}</ion-label>
                        </ion-chip>
                    </ion-item>
                </ion-list>

                <article class="ion-padding"  v-if="report.status == 'Draft' && !isOfflineReport" >
                    <ion-button color="success" expand="block" @click="sendReport" :disabled="invoices.length == 0 || isLoading || invoicesDataWithPendingImageUpload.length > 0">
                        <ion-label>
                            Cerrar y enviar reporte
                        </ion-label>
                        <ion-icon slot="start" :icon="send"></ion-icon>
                    </ion-button>
                    <ion-label v-if="invoicesDataWithPendingImageUpload.length > 0">
                        <p style="font-size: 9px; text-align: center;">
                            Hay {{ invoicesDataWithPendingImageUpload.length }} {{ reportType.toLowerCase() }}s que aún no ha sido subida al servidor. Por favor, espere a que se suban todas las imágenes para poder enviar el reporte.
                        </p>
                    </ion-label>
                </article>

                <article class="ion-padding" v-if="report.status != 'Draft'">
                    <ion-button color="primary" expand="block" @click="downloadPdfAndExcelFiles" :disabled="isLoading">
                        <ion-label>
                            Descargar Reporte
                        </ion-label>
                        <ion-icon slot="start" :icon="arrowDown"></ion-icon>
                    </ion-button>
                </article>

                <section v-if="report.status == 'Submitted' && isAdmin">
                    <ion-card color="light">
                        <ion-card-header>
                            <ion-card-title>Esperando aprobación...</ion-card-title>
                            <ion-card-subtitle>ACCIÓN REQUERIDA</ion-card-subtitle>
                        </ion-card-header>

                        <ion-card-content>
                            Este reporte ha sido enviado y está esperando por su aprobación.
                            <br>
                            <br>

                            <article v-if="report.status == 'Submitted' && isAdmin">
                                <section style="display: flex; align-items: center; justify-content: space-between;">
                                    <ion-button style="width: 100%" color="success" expand="block" @click="acceptReport">
                                        <ion-label>
                                            Aceptar reporte
                                        </ion-label>
                                        <ion-icon slot="start" :icon="thumbsUpOutline"></ion-icon>
                                    </ion-button>
                                    <ion-button  style="width: 100%" color="danger" expand="block" @click="rejectReport">
                                        <ion-label>
                                            Rechazar
                                        </ion-label>
                                        <ion-icon slot="start" :icon="closeCircleOutline"></ion-icon>
                                    </ion-button>
                                </section>
                            </article>
                        </ion-card-content>
                    </ion-card>
                    
                </section>

                

                <section v-if="report.status == 'Rejected'">
                    <ion-card color="danger">
                        <ion-card-header>
                            <ion-card-title>Reporte rechazado</ion-card-title>
                            <ion-card-subtitle>ACCIÓN REQUERIDA</ion-card-subtitle>
                        </ion-card-header>

                        <ion-card-content>
                            <b>Este reporte ha sido rechazado por el administrador por el siguiente motivo:</b> <br>
                            {{ report.rejection_reason }}
                        </ion-card-content>
                    </ion-card>
                    <section class="ion-padding" style="padding-top: 0px">
                        <ion-button color="danger" expand="block" fill="outline" :disabled="isLoading" @click="undoSendReport">
                            <ion-label>
                                Cancelar envío y reaperturar reporte
                            </ion-label>
                            <ion-icon slot="start" :icon="lockOpen"></ion-icon>
                        </ion-button>
                    </section>
                    
                </section>

                <br>

                <ion-list-header style="font-size: 15px">{{ reportType }}s del reporte ({{ invoices.length }} / 28)</ion-list-header>
                
                <section class="ion-padding">
                    <ion-button expand="block" fill="outline" @click="addInvoice" :disabled="invoices.length == 28 || isLoading" v-if="report.status == 'Draft'"> 
                        <ion-icon slot="start" :icon="add"></ion-icon>
                        Añadir {{ reportType }}
                    </ion-button>
                </section>
                <ion-list>
                    <ion-item v-for="invoice in invoices" :key="invoice.id" @click="openInvoice(invoice)" button :detail="true" :disabled="report.status != 'Draft'">
                        <ion-label>
                            <h2><b>{{ invoice.description }}</b></h2>
                            <h3>{{ invoice.date }}</h3>
                            <p>{{ invoice.jobName }}</p>
                        </ion-label>
                        <ion-label slot="end">
                            <h3>{{report.moneyPrefix}} {{ invoice.amount }}</h3>
                        </ion-label>

                        <ion-chip  slot="end" color="warning" v-if="invoice.pending && invoice.pending.uploadStatus == 'UploadingImage'">
                            <ion-icon :icon="cloudUploadOutline"></ion-icon>
                            <ion-label>Subiendo</ion-label>
                        </ion-chip>
                        <ion-chip  slot="end" color="danger" v-if="invoice.pending && invoice.pending.uploadStatus == 'ErrorOnUploadImage'">
                            <ion-icon :icon="alertCircleOutline"></ion-icon>
                            <ion-label>Error</ion-label>
                        </ion-chip>
                    </ion-item>
                </ion-list>

                <br>
                <article class="ion-padding" v-if="(report.status == 'Submitted') || (isAdmin && report.status != 'Draft')">
                    <ion-button color="danger" expand="block" fill="outline" :disabled="isLoading" @click="undoSendReport">
                        <ion-label>
                            Cancelar envío y reaperturar reporte
                        </ion-label>
                        <ion-icon slot="start" :icon="lockOpen"></ion-icon>
                    </ion-button>
                </article>
            </article>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar,IonCard, IonCardHeader, IonCardSubtitle, IonCardContent, IonCardTitle, IonTitle,IonChip, IonContent, IonIcon, IonListHeader, IonButton, IonList, IonItem, IonLabel, IonProgressBar, modalController, IonBackButton, IonButtons, actionSheetController, toastController, alertController } from '@ionic/vue';
import { RequestAPI } from '../../utils/Requests/RequestAPI';
import { computed, ref } from 'vue';
import { add, addOutline, pencilOutline, send, trashBinOutline, cloudUploadOutline, lockClosed, ellipsisHorizontal, closeCircleOutline, closeOutline, arrowDown, lockOpen, alertCircleOutline, lockOpenSharp, checkmarkCircleOutline,sendOutline, thumbsUpOutline } from 'ionicons/icons';
import { EMoneyType, IReport } from '../../interfaces/ReportInterfaces';
import IonTitleSubtitle from '../../components/IonTitleSubtitle/IonTitleSubtitle.vue';

import { useRoute } from 'vue-router';
import { IInvoice } from '@/interfaces/InvoiceInterfaces';
import { DateTime } from 'luxon';
import { PDFCreator } from '@/utils/PDFCreator/PDFCreator';
import { Dialog } from '@/utils/Dialog/Dialog';
import EditReport from '@/dialogs/EditReport/EditReport.vue';
import router from '@/router';

import NewInvoice from '@/dialogs/NewInvoice/NewInvoice.vue';
import { Session } from '@/utils/Session/Session';
import {AppEvents} from '../../utils/AppEvents/AppEvents';
import { TStorage } from '@/utils/Toolbox/TStorage';
import { StoredReports } from '@/utils/Stored/StoredReports';
import { StoredInvoices } from '@/utils/Stored/StoredInvoices';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import JSZip from 'jszip';
import { Toolbox } from '@/utils/Toolbox/Toolbox';

const reportData = ref<IReport|null>(null);
const invoicesData = ref<Array<IInvoice>>([]);
const invoicesDataWithPendingImageUpload = ref<Array<IInvoice>>([]);
const isLoading = ref<boolean>(true);
const reportId = ref<string|null>(null);
const page = ref<HTMLElement|null>(null);
const loadingProcess = ref<{
    percentage: number,
    stage: {
        name: string,
        percentage: number
    },
    iddle: boolean
}|null>(null);
const signal = ref("");


const isOfflineReport = computed(() => {
    return !navigator.onLine
})
const reportType = computed(() => {
    return report.value.type === "Bill" ? "Boleta" : "Factura";
})
const reportStatus = computed(() => {
    return (() => {
        if (report.value.status == 'Draft'){
            return 'Pendiente';
        }else if (report.value.status == 'Submitted'){
            return 'Enviado';
        }else if (report.value.status == 'Approved'){
            return 'Aprobado';
        }else if (report.value.status == 'Rejected'){
            return 'Rechazado';
        }
    })();
})
const invoices = computed(() => {
    let invoicesFetched = invoicesData.value;

    invoicesFetched = invoicesFetched.map((item:any) => {
        const invoiceWithPendingImageUpload = invoicesDataWithPendingImageUpload.value.find((invoice:any) => invoice.id == item.id);
        if (invoiceWithPendingImageUpload){
            return {
                ...item,
                pending: invoiceWithPendingImageUpload
            };
        }

        return item;
    })


    return invoicesFetched.map((invoice) => {
        return {
            ...invoice,
            date: DateTime.fromISO(invoice.date).toLocaleString(DateTime.DATE_MED),
            jobName: "" //JobsList.find((job) => job.code === invoice.job_code)?.name
        }
    })
});
const report = computed(() => {
    return {
        ...reportData.value,
        from_date: DateTime.fromISO(reportData.value?.from_date as unknown as string).toLocaleString(DateTime.DATE_MED),
        to_date: DateTime.fromISO(reportData.value?.to_date as unknown as string).toLocaleString(DateTime.DATE_MED),
        type: reportData.value?.type,
        status: reportData.value?.status,
        moneyPrefix: (() => {
            return Toolbox.moneyPrefix(reportData.value?.money_type as unknown as EMoneyType)
        })()
    }
});

const addInvoice = async () => {
    Dialog.show(NewInvoice, {
        props:{
            reportId: reportId.value,
            type: report.value.type,
            autoShowCamera: false
        },
        onLoaded($this) {
            $this.on('created', (event:any) => {
                loadReportInvoices();
            })
            $this.on('pre-created', (event:any) => {
                loadReportInvoices();
            })
            $this.on('error-upload-image', (event:any) => {
                loadReportInvoices();
            })
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        }
    })
}
const editReport = async () => {
    Dialog.show(EditReport, {
        props: {
            reportId: reportId.value
        },
        modalControllerOptions: {
            presentingElement: page as unknown as HTMLElement,
            swipeToClose: true
        },
        onLoaded($this) {
            $this.on('updated', (event:any) => {
                initialize();
            })
            $this.on('deleted', (event:any) => {
                router.back();
            })
        }
    })
}
const deleteInvoice = async (invoice:IInvoice) => {
    if (invoice.id >= 10000){
        //Delete from localDB;
        await StoredInvoices.removeLocalInvoice(invoice.id);
    }else{
        await RequestAPI.delete(`/invoices/${invoice.id}`);
    }
    loadReportInvoices();
    toastController.create({
        message: reportType.value + ' eliminada con exito!',
        duration: 2000
    }).then((toast) => {
        toast.present();
    })
}
const openInvoice = async (invoice:IInvoice) => {
    let buttons = [
        {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
                
            }
        }
    ]
    if ((isOfflineReport.value && invoice.id >= 10000) || !isOfflineReport.value){
        //Prepend button to retry upload image:
        buttons = [
            {
                text: 'Eliminar ' + reportType.value,
                role: 'destructive',
                handler: () => {
                    deleteInvoice(invoice)
                }
            },
            ...buttons
        ]
    }


    await actionSheetController.create({
        header: 'Opciones',
        buttons: buttons
    }).then((actionSheet) => {
        actionSheet.present();
    })
}
const loadReport = async () => {
    const routeParams = useRoute();
    if (reportId.value === null){
        reportId.value = routeParams.params.id as string;
    }

    const reportFetched = await StoredReports.getReport(parseInt(reportId.value));
    reportData.value = reportFetched;
};
const loadReportInvoices = async () => {
    return new Promise(async (resolve, reject) => {
        const routeParams = useRoute();
        if (reportId.value === null){
            reportId.value = routeParams.params.id as string;
        }
        let invoicesFetched = await StoredInvoices.getInvoices(parseInt(reportId.value));
        invoicesData.value = invoicesFetched;
        isLoading.value = false;
        resolve({})
    })
}


const acceptReport = async () => {
    isLoading.value = true;

    const pdfResponse = await RequestAPI.patch(`/reports/${reportId.value}`, {
        status: 'Approved'
    })
    isLoading.value = false;
    toastController.create({
        message: 'Reporte aprobado con exito!',
        duration: 2000
    }).then((toast) => {
        toast.present();
    })
    initialize();
    AppEvents.emit('reports:reload');
}
const rejectReport = async () => {
    const prompt = await alertController.create({
        header: 'Rechazar reporte',
        inputs: [
            {
                name: 'rejection_reason',
                type: 'textarea',
                placeholder: 'Motivo de rechazo'
            }
        ],
        buttons: [
            {
                text: 'Cancelar',
                role: 'cancel'
            },
            {
                text: 'Rechazar',
                handler: async (data) => {
                    isLoading.value = true;
                    const pdfResponse = await RequestAPI.patch(`/reports/${reportId.value}`, {
                        status: 'Rejected',
                        rejection_reason: data.rejection_reason
                    })
                    isLoading.value = false;
                    toastController.create({
                        message: 'Reporte rechazado con exito!',
                        duration: 2000
                    }).then((toast) => {
                        toast.present();
                    })
                    initialize();
                    AppEvents.emit('reports:reload');
                }
            }
        ]
    })

    prompt.present();
}
const createExportPDF = async () => {
    const instance = new PDFCreator({
        report: reportData.value as IReport,
        invoices: (() => {
            const invoices = invoicesData.value.map((invoice) => {
                return invoice;
            });
            invoices.sort((a, b) => {
                return DateTime.fromISO(a.date).toMillis() - DateTime.fromISO(b.date).toMillis();
            });
            return invoices;
        })(),
        textContents: {
            submittedBy: (await Session.getCurrentSession())?.name() as unknown as string,
            fromDateToDate: (() => {
                if (invoicesData.value.length == 0){
                    return `del ${report.value.from_date}  hasta el ${report.value.to_date}`;
                }else{
                    return `del ${DateTime.fromISO(invoicesData.value[0].date).toLocaleString(DateTime.DATE_MED)}  hasta el ${DateTime.fromISO(invoicesData.value[invoicesData.value.length - 1].date).toLocaleString(DateTime.DATE_MED)}`;
                }
            })(),
            currency: (() => {
                return report.value.money_type == EMoneyType.PEN ? 'Peruvian Soles (PEN)' : 'US Dollars (USD)';
            })()
        },
        listenTo: {
            onProgress: (progress) => {
                loadingProcess.value = {
                    ...progress,
                    iddle: false
                };
            }
        }
    });
    const base64String = (await instance.create()).split('data:application/pdf;filename=generated.pdf;base64,')[1];
    return base64String;
}

const undoSendReport = async () => {
    isLoading.value = true;

    const pdfResponse = await RequestAPI.patch(`/reports/${reportId.value}`, {
        status: 'Draft'
    })
    isLoading.value = false;
    toastController.create({
        message: 'Reporte reaperturado con exito!',
        duration: 2000
    }).then((toast) => {
        toast.present();
    })
    initialize();
    AppEvents.emit('reports:reload');
}
const sendReport = async () => {
    toastController.create({
        message: 'Enviando...',
        duration: 2000
    }).then((toast) => {
        toast.present();
    })
    isLoading.value = true;

    const updateReportResponse = await RequestAPI.patch(`/reports/${reportId.value}`, {
        status: 'Submitted'
    })
    isLoading.value = false;
    loadingProcess.value = null;

    const alert = await alertController.create({
        header: '¡Éxito!',
        message: 'El reporte ha sido enviado con exito. El moderador lo revisará y lo aprobará en breve.',
        buttons: [
            {
                text: 'OK',
                role: 'cancel'
            }
        ]
    })
    alert.present();
    initialize();
    AppEvents.emit('reports:reload');
}


const downloadPdfAndExcelFiles = async () => {
    const invoicesTotalAmount = invoicesData.value.reduce((total, invoice) => {
        return total + invoice.amount;
    }, 0);

    const filename = `${reportData.value?.title} (${Toolbox.moneyPrefix(reportData.value?.money_type as unknown as EMoneyType).replace('/', '')} ${invoicesTotalAmount.toFixed(2)})`;
    const generatePDFDocument = async () => {
        toastController.create({
            message: 'Generando PDF... Esto puede tardar unos minutos...',
            duration: 5000
        }).then((toast) => {
            toast.present();
        })
        isLoading.value = true;

        const pdfBase64 = await createExportPDF();

        loadingProcess.value = {
            iddle: true,
            percentage: 0,
            stage: {
                name: 'Descargando PDF...',
                percentage: 0
            }
        }

        //Generate blob from base64 string and download it:
        const byteCharacters = atob(pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {type: 'application/pdf'});
        const blobUrl = URL.createObjectURL(blob);
        return {
            blobUrl,
            base64: pdfBase64
        };
    }
    const generateExcelDocument = async () => {
        return new Promise(async (resolve, reject) => {
            loadingProcess.value = {
                iddle: true,
                percentage: 0,
                stage: {
                    name: 'Descargando Excel...',
                    percentage: 0
                }
            }

            const excelDownloadUrl = `${RequestAPI.variables.rootUrl}/reports/${reportId.value}/excel-download`;
            const excelDocument = await fetch(excelDownloadUrl).then((response) => {
                return response.blob();
            }).then((blob) => {
                const reader = new FileReader()
                reader.onload = () => {
                    resolve({
                        blobUrl: URL.createObjectURL(blob),
                        base64: reader.result?.split('data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,')[1] as unknown as string
                    })
                }
                reader.onerror = () => {                
                    console.log('error')
                }
                reader.readAsDataURL(blob);
            })
        })
        
    }
    const compressIntoZipFile = async (pdfDocument:any, excelDocument:any) => {
        return new Promise(async (resolve, reject) => {
            const zip = new JSZip();
            zip.file(filename + '.pdf', pdfDocument.base64, {base64: true});
            zip.file(filename + '.xlsx', excelDocument.base64, {base64: true});
            const zipFile = await zip.generateAsync({type:"blob"});

            //Convert zipFile to base64:
            const reader = new FileReader()
            reader.onload = () => {
                resolve({
                    base64: reader.result?.split('data:application/zip;base64,')[1],
                    blobUrl: URL.createObjectURL(zipFile)
                })
            }
            reader.onerror = () => {                
                console.log('error')
            }
            reader.readAsDataURL(zipFile);
        })
    }
    

    const shareDocument = (file:any, extention:string = ".zip") => {
        loadingProcess.value = null;
        isLoading.value = false;

        toastController.create({
            message: '✅ Reporte generado con éxito!',
            duration: 1500
        }).then((toast) => {
            toast.present();
        })
        if (Capacitor.isNativePlatform()){
            share(filename + extention, file.base64);
        }else{
            let link = document.createElement('a');
            link.href = file.blobUrl;
            link.download = filename + extention;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }


    await actionSheetController.create({
        header: 'Elige un formato para descargar:',
        buttons: [
            {
                text: 'PDF',
                handler: () => {
                    generatePDFDocument().then((pdfDocument) => {
                        shareDocument(pdfDocument, '.pdf');
                    })
                }
            },
            {
                text: 'Excel',
                handler: () => {
                    generateExcelDocument().then((excelDocument) => {
                        shareDocument(excelDocument, '.xlsx');
                    })
                }
            },
            {
                text: 'Zip',
                handler: () => {
                    generatePDFDocument().then((pdfDocument) => {
                        generateExcelDocument().then((excelDocument) => {
                            compressIntoZipFile(pdfDocument, excelDocument).then((zipFile) => {
                                shareDocument(zipFile, '.zip');
                            })
                        })
                    });
                }
            },
            {
                text: 'Cancelar',
                role: 'cancel',
                handler: () => {
                    
                }
            }
        ]
    }).then((actionSheet) => {
        actionSheet.present();
    })
}
const initialize = async () => {
    await loadReport();
    await loadReportInvoices();
}
const isAdmin = ref(false);
const isAdminCheck = async () => {
    const currentSession = await Session.getCurrentSession();
    if (!currentSession){
        return;
    };

    isAdmin.value = currentSession.roles().includes("admin");
}
isAdminCheck();
initialize();


function share(fileName: string, base64Data: string) {
    return Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache
    })
    .then(() => {
        return Filesystem.getUri({
            directory: Directory.Cache,
            path: fileName
        });
    })
    .then((uriResult) => {
        return Share.share({
            title: fileName,
            text: fileName,
            url: uriResult.uri,
        });
    });
}
</script>
