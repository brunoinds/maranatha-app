<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <IonButtons slot="start">
                    <IonBackButton :disable="isLoading" defaultHref="/reports"></IonBackButton>
                </IonButtons>
                <IonTitleSubtitle  v-show="isLoading == false" :title="report?.title" :subtitle="loadingProcess ? loadingProcess.stage.name : ''"></IonTitleSubtitle>

                <IonButtons slot="end">
                    <ion-button @click="editReport" v-if="report.status == 'Draft'">
                        <ion-icon :icon="ellipsisHorizontal"></ion-icon>
                    </ion-button>
                </IonButtons>
                <ion-progress-bar v-if="loadingProcess ? true : isLoading" :type="loadingProcess ? (loadingProcess.iddle ? 'indeterminate' : 'determinate') : 'indeterminate'"></ion-progress-bar>
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

                <article class="ion-padding"  v-if="report.status == 'Draft'" >
                    <ion-button color="success" expand="block" @click="sendReport" :disabled="invoices.length == 0 || isLoading">
                        <ion-label>
                            Cerrar y enviar reporte
                        </ion-label>
                        <ion-icon slot="start" :icon="send"></ion-icon>
                    </ion-button>
                </article>

                <article class="ion-padding" v-if="report.status == 'Submitted'">
                    <ion-button color="primary" expand="block" @click="downloadPdfAndExcelFiles">
                        <ion-label>
                            Descargar PDF y Excel
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

                        <ion-button fill="clear" color="light" :disabled="isLoading" @click="undoSendReport">
                            <ion-label>
                                Cancelar envío y reaperturar reporte
                            </ion-label>
                            <ion-icon slot="end" :icon="lockOpen"></ion-icon>
                        </ion-button>
                    </ion-card>
                    
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
                            <h3>S./ {{ invoice.amount }}</h3>
                        </ion-label>
                    </ion-item>
                </ion-list>

                <br>
                <article class="ion-padding" v-if="report.status != 'Draft'">
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
import { add, addOutline, pencilOutline, send, trashBinOutline, lockClosed, ellipsisHorizontal, closeCircleOutline, closeOutline, arrowDown, lockOpen, alertCircleOutline, lockOpenSharp, checkmarkCircleOutline,sendOutline, thumbsUpOutline } from 'ionicons/icons';
import { IReport } from '../../interfaces/ReportInterfaces';
import IonTitleSubtitle from '../../components/IonTitleSubtitle/IonTitleSubtitle.vue';

import { useRoute } from 'vue-router';
import { IInvoice } from '@/interfaces/InvoiceInterfaces';
import { DateTime } from 'luxon';
import { JobsList } from '@/utils/JobsAndProjects/JobsAndProjects';
import { PDFCreator } from '@/utils/PDFCreator/PDFCreator';
import { Dialog } from '@/utils/Dialog/Dialog';
import EditReport from '@/dialogs/EditReport/EditReport.vue';
import router from '@/router';

import NewInvoice from '@/dialogs/NewInvoice/NewInvoice.vue';
import { Session } from '@/utils/Session/Session';
import {AppEvents} from '../../utils/AppEvents/AppEvents';


const reportData = ref<IReport|null>(null);
const invoicesData = ref<Array<IInvoice>>([]);
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
    return invoicesData.value.map((invoice) => {
        return {
            ...invoice,
            date: DateTime.fromISO(invoice.date).toLocaleString(DateTime.DATE_MED),
            jobName: JobsList.find((job) => job.code === invoice.job_code)?.name
        }
    })
});
const report = computed(() => {
    return {
        ...reportData.value,
        from_date: DateTime.fromISO(reportData.value?.from_date as unknown as string).toLocaleString(DateTime.DATE_MED),
        to_date: DateTime.fromISO(reportData.value?.to_date as unknown as string).toLocaleString(DateTime.DATE_MED),
        type: reportData.value?.type,
        status: reportData.value?.status
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
    await RequestAPI.delete(`/invoices/${invoice.id}`);
    loadReportInvoices();
    toastController.create({
        message: reportType.value + ' eliminada con exito!',
        duration: 2000
    }).then((toast) => {
        toast.present();
    })
}
const openInvoice = async (invoice:IInvoice) => {
    await actionSheetController.create({
        header: 'Opciones',
        buttons: [
            {
                text: 'Eliminar ' + reportType.value,
                role: 'destructive',
                handler: () => {
                    deleteInvoice(invoice)
                }
            },
            {
                text: 'Cancelar',
                role: 'cancel',
                handler: () => {
                    console.log('Cancel clicked');
                }
            }
        ]
    }).then((actionSheet) => {
        actionSheet.present();
    })
}
const loadReport = async () => {
    const routeParams = useRoute();
    if (reportId.value === null){
        reportId.value = routeParams.params.id as string;
    }
    const reportFetched = await RequestAPI.get(`/reports/${reportId.value}`);

    reportData.value = reportFetched;
};
const loadReportInvoices = async () => {
    const invoicesFetched = await RequestAPI.get(`/reports/${reportId.value}/invoices`);
    invoicesData.value = invoicesFetched;
    isLoading.value = false;
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
        invoices: invoices.value,
        textContents: {
            submittedBy: (await Session.getCurrentSession())?.name() as unknown as string,
            fromDateToDate: `del ${report.value.from_date}  hasta el ${report.value.to_date}`,
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
        message: 'Enviando... Esto puede tardar unos minutos...',
        duration: 5000
    }).then((toast) => {
        toast.present();
    })
    isLoading.value = true;

    const pdfBase64 = await createExportPDF();

    loadingProcess.value = {
        percentage: 0,
        stage: {
            name: 'Enviando reporte...',
            percentage: 0
        },
        iddle: true
    }
    const pdfResponse = await RequestAPI.post(`/reports/${reportId.value}/pdf-upload`, {
        pdf: pdfBase64
    }, {
        onUploadProgress: (percentage) => {
            loadingProcess.value = {
                percentage: percentage,
                stage: {
                    name: 'Enviando reporte...',
                    percentage: percentage
                },
                iddle: false
            }
        }
    }) as unknown as {message: string, image: {id: string, url: string}};

    loadingProcess.value = {
        percentage: 0,
        stage: {
            name: 'Enviando reporte...',
            percentage: 0
        },
        iddle: true
    }
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
    const pdfDownloadUrl = `${RequestAPI.variables.rootUrl}/reports/${reportId.value}/pdf-download`;
    const excelDownloadUrl = `${RequestAPI.variables.rootUrl}/reports/${reportId.value}/excel-download`;

    window.open(pdfDownloadUrl);
    window.open(excelDownloadUrl);
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
</script>
