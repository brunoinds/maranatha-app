<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-title>Asistencia</ion-title>
                <ion-buttons slot="start">
                    <IonBackButton :disable="isLoading" defaultHref="/my-attendances"></IonBackButton>
                </ion-buttons>
                <ion-buttons slot="end">
                    <ion-button @click="editAttendance" :disabled="isLoading">
                        <ion-icon :icon="ellipsisHorizontal"></ion-icon>
                    </ion-button>
                </ion-buttons>
                <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <section class="content">
                <article class="skeleton ion-padding"  v-if="!attendance">
                        <ion-skeleton-text animated style="height: 30px"></ion-skeleton-text>
                        <ion-skeleton-text animated style="height: 15px; width: 80%;"></ion-skeleton-text>
                        <ion-skeleton-text animated style="height: 15px; width: 60%;"></ion-skeleton-text>
                        <ion-skeleton-text animated style="height: 15px; width: 40%;"></ion-skeleton-text>
                        <br>
                        <ion-skeleton-text animated style="height: 15px; width: 40%;"></ion-skeleton-text>
                        <br><br>
                        <ion-skeleton-text v-for="i in 6" :key="i" animated style="height: 40px"></ion-skeleton-text>
                    </article>
                    <article v-if="attendance">
                        <ion-list>
                            <ion-item>
                                <ion-label>
                                    <h1><b>{{DateTime.fromISO(attendance.from_date).toFormat('dd/MM/yyyy')}} hasta {{ DateTime.fromISO(attendance.to_date).toFormat('dd/MM/yyyy') }}</b></h1>
                                    <p><b>{{workersAttendances?.days.length}} dias, {{ workersAttendances?.items.length }} trabajadores, {{ attendingsStatuses.attendingsPercentage }}% asistencias y {{ attendingsStatuses.unattendingsPercentage }}% inasistencias</b></p>
                                    <p><b>Job:</b> {{ jobAndExpense.job?.name }} ({{ jobAndExpense.job?.code }})</p>
                                    <p><b>Expense:</b> {{ jobAndExpense.expense?.name }} ({{ jobAndExpense.expense?.code }})</p>
                                    <p v-if="attendance.description"><b>Observaciones:</b> {{ attendance.description }}</p>
                                </ion-label>
                            </ion-item>
                        </ion-list>
                    </article>
                    <section class="ion-padding" v-if="attendance">
                        <ion-button :disabled="isLoading || !hasPendingChangesToSave" expand="block" @click="saveWorkersAttendances">
                            <ion-icon shape="round" size="default" :icon="checkmarkDone" slot="start"></ion-icon>
                            Guardar Asistencia
                        </ion-button>

                        <div>
                            <ion-button color="success" fill="clear" expand="block" @click="downloadExcel">
                                <ion-label>
                                    Descargar Excel
                                </ion-label>
                                <ion-icon slot="start" :icon="cloudDownloadOutline"></ion-icon>
                            </ion-button>
                        </div>
                    </section>

                    <ion-list-header v-if="attendance" style="font-size: 15px">Listado de Asistencias</ion-list-header>
                    <br>


                    <article  v-if="attendance" class="attendance-table-holder">
                        <table class="attendance-table">
                            <thead>
                                <tr>
                                    <th>Trabajador</th>
                                    <th v-for="day in workersAttendances.days" :key="day.date">
                                        {{ day.date }}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="worker in workersAttendances.items" :key="worker.dni">
                                    <td>{{ worker.name }}</td>
                                    <td v-for="day in worker.days" :key="day.date">
                                        <ion-checkbox @ionChange="(e) => updatePresentCheck(e, day.id)" :checked="day.status == 'Present'"></ion-checkbox>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </article>
                    <br>
                    <br>
                    <br>

            </section>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonSkeletonText, IonButtons, IonBackButton, IonButton, IonCheckbox, IonTitle, IonContent, IonProgressBar, IonImg, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController, toastController } from '@ionic/vue';
import { RequestAPI } from '../../utils/Requests/RequestAPI';
import { computed, ref } from 'vue';
import { Dialog } from '../../utils/Dialog/Dialog';

import { addOutline, albumsOutline, alertCircleOutline, checkmarkDone, ellipsisHorizontal, checkmarkCircleOutline,sendOutline, closeCircleOutline, cloudDownloadOutline  } from 'ionicons/icons';
import { IAttendance, EAttendanceStatus } from '../../interfaces/AttendanceInterfaces';
import { useRoute, useRouter } from 'vue-router';
import NewReport from '../../dialogs/NewReport/NewReport.vue';
import { DateTime } from 'luxon';
import {AppEvents} from '../../utils/AppEvents/AppEvents';
import { JobsAndExpenses } from '@/utils/Stored/JobsAndExpenses';
import EditAttendance from '../../dialogs/EditAttendance/EditAttendance.vue';
import { ExcelGenerator } from '@/utils/Attendances/ExcelGenerator';
import { Toolbox } from '@/utils/Toolbox/Toolbox';

const attendanceId = ref<string|null>(null);
const attendancesData = ref<IAttendance|null>(null);
const workersAttendancesData = ref<Array<{
    dni: string,
    name: string,
    days: Array<{
        date: string,
        status: EAttendanceStatus
    }>
}>>([]);
const hasPendingChangesToSave = ref<boolean>(false);
const pendingChangesAutoSave = ref<NodeJS.Timeout|null>(null);

const isLoading = ref<boolean>(true);
const router = useRouter();
const page = ref<HTMLElement|null>(null);
const jobAndExpense = ref<{
    job: null|IJob,
    expense: null|IExpense
}>({
    job: null,
    expense: null
});

const dynamicData = ref({
    daysChecking: []
})

const attendance = computed<IAttendance>(() => {
    const attendanceItem = attendancesData.value;

    return attendanceItem
})
const workersAttendances = computed(() => {
    const workersAttendancesItems = workersAttendancesData.value;

    if (workersAttendancesItems.length > 0){
        return {items: workersAttendancesItems, days: workersAttendancesItems[0].days.map((day) => {
            return {
                date: DateTime.fromISO(day.date).toFormat("dd/MM") as string,
                status: day.status
            }
        })}
    }else{
        return {items: [], days: []}
    }
})
const attendingsStatuses = computed(() => {
    //Calculate count of attendings and unattendings days using the dynamicData.daysChecking:
    let attendings = 0;
    let unattendings = 0;
    dynamicData.value.daysChecking.forEach((worker) => {
        worker.days.forEach((day) => {
            if (day.status == 'Present'){
                attendings++;
            }else{
                unattendings++;
            }
        })
    });

    if (attendings == 0 && unattendings == 0){
        return {
            attendings: 0,
            unattendings: 0,
            attendingsPercentage: 0,
            unattendingsPercentage: 0
        }
    }

    const unattendingPercentage = ((unattendings / (attendings + unattendings)) * 100).toFixed(0);
    const attendingPercentage = ((attendings / (attendings + unattendings)) * 100).toFixed(0);

    return {
        attendings,
        unattendings,
        attendingsPercentage: attendingPercentage,
        unattendingsPercentage: unattendingPercentage
    }
})



const loadAttendance = async () => {
    const routeParams = useRoute();
    if (attendanceId.value === null){
        attendanceId.value = routeParams.params.id as string;
    }

    const workersTeamsListFetched = await RequestAPI.get('/workers-list');
    const attendancesFetched = await RequestAPI.get('/attendances/' + attendanceId.value + '/with-workers-attendances');
    attendancesData.value = attendancesFetched.attendance;
    workersAttendancesData.value = getWorkersFromWorkersAttendancesData(attendancesFetched.workersAttendances, workersTeamsListFetched);
    dynamicData.value.daysChecking = workersAttendancesData.value.map((worker) => {
        return {
            dni: worker.dni,
            days: worker.days.map((day) => {
                return {
                    id: day.id,
                    date: day.date,
                    status: day.status
                }
            })
        }
    });

    jobAndExpense.value.job = await JobsAndExpenses.getJob(attendancesFetched.attendance.job_code);
    jobAndExpense.value.expense = await JobsAndExpenses.getExpense(attendancesFetched.attendance.expense_code);

    isLoading.value = false;
};

const getWorkersFromWorkersAttendancesData = (data:any, workersList:any) => {
    let workers = [];
    data.forEach((workerAttendance) => {
        const isAlreadyAdded = workers.find((worker) => worker.dni == workerAttendance.worker.dni) !== undefined;

        if (isAlreadyAdded){
            return;
        }
        const worker = {
            dni: workerAttendance.worker.dni,
            name: (() => {
                const workerItem = workersList.find((workerList) => workerList.dni == workerAttendance.worker.dni);
                if (workerItem){
                    return workerItem.name;
                }
                return workerAttendance.worker.dni;
            })(),
            days: (() => {
                let days = [];
                const isAlreadyAdded = days.find((day) => day.date == workerAttendance.date) !== undefined;
                if (isAlreadyAdded){
                    return;
                }

                data.forEach((workerAttendanceInner) => {
                    if (workerAttendance.worker.dni == workerAttendanceInner.worker.dni){
                        days.push({
                            id: workerAttendanceInner.id,
                            date: workerAttendanceInner.date,
                            status: workerAttendanceInner.status
                        })
                    }
                });
                return days;
            })()
        }
        workers.push(worker);
    });
    return workers;
}
const updatePresentCheck = (e:any, dayId:number) => {
    const status = e.detail.checked ? 'Present' : 'Absent';
    dynamicData.value.daysChecking.forEach((worker) => {
        worker.days.forEach((day) => {
            if (day.id == dayId){
                day.status = status;
            }
        })
    });
    hasPendingChangesToSave.value = true;
    if (pendingChangesAutoSave.value !== null){
        clearTimeout(pendingChangesAutoSave.value);
    }
    pendingChangesAutoSave.value = setTimeout(() => {
        if (hasPendingChangesToSave.value){
            saveWorkersAttendances();
        }
    }, 2000);
}
const saveWorkersAttendances = async () => {
    isLoading.value = true;
    const dataSend = {
        workers: dynamicData.value.daysChecking.map((worker) => {
            return {
                dni: worker.dni,
                days: worker.days.map((day) => {
                    return {
                        id: day.id,
                        status: day.status
                    }
                })
            }
        })
    }
    const response = await RequestAPI.put('/attendances/' + attendanceId.value + '/workers-attendances', dataSend);
    isLoading.value = false;
    hasPendingChangesToSave.value = false;
    toastController.create({
        message: '✅ Asistencias guardadas y registradas con éxito!',
        duration: 2000
    }).then((toast) => {
        toast.present();
    })

}
const editAttendance = () => {
    Dialog.show(EditAttendance, {
        props: {
            attendance: attendancesData.value,
        },
        onLoaded($this) {
            $this.on('updated', (event:any) => {
                AppEvents.emit('all:reload');
                loadAttendance();
            })
            $this.on('deleted', (event:any) => {
                AppEvents.emit('all:reload');
                router.replace('/my-attendances');
            })
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        }
    })
}

const downloadExcel = async () => {
    ExcelGenerator.generateExcelFrom({
        filters: [
            {
                id: 'start_date',
                name: 'Desde',
                value: DateTime.fromISO(attendance.value.from_date).toISO(),
                isRequired: true,
                type: 'date',
                options: [],
            },
            {
                id: 'end_date',
                name: 'Hasta',
                value: DateTime.fromISO(attendance.value.to_date).toISO(),
                isRequired: true,
                type: 'date',
                options: [],
            },
            {
                id: 'job_code',
                name: 'Job',
                value: attendance.value.job_code,
                isRequired: true,
                type: 'select',
                options:[],
            },
            {
                id: 'expense_code',
                name: 'Expense',
                value: attendance.value.expense_code,
                isRequired: true,
                type: 'select',
                options: [],
            }
        ],
        data: {
            headers: [
                {
                    title: 'Trabajador',
                    key: 'worker_name'
                },
                {
                    title: 'DNI',
                    key: 'worker_dni'
                },
                ...workersAttendances.value.items[0].days.map((day) => {
                    const dateParsed = DateTime.fromISO(day.date).toFormat("dd/MM") as string;
                    return {
                        title: dateParsed,
                        key: dateParsed
                    }
                })
            ],
            body: workersAttendances.value.items.map((worker) => {

                let item = {
                    worker_name: worker.name,
                    worker_dni: worker.dni
                }
                worker.days.forEach((day) => {
                    const dateParsed = DateTime.fromISO(day.date).toFormat("dd/MM") as string;
                    item[dateParsed] = day.status  == 'Present' ? '✅' : '❌';
                })
                return item;
            })
        },
        title: 'Asistencia ' + `${DateTime.fromISO(attendance.value.from_date).toFormat('dd/MM/yyyy')} hasta ${ DateTime.fromISO(attendance.value.to_date).toFormat('dd/MM/yyyy')}`,
    }).then((result) => {
        const fileTitle = 'Asistencia ' + `${DateTime.fromISO(attendance.value.from_date).toFormat('dd/MM/yyyy')} hasta ${ DateTime.fromISO(attendance.value.to_date).toFormat('dd/MM/yyyy')}`
        Toolbox.share(fileTitle + '.xlsx', result as unknown as string)
    })
}

loadAttendance();
</script>


<style lang="scss" scoped>
$color_1: #000000;
$background-color_1: #eceff1;
$background-color_2: #ffffff;

.attendance-table{
	overflow: auto;
	width: 100%;
    position: relative;
	table {
		border: 1px solid #dededf;
		height: 100%;
		width: 100%;
		table-layout: fixed;
		border-collapse: collapse;
		border-spacing: 1px;
		text-align: center;
	}
	caption {
		caption-side: top;
		text-align: center;
	}
	th {
        position: sticky;
        top: 0;
		border: 1px solid #dededf;
		background-color: $background-color_1;
		color: $color_1;
		padding: 5px;
        z-index: 10;
	}
	td {
		border: 1px solid #dededf;
		background-color: $background-color_2;
		color: $color_1;
		padding: 5px;
        text-align: center;
        vertical-align: middle;
	}
    td:first-child {
        position: sticky;
        left: 0;
        background-color: $background-color_2;
        z-index: 10;
        text-align: left;
    }
    th:first-child {
        position: sticky;
        left: 0;
        z-index: 15;
    }
}


.attendance-table-holder{
    overflow-x: auto;
}

</style>


<style scoped lang="scss">

.content{
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
}

</style>