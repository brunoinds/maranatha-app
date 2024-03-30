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
                <ion-progress-bar v-if="loadingProcess ? true : isLoading" :type="loadingProcess ? (loadingProcess.iddle ? 'indeterminate' : 'determinate') : 'indeterminate'" :value="loadingProcess ? (loadingProcess.iddle ? undefined : loadingProcess.percentage * 0.01) : undefined"></ion-progress-bar>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <article v-if="reportData != null">
                <ion-list>
                    <ion-item>
                        <ion-label>
                            <h1><b>{{ report.title }}</b></h1>
                            <p>{{reportType}}s {{ Toolbox.countryName(report.country as unknown as any, {flagOnly: true}) }} </p>
                            <p>{{report.from_date}} - {{ report.to_date }}</p>
                            <p><b>{{report.moneyPrefix}} {{ report.amount.text }}</b></p>
                        </ion-label>
                        <ReportStatusChip :report="reportData"></ReportStatusChip>
                    </ion-item>
                </ion-list>

                <main class="content">
                    
                    <article class="ion-padding"  v-if="report.status == 'Draft' && !isOfflineReport" >
                        <ion-button color="success" expand="block" @click="sendReport" :disabled="invoices.length == 0 || isLoading || invoicesDataWithPendingImageUpload.length > 0">
                            <ion-label>
                                Cerrar y enviar reporte
                            </ion-label>
                            <ion-icon slot="start" :icon="send"></ion-icon>
                        </ion-button>

                        <div>
                            <ion-button color="tertiary" fill="clear" expand="block" @click="downloadPdfAndExcelFiles('PDF')" :disabled="invoices.length == 0 || isLoading || invoicesDataWithPendingImageUpload.length > 0">
                                <ion-label>
                                    Previsualizar PDF
                                </ion-label>
                                <ion-icon slot="start" :icon="eyeOutline"></ion-icon>
                            </ion-button>
                        </div>

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

                    <section v-if="report.status == EReportStatus.Submitted && isAdmin">
                        <ion-card color="light">
                            <ion-card-header>
                                <ion-card-title>Esperando aprobación...</ion-card-title>
                                <ion-card-subtitle>ACCIÓN REQUERIDA</ion-card-subtitle>
                            </ion-card-header>

                            <ion-card-content>
                                Este reporte ha sido enviado y está esperando por su aprobación.
                                <br>
                                <br>

                                <article v-if="report.status == EReportStatus.Submitted && isAdmin">
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

                    <section v-if="report.status == EReportStatus.Approved && isAdmin">
                        <ion-card color="light">
                            <ion-card-header>
                                <ion-card-title>Esperando reembolso...</ion-card-title>
                                <ion-card-subtitle>ACCIÓN REQUERIDA</ion-card-subtitle>
                            </ion-card-header>

                            <ion-card-content>
                                Este reporte ha sido aprobado y está esperando por la restitución de <b>{{report.moneyPrefix}}{{ report.amount.text }}</b> a la cuenta bancária.
                                <br>
                                <br>

                                <article v-if="report.status == EReportStatus.Approved && isAdmin">
                                    <section style="display: flex; align-items: center; justify-content: space-between;">
                                        <ion-button style="width: 100%" color="warning" expand="block" @click="depositRestitution">
                                            <ion-label>
                                                Realizar reposición de fondos
                                            </ion-label>
                                            <ion-icon slot="start" :icon="cashOutline"></ion-icon>
                                        </ion-button>
                                    </section>
                                </article>
                            </ion-card-content>
                        </ion-card>
                    </section>

                    

                    <section v-if="report.status == EReportStatus.Rejected">
                        <ion-card color="danger">
                            <ion-card-header>
                                <ion-card-title>Reporte rechazado</ion-card-title>
                                <ion-card-subtitle>ACCIÓN REQUERIDA</ion-card-subtitle>
                            </ion-card-header>

                            <ion-card-content>
                                <b>Este reporte ha sido rechazado por el administrador por el siguiente motivo:</b> <br><br>
                                {{ report.rejection_reason }}


                                <br><br>
                                <ion-button expand="block" color="light" @click="undoSendReport">
                                    <ion-icon slot="end" :icon="arrowForwardOutline"></ion-icon>
                                    Corregir observaciones ahora
                                </ion-button>
                            </ion-card-content>


                        </ion-card>
                    </section>

                    <section v-if="report.status == EReportStatus.Approved && !isAdmin">
                        <ion-card color="tertiary">
                            <ion-card-header>
                                <ion-card-title>Esperando reembolso...</ion-card-title>
                                <ion-card-subtitle style="font-size: 30px">
                                    <ion-icon :icon="cashOutline"></ion-icon>
                                </ion-card-subtitle>
                            </ion-card-header>

                            <ion-card-content>
                                <b>Reporte aprobado</b>
                                <br>
                                Este reporte ha sido aprobado por el administrador. El depósito de <b>{{report.moneyPrefix}}{{ report.amount.text }}</b> será realizado a su cuenta lo antes posible.
                            </ion-card-content>
                        </ion-card>
                    </section>

                    <section v-if="report.status == EReportStatus.Restituted">
                        <ion-card color="success">
                            <ion-card-header>
                                <ion-card-title>Reporte pagado</ion-card-title>
                                <ion-card-subtitle style="font-size: 30px">
                                    <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                                </ion-card-subtitle>
                            </ion-card-header>

                            <ion-card-content>
                                <b>Reporte aprobado y restituido.</b>
                                <br>
                                Este reporte ha sido aprobado por el administrador y ya se reembolsó el valor de <b>{{report.moneyPrefix}}{{ report.amount.text }}</b> a su cuenta.


                                <br><br>
                                <ion-button expand="block" color="light" @click="downloadBalanceReceiptImage">
                                    <ion-icon slot="start" :icon="documentTextOutline"></ion-icon>
                                    Ver comprobante de depósito
                                </ion-button>
                            </ion-card-content>
                        </ion-card>
                    </section>


                    <section v-if="report.status == EReportStatus.Submitted && !isAdmin">
                        <ion-card color="warning">
                            <ion-card-header>
                                <ion-card-title>Esperando aprobación...</ion-card-title>
                                <ion-card-subtitle style="font-size: 30px">
                                    <ion-icon :icon="timeOutline"></ion-icon>
                                </ion-card-subtitle>
                            </ion-card-header>

                            <ion-card-content>
                                <b>Reporte enviado.</b>
                                <br>
                                Este reporte ha sido enviado al administrador. El lo revisará y lo aprobará lo antes posible.


                                <br><br>
                                <ion-button expand="block" color="light" @click="undoSendReport">
                                    <ion-icon slot="start" :icon="closeCircleOutline"></ion-icon>
                                    Cancelar envío y reaperturar reporte
                                </ion-button>
                            </ion-card-content>
                        </ion-card>
                    </section>


                    <section v-if="duplicatedInvoices.hasDuplicatedInvoices && report.status == EReportStatus.Draft">
                        <ion-card color="warning">
                            <ion-card-content>
                                <b>⚠️ Aviso: {{reportType.toLowerCase()}}s duplicadas</b>
                                <br>
                                <p>Este reporte contiene {{ duplicatedInvoices.items.length }} {{reportType.toLowerCase()}}s duplicadas y pueden ser rechazadas por el administrador.</p>
                            </ion-card-content>
                        </ion-card>
                    </section>


                    <section v-if="duplicatedInvoices.hasDuplicatedInvoices && report.status == EReportStatus.Submitted && isAdmin">
                        <ion-card color="warning">
                            <ion-card-content>
                                <b>⚠️ Aviso: {{reportType.toLowerCase()}}s duplicadas</b>
                                <br>
                                <p>Este reporte contiene {{ duplicatedInvoices.items.length }} {{reportType.toLowerCase()}}s duplicadas. Verifica antes de aprobar el reporte.</p>
                            </ion-card-content>
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
                        <ion-progress-bar v-if="isUpdatingPending" type="indeterminate"></ion-progress-bar>

                        <ion-item v-for="invoice in invoices" :key="invoice.id" @click="openInvoice(invoice)" button :detail="true">
                            <ion-label>
                                <h2><b>{{ invoice.description }}</b></h2>
                                <h3>{{ invoice.date }}</h3>
                                <p>{{ invoice.jobName }}</p>
                            </ion-label>

                            <ion-label slot="end">
                                <h3>{{report.moneyPrefix}} {{ Toolbox.moneyFormat(invoice.amount) }}</h3>
                            </ion-label>
                            <ion-badge v-if="duplicatedInvoices.items.find(item => item.id == invoice.id) && (report.status != EReportStatus.Approved && report.status != EReportStatus.Restituted)" color="warning" slot="end">D</ion-badge>
                        </ion-item>
                    </ion-list>

                    <br>
                    <article class="ion-padding" v-if="(report.status == 'Submitted') || (isAdmin && report.status != 'Draft')">
                        <ion-button color="danger" expand="block" fill="outline" :disabled="isLoading" @click="undoSendReport">
                            <ion-label>
                                Cancelar envío y reaperturar reporte
                            </ion-label>
                            <ion-icon slot="start" :icon="closeCircleOutline"></ion-icon>
                        </ion-button>
                    </article>

                    
                </main>
            </article>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar,IonCard, IonBadge, IonCardHeader, IonCardSubtitle, IonCardContent, IonCardTitle, IonTitle,IonChip, IonContent, IonIcon, IonListHeader, IonButton, IonList, IonItem, IonLabel, IonProgressBar, modalController, IonBackButton, IonButtons, actionSheetController, toastController, alertController } from '@ionic/vue';
import { RequestAPI } from '../../utils/Requests/RequestAPI';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { add, addOutline, pencilOutline, send, trashBinOutline, cashOutline, cloudUploadOutline, lockClosed, ellipsisHorizontal, closeCircleOutline, closeOutline, arrowDown, lockOpen, alertCircleOutline, lockOpenSharp, checkmarkCircleOutline,sendOutline, thumbsUpOutline, checkmark, checkmarkDoneOutline, timeOutline, lockOpenOutline, documentTextOutline, eyeOffOutline, eyeOutline, chevronForwardCircleOutline, arrowForwardOutline } from 'ionicons/icons';
import { EMoneyType, EReportStatus, IReport } from '../../interfaces/ReportInterfaces';
import IonTitleSubtitle from '../../components/IonTitleSubtitle/IonTitleSubtitle.vue';

import { useRoute } from 'vue-router';
import { IInvoice } from '@/interfaces/InvoiceInterfaces';
import { DateTime } from 'luxon';
import { PDFCreator } from '@/utils/PDFCreator/PDFCreator';
import { Dialog } from '@/utils/Dialog/Dialog';
import EditReport from '@/dialogs/EditReport/EditReport.vue';
import router from '@/router';

import NewInvoice from '@/dialogs/NewInvoice/NewInvoice.vue';
import EditInvoice from '@/dialogs/EditInvoice/EditInvoice.vue';
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
import ReportStatusChip from '@/components/ReportStatusChip/ReportStatusChip.vue';
import Numeral from 'numeral';
import AddRepositionPettyCash from '@/dialogs/AddRepositionPettyCash/AddRepositionPettyCash.vue';
import _ from 'lodash';

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

const dynamicMarkers = ref({
    showedExtrapolatePdfSize: false
})

const isOfflineReport = computed(() => {
    return !navigator.onLine
})
const reportType = computed(() => {
    return report.value.type === "Bill" ? "Boleta" : "Factura";
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
            jobName: "",
            original: invoice //JobsList.find((job) => job.code === invoice.job_code)?.name
        }
    })
});
const report = computed(() => {
    const amount = invoicesData.value.reduce((total, invoice) => {
        return total + invoice.amount;
    }, 0);

    return {
        ...reportData.value,
        from_date: DateTime.fromISO(reportData.value?.from_date as unknown as string).toLocaleString(DateTime.DATE_MED),
        to_date: DateTime.fromISO(reportData.value?.to_date as unknown as string).toLocaleString(DateTime.DATE_MED),
        type: reportData.value?.type,
        status: reportData.value?.status,
        moneyPrefix: (() => {
            return Toolbox.moneyPrefix(reportData.value?.money_type as unknown as EMoneyType)
        })(),
        amount: {
            value: amount,
            text: Numeral(amount).format('0,0.00')
        }
    }
});

const duplicatedInvoices = computed(() => {
    let listIdentificators:any = [];


    invoicesData.value.forEach((invoice) => {
        let isSameJob = false;
        if (invoice.description.includes('[') && invoice.description.includes(']') && invoice.description.includes('/')  && invoice.description.includes('%')){
            isSameJob = true;
        }

        if (!isSameJob){
            listIdentificators.push({
                id: invoice.id,
                invoice: invoice,
                identificator: invoice.commerce_number + '//' + invoice.ticket_number
            });
        }
    })

    const onlyDuplicatedItems = listIdentificators.filter((item, index) => {
        return listIdentificators.findIndex((item2) => item2.identificator == item.identificator) != index;
    })


    return {
        hasDuplicatedInvoices: onlyDuplicatedItems.length > 0,
        items: onlyDuplicatedItems
    }
})

const addInvoice = async () => {
    const showAddInvoiceModal = () => {
        Dialog.show(NewInvoice, {
            props:{
                report: report.value,
                reportInvoices: invoices.value,
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


    const checkExtrapolatePdfSize = () => {
        //Sum invoices.image_size (bytes), check if the sum is greater than 22MB:
        const sum = invoices.value.reduce((total, invoice) => {
            return total + (invoice.image_size || 0);
        }, 0);

        const isExtrapolatePdfSize = (sum > 22000000); // 22000000
        if (isExtrapolatePdfSize && !dynamicMarkers.value.showedExtrapolatePdfSize){
            dynamicMarkers.value.showedExtrapolatePdfSize = true;
            alertController.create({
                header: '¡Atención!',
                message: 'El tamaño del PDF final probablemente excederá el límite de 25MB. ¿Deseas continuar subiendo otros documentos en este reporte?',
                buttons: [
                    {
                        text: 'No',
                        role: 'cancel'
                    },
                    {
                        text: 'Sí',
                        role: 'confirm',
                        handler: () => {
                            showAddInvoiceModal();
                        }
                    }
                ]
            }).then((alert) => {
                alert.present();
            })
        }else{
            showAddInvoiceModal();
        }
    }

    checkExtrapolatePdfSize();
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
        message: '✅ ' + reportType.value + ' eliminada con éxito',
        duration: 2000
    }).then((toast) => {
        toast.present();
    })
}
const editInvoice = async (invoice:IInvoice, readonly: boolean = false) => {
    Dialog.show(EditInvoice, {
        props:{
            report: report.value,
            invoice: invoice,
            type: report.value.type,
            autoShowCamera: false,
            readonly: readonly
        },
        onLoaded($this) {
            $this.on('updated', (event:any) => {
                loadReportInvoices();
            })
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        }
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

    if ((invoice.id < 10000) && !isOfflineReport.value){
        //Prepend button to retry upload image:
        buttons = [            
            {
                text: 'Editar ' + reportType.value,
                role: 'ok',
                handler: () => {
                    editInvoice(invoice.original)
                }
            },
            ...buttons
        ]
    }
    if ((isOfflineReport.value && invoice.id >= 10000) || !isOfflineReport.value){
        //Prepend button to retry upload image:
        buttons = [
            ...buttons,
            {
                text: 'Eliminar ' + reportType.value,
                role: 'destructive',
                handler: () => {
                    deleteInvoice(invoice)
                }
            }
        ]
    }

    if (report.value.status != 'Draft'){
        editInvoice(invoice.original, true)
        return;
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

const isUpdatingPending = computed(() => {
    return StoredInvoices.isUpdatingPending.value;
}) 
const acceptReport = async () => {
    isLoading.value = true;

    const response = await RequestAPI.patch(`/reports/${reportId.value}`, {
        status: EReportStatus.Approved
    })
    isLoading.value = false;
    toastController.create({
        message: '✅ Reporte aprobado con éxito!',
        duration: 2000
    }).then((toast) => {
        toast.present();
    })
    initialize();
    AppEvents.emit('all:reload');
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
                        message: '✅ Reporte rechazado con éxito',
                        duration: 2000
                    }).then((toast) => {
                        toast.present();
                    })
                    initialize();
                    AppEvents.emit('all:reload');
                }
            }
        ]
    })

    prompt.present();
}
const createExportPDF = async () => {
    const invoicesSorted = (() => {
            let invoices = invoicesData.value.map((invoice) => {
                return _.cloneDeep(invoice);
            });
            invoices = invoices.sort((a, b) => {
                return DateTime.fromISO(a.date).toJSDate() - DateTime.fromISO(b.date).toJSDate();
            });
            return invoices;
        })();


    const instance = new PDFCreator({
        report: reportData.value as IReport,
        invoices: invoicesSorted,
        textContents: {
            submittedBy: (await RequestAPI.get('/users')).find((account:any) => account.id == reportData.value?.user_id)?.name as unknown as string,
            fromDateToDate: (() => {
                if (invoicesData.value.length == 0){
                    return `del ${report.value.from_date}  hasta el ${report.value.to_date}`;
                }else{
                    return `del ${DateTime.fromISO(invoicesSorted[0].date).toLocaleString(DateTime.DATE_MED)}  hasta el ${DateTime.fromISO(invoicesSorted[invoicesSorted.length - 1].date).toLocaleString(DateTime.DATE_MED)}`;
                }
            })(),
            currency: (() => {
                return Toolbox.moneyNameEnglish(report.value.money_type) + ` (${report.value.money_type})`;
            })()
        },
        listenTo: {
            onProgress: (progress) => {
                nextTick(() => {
                    loadingProcess.value = {
                        ...progress,
                        iddle: progress.iddle || false
                    };
                })
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
        message: '✅ Reporte reaperturado con éxito',
        duration: 2000
    }).then((toast) => {
        toast.present();
    })
    initialize();
    AppEvents.emit('all:reload');
}
const sendReport = async () => {
    toastController.create({
        message: '📤 Enviando...',
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
    AppEvents.emit('all:reload');
}

const depositRestitution = async () => {
    Dialog.show(AddRepositionPettyCash, {
        onLoaded($this) {
            $this.on('created', (event:any) => {
                initialize();
                AppEvents.emit('all:reload');
            })
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        },
        props: {
            userId: reportData.value?.user_id,
            report: reportData.value,
            totalAmount: report.value.amount.value,
            moneyType: report.value.money_type
        }
    })
}

const downloadPdfAndExcelFiles = async (preffer = null) => {
    const invoicesTotalAmount = invoicesData.value.reduce((total, invoice) => {
        return total + invoice.amount;
    }, 0);

    const filename = `${reportData.value?.title} (${Toolbox.moneyPrefix(reportData.value?.money_type as unknown as EMoneyType).replace('/', '')} ${invoicesTotalAmount.toFixed(2)})`;
    const generatePDFDocument = async () => {
        return new Promise(async (resolve, reject) => {
            loadingProcess.value = {
                iddle: true,
                percentage: 0,
                stage: {
                    name: 'Generando PDF...',
                    percentage: 0
                }
            }

            const pdfDownloadUrl = `${RequestAPI.variables.rootUrl}/reports/${reportId.value}/pdf-download`;
            const pdfDocument = await Toolbox.fetchWithProgress(pdfDownloadUrl,  {
                method: 'GET',
                headers: {
                    'Authorization': await RequestAPI.authHeader()
                }
            }, (progress) => {
                loadingProcess.value = {
                    iddle: false,
                    percentage: progress,
                    stage: {
                        name: 'Descargando PDF...',
                        percentage: progress
                    }
                }
            }).then((blob) => {
                const reader = new FileReader()
                reader.onload = () => {
                    resolve({
                        blobUrl: URL.createObjectURL(blob),
                        base64: reader.result?.split('data:application/pdf;base64,')[1] as unknown as string
                    })
                }
                reader.onerror = () => {                
                    
                }
                reader.readAsDataURL(blob);
            })
        });






        return;
        toastController.create({
            message: '📄 Generando reporte en PDF...',
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
            const excelDocument = await fetch(excelDownloadUrl, {
                method: 'GET',
                headers: {
                    'Authorization': await RequestAPI.authHeader()
                }
            }).then((response) => {
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
                    
                }
                reader.readAsDataURL(blob);
            })
        });
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
            Toolbox.openNative(filename + extention, file.base64);
        }else{
            let link = document.createElement('a');
            link.href = file.blobUrl;
            link.download = filename + extention;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }


    if (preffer == 'PDF'){
        generatePDFDocument().then((pdfDocument) => {
            shareDocument(pdfDocument, '.pdf');
        })
        return;
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

const downloadBalanceReceiptImage = async () => {
    isLoading.value = true;

    const response = await RequestAPI.get('/balance/reports/' + report.value.id + '/balances');

    const restitutionBalance = response.find((balance:any) => balance.model == 'Restitution');

    if (!restitutionBalance){
        isLoading.value = false;
        alertController.create({
            header: 'No hay comprobante de depósito',
            message: '',
            buttons: [
                {
                    text: 'OK',
                    role: 'cancel'
                }
            ]
        }).then((alert) => {
            alert.present();
        })
        return;
    }

    await showBalanceReceiptImage(restitutionBalance);

    isLoading.value = false;
    async function showBalanceReceiptImage(balance: any){
        const response = await RequestAPI.get('/balances/' + balance.id + "/receipt-image");

        if (!response.image){
            alertController.create({
                header: 'Número de Transacción',
                message: restitutionBalance.ticket_number,
                buttons: [
                    {
                        text: 'OK',
                        role: 'cancel'
                    }
                ]
            }).then((alert) => {
                alert.present();
            })
            return;
        }


        const imageBase64 = "data:image/png;base64," + response.image;

        const filename = `Voucher ${balance.description}.png`;

        if (Capacitor.isNativePlatform()){
            Toolbox.openNative(filename, response.image);
        }else{
            //Create blob file from base64 image:
            const byteString = atob(imageBase64.split(',')[1]);
            const mimeString = imageBase64.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const dw = new DataView(ab);
            for (let i = 0; i < byteString.length; i++) {
                dw.setUint8(i, byteString.charCodeAt(i));
            }
            const blob = new Blob([ab], { type: mimeString });
            
            let link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
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


<styles lang="scss" scoped>
.content{
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
}


.advices{
    padding: 20px;
    padding-bottom: 0px;
    text-align: center;
}
</styles>

