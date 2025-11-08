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
                    <br>
                    <template v-if="groupedReports.rejected.length > 1">
                        <ion-accordion-item v-for="reportGroup in groupedReports.rejected" :key="reportGroup.monthYear" :value="reportGroup.monthYear">
                            <template v-slot:head>
                                <ion-item slot="header" color="light" :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                                    <ion-icon :icon="calendarOutline" slot="start"></ion-icon>
                                    <ion-label>
                                        <h2><b>{{ reportGroup.monthYearText }}</b></h2>
                                        <p>{{ reportGroup.reports.length }} reportes</p>
                                    </ion-label>
                                </ion-item>
                            </template>
                            <template #body>
                                <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                                    <ion-item v-for="report in reportGroup.reports" :key="report.id" button @click="openReport(report.id)" :detail="true">
                                        <ion-label>
                                            <h2><b>{{ report.title }}</b></h2>
                                            <p>{{report.reportType}}</p>
                                            <p>{{report.reportDates}}</p>
                                            <p><b>{{report.moneyPrefix}} {{Toolbox.moneyFormat(report.invoices.totalAmount)}}</b></p>
                                        </ion-label>
                                        <ReportStatusChip :report="report"></ReportStatusChip>
                                    </ion-item>
                                </ion-list>
                            </template>
                        </ion-accordion-item>
                    </template>
                    <ion-list v-else :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
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
                    <br>
                    <template v-if="groupedReports.drafts.length > 1">
                        <ion-accordion-item v-for="reportGroup in groupedReports.drafts" :key="reportGroup.monthYear" :value="reportGroup.monthYear">
                            <template v-slot:head>
                                <ion-item slot="header" color="light" :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                                    <ion-icon :icon="calendarOutline" slot="start"></ion-icon>
                                    <ion-label>
                                        <h2><b>{{ reportGroup.monthYearText }}</b></h2>
                                        <p>{{ reportGroup.reports.length }} reportes</p>
                                    </ion-label>
                                </ion-item>
                            </template>
                            <template #body>
                                <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                                    <ion-item v-for="report in reportGroup.reports" :key="report.id" button @click="openReport(report.id)" :detail="true">
                                        <ion-label>
                                            <h2><b>{{ report.title }}</b></h2>
                                            <p>{{report.reportType}}</p>
                                            <p>{{report.reportDates}}</p>
                                            <p><b>{{report.moneyPrefix}} {{Toolbox.moneyFormat(report.invoices.totalAmount)}}</b></p>
                                        </ion-label>
                                        <ReportStatusChip :report="report"></ReportStatusChip>
                                    </ion-item>
                                </ion-list>
                            </template>
                        </ion-accordion-item>
                    </template>
                    <ion-list v-else :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
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
                    <br>
                    <template v-if="groupedReports.submitted.length > 1">
                        <ion-accordion-item v-for="reportGroup in groupedReports.submitted" :key="reportGroup.monthYear" :value="reportGroup.monthYear">
                            <template v-slot:head>
                                <ion-item slot="header" color="light" :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                                    <ion-icon :icon="calendarOutline" slot="start"></ion-icon>
                                    <ion-label>
                                        <h2><b>{{ reportGroup.monthYearText }}</b></h2>
                                        <p>{{ reportGroup.reports.length }} reportes</p>
                                    </ion-label>
                                </ion-item>
                            </template>
                            <template #body>
                                <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                                    <ion-item v-for="report in reportGroup.reports" :key="report.id" button @click="openReport(report.id)" :detail="true">
                                        <ion-label>
                                            <h2><b>{{ report.title }}</b></h2>
                                            <p>{{report.reportType}}</p>
                                            <p>{{report.reportDates}}</p>
                                            <p><b>{{report.moneyPrefix}} {{Toolbox.moneyFormat(report.invoices.totalAmount)}}</b></p>
                                        </ion-label>
                                        <ReportStatusChip :report="report"></ReportStatusChip>
                                    </ion-item>
                                </ion-list>
                            </template>
                        </ion-accordion-item>
                    </template>
                    <ion-list v-else :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
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
                    <br>
                    <template v-if="groupedReports.approved.length > 1">
                        <ion-accordion-item v-for="reportGroup in groupedReports.approved" :key="reportGroup.monthYear" :value="reportGroup.monthYear">
                            <template v-slot:head>
                                <ion-item slot="header" color="light" :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                                    <ion-icon :icon="calendarOutline" slot="start"></ion-icon>
                                    <ion-label>
                                        <h2><b>{{ reportGroup.monthYearText }}</b></h2>
                                        <p>{{ reportGroup.reports.length }} reportes</p>
                                    </ion-label>
                                </ion-item>
                            </template>
                            <template #body>
                                <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                                    <ion-item v-for="report in reportGroup.reports" :key="report.id" button @click="openReport(report.id)" :detail="true">
                                        <ion-label>
                                            <h2><b>{{ report.title }}</b></h2>
                                            <p>{{report.reportType}}</p>
                                            <p>{{report.reportDates}}</p>
                                            <p><b>{{report.moneyPrefix}} {{Toolbox.moneyFormat(report.invoices.totalAmount)}}</b></p>
                                        </ion-label>
                                        <ReportStatusChip :report="report"></ReportStatusChip>
                                    </ion-item>
                                </ion-list>
                            </template>
                        </ion-accordion-item>
                    </template>
                    <ion-list v-else :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
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
                    <br>
                    <template v-if="groupedReports.restituted.length > 1">
                        <ion-accordion-item v-for="reportGroup in groupedReports.restituted" :key="reportGroup.monthYear" :value="reportGroup.monthYear">
                            <template v-slot:head>
                                <ion-item slot="header" color="light" :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                                    <ion-icon :icon="calendarOutline" slot="start"></ion-icon>
                                    <ion-label>
                                        <h2><b>{{ reportGroup.monthYearText }}</b></h2>
                                        <p>{{ reportGroup.reports.length }} reportes</p>
                                    </ion-label>
                                </ion-item>
                            </template>
                            <template #body>
                                <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                                    <ion-item v-for="report in reportGroup.reports" :key="report.id" button @click="openReport(report.id)" :detail="true">
                                        <ion-label>
                                            <h2><b>{{ report.title }}</b></h2>
                                            <p>{{report.reportType}}</p>
                                            <p>{{report.reportDates}}</p>
                                            <p><b>{{report.moneyPrefix}} {{Toolbox.moneyFormat(report.invoices.totalAmount)}}</b></p>
                                        </ion-label>
                                        <ReportStatusChip :report="report"></ReportStatusChip>
                                    </ion-item>
                                </ion-list>
                            </template>
                        </ion-accordion-item>
                    </template>
                    <ion-list v-else :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
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

                <OnBoardingPanel v-if="!isLoading && reportsData.length == 0"
                    title="Aún no tienes reportes"
                    description="Crea tu primer reporte haciendo click en el botón '+' abajo"
                    :icon="ReportIcon"
                ></OnBoardingPanel>
            </section>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import ReportIcon from '&/assets/icons/report.svg';
import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonProgressBar, IonRefresher, IonRefresherContent, IonTitle, IonToolbar } from '@ionic/vue';
import { computed, onUnmounted, ref } from 'vue';
import { Dialog } from '../../utils/Dialog/Dialog';

import IonAccordionItem from '@/components/IonAccordionItem/IonAccordionItem.vue';
import OnBoardingPanel from '@/components/OnBoardingPanel/OnBoardingPanel.vue';
import ReportStatusChip from '@/components/ReportStatusChip/ReportStatusChip.vue';
import { StoredReports } from '@/utils/Stored/StoredReports';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import { Viewport } from '@/utils/Viewport/Viewport';
import { addOutline, calendarOutline } from 'ionicons/icons';
import { DateTime } from 'luxon';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import NewReport from '../../dialogs/NewReport/NewReport.vue';
import { EReportStatus, IReport } from '../../interfaces/ReportInterfaces';
import { AppEvents } from '../../utils/AppEvents/AppEvents';

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

// Helper function to group reports by month/year
const groupReportsByMonth = (reports: any[]) => {
    if (reports.length === 0) return [];
    
    // Sort reports by from_date (newest first)
    const sortedReports = reports.sort((a, b) => {
        return DateTime.fromISO(b.from_date).toMillis() - DateTime.fromISO(a.from_date).toMillis();
    });

    // Group by month/year
    const grouped = sortedReports.reduce((acc, report) => {
        const monthYear = DateTime.fromISO(report.from_date).toFormat('MM/yyyy');
        if (!acc[monthYear]) {
            acc[monthYear] = [];
        }
        acc[monthYear].push(report);
        return acc;
    }, {} as {[key: string]: any[]});

    // Convert to UI format
    return Object.keys(grouped).map((key) => ({
        monthYear: key,
        monthYearText: DateTime.fromFormat(key, 'MM/yyyy').toFormat('MMMM yyyy'),
        reports: grouped[key]
    }));
}

// Computed properties for grouped reports
const groupedReports = computed(() => {
    return {
        drafts: groupReportsByMonth(reports.value.drafts),
        submitted: groupReportsByMonth(reports.value.submitted),
        approved: groupReportsByMonth(reports.value.approved),
        rejected: groupReportsByMonth(reports.value.rejected),
        restituted: groupReportsByMonth(reports.value.restituted),
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
</style>