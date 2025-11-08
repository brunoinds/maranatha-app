<template>
    <article class="content">
        <header>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </header>
        <main>
            <article>

                <ion-accordion-group style="margin-top:10px">
                    <ion-accordion v-for="userAttendances in attendancesUI" :key="userAttendances.user.id">
                        <ion-item slot="header" color="light" :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                            <ion-icon :icon="personOutline" slot="start"></ion-icon>
                            <ion-label>
                                <h2><b>{{ userAttendances.user.name }}</b></h2>
                                <p>@{{ userAttendances.user.username }}</p>
                            </ion-label>
                        </ion-item>
                        <section slot="content" class="ion-padding">
                            <ion-accordion-item v-for="attendanceMonth in userAttendances.attendances" :key="attendanceMonth.monthYear" :value="attendanceMonth.monthYear">
                                <template v-slot:head>
                                    <ion-item slot="header" color="light" :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                                        <ion-icon :icon="calendarOutline" slot="start"></ion-icon>
                                        <ion-label>
                                            <h2><b>{{ attendanceMonth.monthYearText}}</b></h2>
                                            <p>{{ attendanceMonth.attendances.length }} registros</p>
                                        </ion-label>
                                    </ion-item>
                                </template>
                                <template #body>
                                    <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                                        <ion-item v-for="attendance in attendanceMonth.attendances" :key="attendance.id" button @click="openAttendance(attendance.id)" :detail="true">
                                            <ion-label>
                                                <h2><b>{{ DateTime.fromISO(attendance.from_date).toFormat('dd/MM/yyyy') }} - {{ DateTime.fromISO(attendance.to_date).toFormat('dd/MM/yyyy') }}</b></h2>
                                                <p><b>Job:</b> {{ attendance.job_name }} ({{ attendance.job_code }})</p>
                                                <p><b>Expense: </b>{{ attendance.expense_name }} ({{ attendance.expense_code }})</p>
                                                <p><b>Reportado en:</b> {{ DateTime.fromISO(attendance.created_at).toFormat('dd/MM/yyyy') }}</p>
                                            </ion-label>
                                        </ion-item>
                                    </ion-list>
                                </template>
                            </ion-accordion-item>
                        </section>
                    </ion-accordion>
                </ion-accordion-group>
            </article>
        </main>
    </article>
</template>

<script setup lang="ts">
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { IonAccordion, IonAccordionGroup, IonIcon, IonItem, IonLabel, IonList, IonProgressBar } from '@ionic/vue';
import { computed, ref } from 'vue';

import IonAccordionItem from '@/components/IonAccordionItem/IonAccordionItem.vue';
import { IAttendance } from '@/interfaces/AttendanceInterfaces';
import { IExpense, IJob } from '@/interfaces/JobsAndExpensesInterfaces';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { JobsAndExpenses } from '@/utils/Stored/JobsAndExpenses';
import { Viewport } from '@/utils/Viewport/Viewport';
import { calendarOutline, personOutline } from 'ionicons/icons';
import _ from 'lodash';
import { DateTime } from 'luxon';
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

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

const attendancesUI = computed(() => {
    const usersAttendances = _.groupBy(attendancesData.value, 'user_id');

    const userAttendancesUI = Object.keys(usersAttendances).map((userId) => {
        const userAttendances = usersAttendances[userId];


        const userMonthsAttendances = _.groupBy(userAttendances.map((attendance) => {
            return {
                ...attendance,
                monthYear: DateTime.fromISO(attendance.from_date).toFormat('yyyy MM')
            }
        }), 'monthYear');
        const userMonthsAttendancesUI = Object.keys(userMonthsAttendances).map((date) => {
            const userMonthAttendances = userMonthsAttendances[date];
            const monthYear = date;
            return {
                monthYear: monthYear,
                monthYearText: DateTime.fromFormat(monthYear, 'yyyy MM').toFormat('MMMM yyyy'),
                attendances: userMonthAttendances.map((attendance) => {
                    const attendanceItem = {
                        ...attendance,
                        job_name: jobsAndExpenses.value.jobs.find((job) => job.code == attendance.job_code)?.name,
                        expense_name: jobsAndExpenses.value.expenses.find((expense) => expense.code == attendance.expense_code)?.name,
                        original: attendance
                    };
                    
                    return attendanceItem;
                }).toSorted((a: IAttendance, b: IAttendance) => {
                    return DateTime.fromISO(b.created_at).toMillis() - DateTime.fromISO(a.created_at).toMillis();
                })
            }
        }).toSorted((a: any, b: any) => {
            return DateTime.fromFormat(b.monthYear, 'yyyy MM').toMillis() - DateTime.fromFormat(a.monthYear, 'yyyy MM').toMillis();
        });


        return {
            user: userAttendances[0].user,
            attendances: userMonthsAttendancesUI
        }
    })

    return userAttendancesUI.toSorted((a: any, b: any) => {
        return b.user.name > a.user.name ? -1 : 1;
    })
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


loadUsersAttendances();

onMounted(() => {
    const callbackId = AppEvents.on('all:reload', () => {
        loadUsersAttendances();
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