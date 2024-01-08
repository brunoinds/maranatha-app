<template>
    <article class="content">
        <header>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </header>
        <main>
            <article>
                <ion-accordion-group style="margin-top:10px">
                    <ion-accordion v-for="userAttendances in usersAttendances" :key="userAttendances.user.id">
                        <ion-item slot="header" color="light" :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                            <ion-label>
                                <h2>{{ userAttendances.user.name }}</h2>
                                <p>@{{ userAttendances.user.username }}</p>
                            </ion-label>
                        </ion-item>
                        <section slot="content">
                            <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                                <ion-item v-for="attendance in userAttendances.attendances" :key="attendance.id" button @click="openAttendance(attendance.id)" :detail="true">
                                    <ion-label>
                                        <h2><b>{{attendance.from_date }} - {{ attendance.to_date }}</b></h2>
                                        <p><b>Job:</b> {{ attendance.job_name }} ({{ attendance.job_code }})</p>
                                        <p><b>Expense: </b>{{ attendance.expense_name }} ({{ attendance.expense_code }})</p>
                                        <p><b>Reportado en:</b> {{ attendance.created_at }}</p>
                                    </ion-label>
                                </ion-item>
                            </ion-list>
                        </section>
                    </ion-accordion>
                </ion-accordion-group>
            </article>
        </main>
        
    </article>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonAccordion, IonAccordionGroup, IonProgressBar, IonImg, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController } from '@ionic/vue';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { computed, ref } from 'vue';
import { Dialog } from '@/utils/Dialog/Dialog';
import AttendanceIcon from '&/assets/icons/attendance.svg';

import { addOutline, albumsOutline, alertCircleOutline, checkmarkCircleOutline,sendOutline, closeCircleOutline  } from 'ionicons/icons';
import { IAttendance } from '@/interfaces/AttendanceInterfaces';
import { useRouter } from 'vue-router';
import NewReport from '@/dialogs/NewReport/NewReport.vue';
import { DateTime } from 'luxon';
import {AppEvents} from '@/utils/AppEvents/AppEvents';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import NewAttendance from '@/dialogs/NewAttendance/NewAttendance.vue';
import { IExpense, IJob } from '@/interfaces/JobsAndExpensesInterfaces';
import { userInfo } from 'os';
import { JobsAndExpenses } from '@/utils/Stored/JobsAndExpenses';
import { Viewport } from '@/utils/Viewport/Viewport';

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

const usersAttendances = computed(() => {
    //Group reports by user_id, creating for each user_id a new array, return an array of users, please:
    const attendancesGroupedByUser = attendances.value.reduce((acc: any, attendance: any) => {
        if (!acc[attendance.user_id]){
            acc[attendance.user_id] = [];
        }
        acc[attendance.user_id].push(attendance);
        return acc;
    }, {});
    //Convert this key-value object to an array of objects, please:

    const attendancesGroupedByUserArray = Object.keys(attendancesGroupedByUser).map((key) => {
        return {
            user: attendancesGroupedByUser[key][0].user,
            attendances: attendancesGroupedByUser[key]
        }
    });

    return attendancesGroupedByUserArray;
})


const loadUsersAttendances = async () => {
    const attendancesFetched = await RequestAPI.get('/attendances');
    const jobsAndExpensesData = await JobsAndExpenses.getJobsAndExpenses();
    jobsAndExpenses.value = jobsAndExpensesData;

    isLoading.value = false;
    attendancesData.value = attendancesFetched;
};

const openAttendance = (attendanceId: number) => {
    router.push(`/attendances/${attendanceId}`);
}

AppEvents.on('attendances:reload', () => {
    loadUsersAttendances();
})


loadUsersAttendances();
</script>

<style scoped lang="scss">

.content{
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
}

</style>