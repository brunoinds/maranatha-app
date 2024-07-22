<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-title>Mis Asistencias</ion-title>
                <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-fab slot="fixed" vertical="bottom" horizontal="end" :edge="false">
                <ion-fab-button @click="createNewAttendance">
                    <ion-icon :icon="addOutline"></ion-icon>
                </ion-fab-button>
            </ion-fab>

            <section class="content">
                <article v-for="attendanceGrouped  in attendancesGroupedUI">
                    <ion-list-header>{{ attendanceGrouped.monthYearText }}</ion-list-header>
                    <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                        <ion-item v-for="attendance in attendanceGrouped.attendances" :key="attendance.id" button @click="openAttendance(attendance.id)" :detail="true">
                            <ion-label>
                                <h2><b>{{attendance.from_date }} - {{ attendance.to_date }}</b></h2>
                                <p><b>Job:</b> {{ attendance.job_name }} ({{ attendance.job_code }})</p>
                                <p><b>Expense: </b>{{ attendance.expense_name }} ({{ attendance.expense_code }})</p>
                                <p><b>Reportado en:</b> {{ attendance.created_at }}</p>
                            </ion-label>
                        </ion-item>
                    </ion-list>
                </article>


                <article>
                    <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                        <ion-item v-for="attendance in attendances" :key="attendance.id" button @click="openAttendance(attendance.id)" :detail="true">
                            <ion-label>
                                <h2><b>{{attendance.from_date }} - {{ attendance.to_date }}</b></h2>
                                <p><b>Job:</b> {{ attendance.job_name }} ({{ attendance.job_code }})</p>
                                <p><b>Expense: </b>{{ attendance.expense_name }} ({{ attendance.expense_code }})</p>
                                <p><b>Reportado en:</b> {{ attendance.created_at }}</p>
                            </ion-label>
                        </ion-item>
                    </ion-list>
                </article>

                <OnBoardingPanel v-if="!isLoading && attendances.length == 0"
                    title="Aún no tienes asistencias"
                    description="Crea tu primer listado de asistencia haciendo click en el botón '+' abajo"
                    :icon="AttendanceIcon"
                ></OnBoardingPanel>
            </section>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import AttendanceIcon from '&/assets/icons/attendance.svg';
import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonImg, IonItem, IonListHeader, IonLabel, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar } from '@ionic/vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Dialog } from '../../utils/Dialog/Dialog';
import { RequestAPI } from '../../utils/Requests/RequestAPI';

import { IExpense, IJob } from '@/interfaces/JobsAndExpensesInterfaces';
import { JobsAndExpenses } from '@/utils/Stored/JobsAndExpenses';
import { Viewport } from '@/utils/Viewport/Viewport';
import { addOutline } from 'ionicons/icons';
import { DateTime } from 'luxon';
import { useRouter } from 'vue-router';
import NewAttendance from '../../dialogs/NewAttendance/NewAttendance.vue';
import { IAttendance } from '../../interfaces/AttendanceInterfaces';
import { AppEvents } from '../../utils/AppEvents/AppEvents';
import OnBoardingPanel from '@/components/OnBoardingPanel/OnBoardingPanel.vue';

const attendancesData = ref<Array<IAttendance>>([]);
const isLoading = ref<boolean>(true);
const router = useRouter();
const page = ref<HTMLElement|null>(null);
const jobsAndExpenses = ref<{
    jobs: IJob[],
    expenses: IExpense[]
}>({
    jobs: [],
    expenses: []
});
const attendances = computed(() => {
    const attendanceItems = attendancesData.value.map((attendance) => {
        const attendanceItem = {
            ...attendance,
            from_date: DateTime.fromISO(attendance.from_date).toFormat('dd/MM/yyyy'),
            to_date: DateTime.fromISO(attendance.to_date).toFormat('dd/MM/yyyy'),
            created_at: DateTime.fromISO(attendance.created_at).toFormat('dd/MM/yyyy'),
            job_name: jobsAndExpenses.value.jobs.find((job) => job.code == attendance.job_code)?.name,
            expense_name: jobsAndExpenses.value.expenses.find((expense) => expense.code == attendance.expense_code)?.name
        };
        
        return attendanceItem;
    })

    return attendanceItems
})

const attendancesGroupedUI = computed(() => {
    //Group attendances by from_date month/year:
    const groupedAttendances = attendances.value.sort((a, b) => {
        return DateTime.fromFormat(b.from_date, 'dd/MM/yyyy').toMillis() - DateTime.fromFormat(a.from_date, 'dd/MM/yyyy').toMillis();
    }).reduce((acc, attendance) => {
        const monthYear = DateTime.fromFormat(attendance.from_date, 'dd/MM/yyyy').toFormat('MM/yyyy');
        if (!acc[monthYear]){
            acc[monthYear] = [];
        }
        acc[monthYear].push(attendance);
        return acc;
    }, {} as {[key: string]: IAttendance[]});

    const groupedAttendancesUI = Object.keys(groupedAttendances).map((key) => {
        return {
            monthYear: key,
            monthYearText: DateTime.fromFormat(key, 'MM/yyyy').toFormat('MMMM yyyy'),
            attendances: groupedAttendances[key]
        }
    })

    return groupedAttendancesUI;
})

const loadUserAttendances = async () => {
    const attendancesFetched = await RequestAPI.get('/me/attendances');
    const jobsAndExpensesData = await JobsAndExpenses.getJobsAndExpenses();
    jobsAndExpenses.value = jobsAndExpensesData;

    isLoading.value = false;
    attendancesData.value = attendancesFetched;
};
const openAttendance = (attendanceId: number) => {
    router.push(`/attendances/${attendanceId}`);
}
const createNewAttendance = async () => {
    Dialog.show(NewAttendance, {
        onLoaded($this) {
            $this.on('created', (event:any) => {
                const newAttendanceId = event.data.id;
                openAttendance(newAttendanceId);
                loadUserAttendances();
            })
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        }
    })
}

loadUserAttendances();

onMounted(() => {
    const callbackId = AppEvents.on('all:reload', () => {
        loadUserAttendances();
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
