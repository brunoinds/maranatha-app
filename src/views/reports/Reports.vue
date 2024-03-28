<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-title>Mis Reportes</ion-title>
                <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
                <ion-refresher-content></ion-refresher-content>
            </ion-refresher>
            <ion-fab slot="fixed" vertical="bottom" horizontal="end" :edge="false">
                <ion-fab-button @click="createNewReport">
                    <ion-icon :icon="addOutline"></ion-icon>
                </ion-fab-button>
            </ion-fab>

            <section class="content">
                <article v-if="reports.rejected.length > 0">
                    <ion-list-header>Rechazados</ion-list-header>
                    <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                        <ion-item v-for="report in reports.rejected" :key="report.id" button @click="openReport(report.id)" :detail="true">
                            <ion-label>
                                    <h2><b>{{ report.title }}</b></h2>
                                    <p>{{report.reportType}}</p>
                                    <p>{{report.reportDates}}</p>
                                    <p><b>{{report.moneyPrefix}} {{Toolbox.moneyFormat(report.invoices.totalAmount)}}</b></p>
                                </ion-label>
                                <ReportStatusChip :report="report"></ReportStatusChip>
                        </ion-item>
                    </ion-list>
                </article>

                <article v-if="reports.drafts.length > 0">
                    <ion-list-header>No enviados</ion-list-header>
                    <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                        <ion-item v-for="report in reports.drafts" :key="report.id" button @click="openReport(report.id)" :detail="true">
                            <ion-label>
                                    <h2><b>{{ report.title }}</b></h2>
                                    <p>{{report.reportType}}</p>
                                    <p>{{report.reportDates}}</p>
                                    <p><b>{{report.moneyPrefix}} {{Toolbox.moneyFormat(report.invoices.totalAmount)}}</b></p>
                                </ion-label>
                                <ReportStatusChip :report="report"></ReportStatusChip>
                        </ion-item>
                    </ion-list>
                </article>

                <article v-if="reports.submitted.length > 0">
                    <ion-list-header>Pendiente Aprobación</ion-list-header>
                    <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                        <ion-item v-for="report in reports.submitted" :key="report.id" button @click="openReport(report.id)" :detail="true">
                            <ion-label>
                                    <h2><b>{{ report.title }}</b></h2>
                                    <p>{{report.reportType}}</p>
                                    <p>{{report.reportDates}}</p>
                                    <p><b>{{report.moneyPrefix}} {{Toolbox.moneyFormat(report.invoices.totalAmount)}}</b></p>
                                </ion-label>
                                <ReportStatusChip :report="report"></ReportStatusChip>
                        </ion-item>
                    </ion-list>
                </article>


                <article v-if="reports.approved.length > 0">
                    <ion-list-header>Pendiente Reembolso</ion-list-header>
                    <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                        <ion-item v-for="report in reports.approved" :key="report.id" button @click="openReport(report.id)" :detail="true">
                            <ion-label>
                                    <h2><b>{{ report.title }}</b></h2>
                                    <p>{{report.reportType}}</p>
                                    <p>{{report.reportDates}}</p>
                                    <p><b>{{report.moneyPrefix}} {{Toolbox.moneyFormat(report.invoices.totalAmount)}}</b></p>
                                </ion-label>
                                <ReportStatusChip :report="report"></ReportStatusChip>
                        </ion-item>
                    </ion-list>
                </article>

                <article v-if="reports.restituted.length > 0">
                    <ion-list-header>Pagados</ion-list-header>
                    <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                        <ion-item v-for="report in reports.restituted" :key="report.id" button @click="openReport(report.id)" :detail="true">
                            <ion-label>
                                    <h2><b>{{ report.title }}</b></h2>
                                    <p>{{report.reportType}}</p>
                                    <p>{{report.reportDates}}</p>
                                    <p><b>{{report.moneyPrefix}} {{Toolbox.moneyFormat(report.invoices.totalAmount)}}</b></p>
                                </ion-label>
                                <ReportStatusChip :report="report"></ReportStatusChip>
                        </ion-item>
                    </ion-list>
                </article>

                <article v-if="!isLoading && reportsData.length == 0" class="ion-padding" style="display: flex;flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                    <ion-img :src="ReportIcon" style="width: 90%;margin: 0 auto;"></ion-img>
                    <h2>Aún no tienes reportes</h2>
                    <p class="ion-text-center">Crea tu primer reporte haciendo click en el botón "+" abajo</p>
                </article>
            </section>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonProgressBar, IonImg, IonRefresher, IonRefresherContent, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController } from '@ionic/vue';
import { RequestAPI } from '../../utils/Requests/RequestAPI';
import { computed, onUnmounted, ref } from 'vue';
import { Dialog } from '../../utils/Dialog/Dialog';
import ReportIcon from '&/assets/icons/report.svg';

import { addOutline, albumsOutline, alertCircleOutline, checkmarkCircleOutline,sendOutline, closeCircleOutline  } from 'ionicons/icons';
import { EReportStatus, IReport } from '../../interfaces/ReportInterfaces';
import { useRouter } from 'vue-router';
import NewReport from '../../dialogs/NewReport/NewReport.vue';
import { DateTime } from 'luxon';
import {AppEvents} from '../../utils/AppEvents/AppEvents';
import { StoredReports } from '@/utils/Stored/StoredReports';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import NewAttendance from '../../dialogs/NewAttendance/NewAttendance.vue';
import ReportStatusChip from '@/components/ReportStatusChip/ReportStatusChip.vue';
import { Viewport } from '@/utils/Viewport/Viewport';
import { onMounted } from 'vue';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { PDFModifier } from '@/utils/PDFModifier/PDFModifier';

const reportsData = ref<Array<IReport>>([]);
const isLoading = ref<boolean>(true);
const router = useRouter();
const page = ref<HTMLElement|null>(null);



const reports = computed(() => {
    const reportsItems = reportsData.value.map((report) => {
        return {
            ...report,
            reportType: report.type == 'Bill' ? 'Boletas' : 'Facturas',
            reportDates: `${DateTime.fromISO(report.from_date).toLocaleString(DateTime.DATE_MED)} - ${DateTime.fromISO(report.to_date).toLocaleString(DateTime.DATE_MED)}`,
            invoices: {
                total: (report as any).invoices.count,
                totalAmount: (report as any).invoices.total_amount
            },
            moneyPrefix: (() => {
                return Toolbox.moneyPrefix(report.money_type)
            })()
        }
    })


    return {
        drafts: reportsItems.filter((report) => report.status == EReportStatus.Draft),
        submitted: reportsItems.filter((report) => report.status == EReportStatus.Submitted),
        approved: reportsItems.filter((report) => report.status == EReportStatus.Approved),
        rejected: reportsItems.filter((report) => report.status == EReportStatus.Rejected),
        restituted: reportsItems.filter((report) => report.status == EReportStatus.Restituted),
    }
})
const loadUserReports = async () => {
    const reportsFetched = await StoredReports.getReports();
    isLoading.value = false;
    reportsData.value = reportsFetched;
};

const handleRefresh = (event: CustomEvent) => {
    loadUserReports().then(() => {
        event.detail.complete();
    }).catch(() => {
        event.detail.complete();
    });
};

const openReport = (reportId: number) => {
    router.push(`/reports/${reportId}`);
}

const createNewReport = async () => {
    Dialog.show(NewReport, {
        onLoaded($this) {
            $this.on('created', (event:any) => {
                const newReportId = event.data.id;
                openReport(newReportId);
                loadUserReports();
            })
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        }
    })
}

loadUserReports();

onMounted(() => {
    const callbackId = AppEvents.on('all:reload', () => {
        loadUserReports();
    })
    onUnmounted(() => {
        AppEvents.off('all:reload', callbackId);
    })
})

</script>


<style scoped lang="scss">
.content{
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
}
</style>@/utils/PDFtoImage/PDFModifier