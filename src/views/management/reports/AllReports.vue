<template>
    <article class="content">
        <ion-searchbar v-model="dynamicData.search" :animated="true" placeholder="Buscar Reporte"></ion-searchbar>


        <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>

        <article class="search" v-show="dynamicData.search.trim().length > 0">
            <ion-list-header>Resultados de la búsqueda</ion-list-header>
            <ion-list style="margin-top:10px"  :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                <ion-item v-for="report in searchResults" :key="report.id" button @click="openReport(report.id)" :detail="true">
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

            <ion-label class="ion-text-center" v-if="dynamicData.search.trim().length > 0 && searchResults.length == 0">
                <p>No se encontró resultados para tu búsqueda</p>
                <br>
            </ion-label>
        </article>

        <article class="normal" v-show="dynamicData.search.trim().length == 0">
            <section v-if="pendingReports.length > 0">
                <ion-list-header>Esperando aprobación</ion-list-header>
                <ion-list style="margin-top:10px"  :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
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
                <ion-list style="margin-top:10px" :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
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

            <section v-if="!isLoading && !dynamicData.showAllUsersReports" class="ion-padding">
                <ion-button expand="block" @click="dynamicData.showAllUsersReports = true">
                    <ion-icon slot="start" :icon="albumsOutline"></ion-icon>
                    Ver todos los usuarios
                </ion-button>
            </section>

            <section v-if="dynamicData.showAllUsersReports">
                <ion-list-header>Todos usuarios</ion-list-header>

                <ion-accordion-item v-for="userReports in usersReports" :key="userReports.user.id" :value="userReports.user.id">
                    <template v-slot:head>
                        <ion-item slot="header" color="light" :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                            <ion-label>
                                <h2>{{ userReports.user.name }}</h2>
                                <p>@{{ userReports.user.username }}</p>
                            </ion-label>
                        </ion-item>
                    </template>
                    <template #body>
                        <ion-accordion-item v-for="monthYearReports  in userReports.reports" :key="monthYearReports.monthYearText" :value="monthYearReports.monthYearText">
                            <template v-slot:head>
                                <ion-item slot="header" color="light" :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                                    <ion-label>
                                        <p>&nbsp;&nbsp;{{ monthYearReports.monthYearText }}</p>
                                    </ion-label>
                                    <div slot="end" style="display: flex; align-items: center;">
                                        <ReportStatusChip v-for="badge in monthYearReports.badges" :report="{status: badge}" :minimalText="true"></ReportStatusChip>
                                    </div>
                                </ion-item>
                            </template>
                            <template #body>
                                <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                                    <ion-item v-for="report in monthYearReports.reports" :key="report.id" button @click="openReport(report.id)" :detail="true">
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
                </ion-accordion-item>




                <!-- <ion-accordion-group style="margin-top:10px"  :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                    <ion-accordion v-for="userReports in usersReports" :key="userReports.user.id">
                        <ion-item slot="header" color="light">
                            <ion-label>
                                <h2>{{ userReports.user.name }}</h2>
                                <p>@{{ userReports.user.username }}</p>
                            </ion-label>
                        </ion-item>
                        <section slot="content">
                            <ion-accordion-group :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                                <ion-accordion v-for="monthYearReports  in userReports.reports">
                                    <ion-item slot="header" color="light">
                                        <ion-label>
                                            <p>&nbsp;&nbsp;{{ monthYearReports.monthYearText }}</p>
                                        </ion-label>
                                        <div slot="end" style="display: flex; align-items: center;">
                                            <ReportStatusChip v-for="badge in monthYearReports.badges" :report="{status: badge}" :minimalText="true"></ReportStatusChip>
                                        </div>
                                    </ion-item>
                                    <section slot="content">
                                        <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                                            <ion-item v-for="report in monthYearReports.reports" :key="report.id" button @click="openReport(report.id)" :detail="true">
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
                        </section>
                    </ion-accordion>
                </ion-accordion-group> -->
            </section>
        </article>
    </article>
</template>

<script setup lang="ts">
import IonAccordionItem from '@/components/IonAccordionItem/IonAccordionItem.vue';
import ReportStatusChip from '@/components/ReportStatusChip/ReportStatusChip.vue';
import { EReportStatus, IReport } from '@/interfaces/ReportInterfaces';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import { Viewport } from '@/utils/Viewport/Viewport';
import { IonButton, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonProgressBar, IonSearchbar } from '@ionic/vue';
import { albumsOutline } from 'ionicons/icons';
import { DateTime } from 'luxon';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const reportsData = ref<Array<IReport>>([]);
const isLoading = ref<boolean>(true);
const router = useRouter();
const page = ref<HTMLElement|null>(null);

const dynamicData = ref({
    search: '',
    showAllUsersReports: false
})

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
        const usersReportsMonths = reportsGroupedByUser[key].reduce((acc: any, report: IReport) => {
            const monthYear = DateTime.fromISO(report.from_date).toFormat('yyyy MM');
            if (!acc[monthYear]){
                acc[monthYear] = [];
            }
            acc[monthYear].push(report);
            return acc;
        }, {});

        const usersReportsMonthsArrayOfObjects = Object.keys(usersReportsMonths).map((key) => {
            return {
                monthYear: key,
                monthYearText: DateTime.fromFormat(key, 'yyyy MM').toFormat('MMMM yyyy'),
                badges: (() => {
                    const badges:Array<EReportStatus> = []; 
                    usersReportsMonths[key].forEach((report: IReport) => {
                        if (badges.includes(report.status)){
                            return;
                        }else{
                            badges.push(report.status);
                        }
                    })
                    return badges;
                })(),
                reports: usersReportsMonths[key].toSorted((a: IReport, b: IReport) => {
                    return DateTime.fromISO(b.created_at).toMillis() - DateTime.fromISO(a.created_at).toMillis();
                })
            }
        }).toSorted((a: any, b: any) => {
            return DateTime.fromFormat(b.monthYear, 'yyyy MM').toMillis() - DateTime.fromFormat(a.monthYear, 'yyyy MM').toMillis();
        });



        return {
            user: reportsGroupedByUser[key][0].user,
            reports: usersReportsMonthsArrayOfObjects.map((monthYear) => {
                return {
                    ...monthYear,
                    reports: monthYear.reports.map((report) => {
                        return parseReport(report);
                    })
                }
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


    AppEvents.emit('all:reloaded-all-reports-fired')
};

const openReport = (reportId: number) => {
    router.push(`/reports/${reportId}`);
}

const stringsMatches = (stringOne: string, stringTwo: string) => {
    //Should check if %stringOne% matches %stringTwo%, it means that %stringOne% is included in %stringTwo% or %stringTwo% is included in %stringOne%, independently if the word are in the middle of the string, but respecting the order of the words, please:
    return stringOne.toLowerCase().includes(stringTwo.toLowerCase()) || stringTwo.toLowerCase().includes(stringOne.toLowerCase());
}


const searchResults = computed(() => {
    if (dynamicData.value.search.trim().length < 3){
        return [];
    }


    const reportsFound = reportsData.value.filter((report) => {
        const matches = {
            titleMatches: () => stringsMatches(report.title, dynamicData.value.search),
            userMatches: () => stringsMatches(report.user.name, dynamicData.value.search),
            moneyTypeMatches: () => stringsMatches(report.money_type, dynamicData.value.search),
            countryMatches: () => stringsMatches(report.country, dynamicData.value.search),
            totalAmountMatches: () => stringsMatches(report.invoices.total_amount.toString(), dynamicData.value.search),
        };
        let hasMatch = false;
        Object.keys(matches).forEach((key) => {
            if (hasMatch){
                return;
            }

            if (matches[key]()){
                hasMatch = true;
                return;
            }
        });

        return hasMatch;
    }).map((report) => {
        return parseReport(report);
    });


    return reportsFound;
})

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


<style scoped lang="scss">
.content{
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
}
</style>