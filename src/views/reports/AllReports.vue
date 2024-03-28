<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-title>Todos los Reportes</ion-title>
                <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <section v-if="pendingReports.length > 0">
                <ion-list-header>Esperando aprobación</ion-list-header>
                <ion-list style="margin-top:10px">
                    <ion-item v-for="report in pendingReports" :key="report.id" button @click="openReport(report.id)" :detail="true">
                        <ion-label>
                                <h2><b>{{ report.title }}</b></h2>
                                <h3>{{ report.user.name }}</h3>

                                <p>{{report.reportType}}</p>
                                <p>{{report.reportDates}}</p>
                                <p><b>{{report.moneyPrefix}} {{Toolbox.moneyFormat(report.invoices.totalAmount)}}</b></p>

                            </ion-label>
                            <ReportStatusChip :report="report"></ReportStatusChip>
                    </ion-item>
                </ion-list>
            </section>

            <section v-if="pendingRestitutionReports.length > 0">
                <ion-list-header>Esperando restitución</ion-list-header>
                <ion-list style="margin-top:10px">
                    <ion-item v-for="report in pendingRestitutionReports" :key="report.id" button @click="openReport(report.id)" :detail="true">
                        <ion-label>
                                <h2><b>{{ report.title }}</b></h2>
                                <h3>{{ report.user.name }}</h3>

                                <p>{{report.reportType}}</p>
                                <p>{{report.reportDates}}</p>
                                <p><b>{{report.moneyPrefix}} {{Toolbox.moneyFormat(report.invoices.totalAmount)}}</b></p>

                            </ion-label>
                            <ReportStatusChip :report="report"></ReportStatusChip>
                    </ion-item>
                </ion-list>
            </section>

            <ion-list-header>Todos usuarios</ion-list-header>

            <ion-accordion-group style="margin-top:10px">
                <ion-accordion v-for="userReports in usersReports" :key="userReports.user.id">
                    <ion-item slot="header" color="light">
                        <ion-label>
                            <h2>{{ userReports.user.name }}</h2>
                            <p>@{{ userReports.user.username }}</p>
                        </ion-label>
                    </ion-item>
                    <section slot="content">
                        <ion-list>
                            <ion-item v-for="report in userReports.reports" :key="report.id" button @click="openReport(report.id)" :detail="true">
                                <ion-label>
                                        <h2><b>{{ report.title }}</b></h2>
                                        <p>{{report.reportType}}</p>
                                        <p>{{report.reportDates}}</p>
                                        <p><b>{{report.moneyPrefix}} {{Toolbox.moneyFormat(report.invoices.totalAmount)}}</b></p>

                                    </ion-label>
                                    <ReportStatusChip :report="report"></ReportStatusChip>
                            </ion-item>
                        </ion-list>
                    </section>
                </ion-accordion>
            </ion-accordion-group>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent,IonAccordion, IonAccordionGroup, IonProgressBar, IonImg, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController } from '@ionic/vue';
import { RequestAPI } from '../../utils/Requests/RequestAPI';
import { computed, onUnmounted, ref } from 'vue';
import { addOutline, albumsOutline, alertCircleOutline, checkmarkCircleOutline, sendOutline, closeCircleOutline, pencilOutline } from 'ionicons/icons';
import { EReportStatus, IReport } from '../../interfaces/ReportInterfaces';
import { useRouter } from 'vue-router';
import { DateTime } from 'luxon';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import ReportStatusChip from '@/components/ReportStatusChip/ReportStatusChip.vue';
import { onMounted } from 'vue';

const reportsData = ref<Array<IReport>>([]);
const isLoading = ref<boolean>(true);
const router = useRouter();
const page = ref<HTMLElement|null>(null);

const parseReport = (report:IReport) => {
    return{
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
}

const usersReports = computed(() => {
    //Group reports by user_id, creating for each user_id a new array, return an array of users, please:
    const reportsGroupedByUser = reportsData.value.reduce((acc: any, report: IReport) => {
        if (!acc[report.user_id]){
            acc[report.user_id] = [];
        }
        acc[report.user_id].push(report);
        return acc;
    }, {});
    //Convert this key-value object to an array of objects, please:

    const reportsGroupedByUserArray = Object.keys(reportsGroupedByUser).map((key) => {
        return {
            user: reportsGroupedByUser[key][0].user,
            reports: reportsGroupedByUser[key].map((report:IReport) => {
                return parseReport(report)
            })
        }
    });

    return reportsGroupedByUserArray;
})
const pendingReports = computed(() => {
    return reportsData.value.filter((report) => report.status == EReportStatus.Submitted).map((report) => {
        return parseReport(report);
    });
});
const pendingRestitutionReports = computed(() => {
    return reportsData.value.filter((report) => report.status == EReportStatus.Approved).map((report) => {
        return parseReport(report);
    });
});
const loadAllReports = async () => {
    const reportsFetched = await RequestAPI.get('/reports');

    isLoading.value = false;
    reportsData.value = reportsFetched;
};

const openReport = (reportId: number) => {
    router.push(`/reports/${reportId}`);
}

loadAllReports();


onMounted(() => {
    const callbackId = AppEvents.on('all:reload', () => {
        loadAllReports();
    })

    onUnmounted(() => {
        AppEvents.off('all:reload', callbackId);
    })
})

</script>
