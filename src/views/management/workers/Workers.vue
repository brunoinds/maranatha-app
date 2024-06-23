<template>
    <section>
        <header class="ion-padding">
            <ion-segment v-if="configurationsData" :scrollable="true" :value="segmentValue" v-model="segmentValue">
                <ion-segment-button v-for="itemRecord in configurationsData" :value="itemRecord.id" :key="itemRecord.id">
                    <ion-label>{{ itemRecord.title}}</ion-label>
                </ion-segment-button>
            </ion-segment>
        </header>
        <main>
            <article v-if="segmentValue == 'workers'" class="content">
                <ion-progress-bar type="indeterminate" v-if="isLoading"></ion-progress-bar>
                <ion-fab slot="fixed" vertical="bottom" horizontal="end" :edge="false">
                    <ion-fab-button @click="addWorker">
                        <ion-icon :icon="addOutline"></ion-icon>
                    </ion-fab-button>
                </ion-fab>
                <main>
                    <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                        <ion-item v-for="worker in workersAndPaymentsTableUI.workers" button @click="editWorker(worker as unknown as IWorker)">
                            <ion-label>
                                <h2><b>{{ worker.name }}</b></h2>
                                <p>{{ worker.dni }} - {{ worker.role }}</p>
                                <p>{{ worker.team }} - {{ worker.supervisor }}</p>
                            </ion-label>
                        </ion-item>
                    </ion-list>
                    <br>
                </main>
                
            </article>
            <article v-if="segmentValue == 'table'">
                <header class="ion-padding">
                    <ion-select interface="popover" label="Seleciona un año" label-placement="floating" fill="outline" mode="md" :value="yearDropdownChosen" v-model="yearDropdownChosen">
                        <ion-select-option v-for="period in yearsAvailableOptions"  :value="period.value">{{ period.text }}</ion-select-option>
                    </ion-select>
                </header>
                <ion-progress-bar type="indeterminate" v-if="isLoading"></ion-progress-bar>
                <ion-fab slot="fixed" vertical="bottom" horizontal="end" :edge="false">
                    <ion-fab-button @click="createWorkersPayment">
                        <ion-icon :icon="addOutline"></ion-icon>
                    </ion-fab-button>
                </ion-fab>

                <main>
                    <article class="table-holder">
                        <table class="attendance-table">
                            <thead>
                                <tr >
                                    <th colspan="8">Datos de los trabajadores</th>
                                    <th colspan="12">Pagos</th>
                                </tr>
                                <tr head>
                                    <th>Nombres</th>
                                    <th>DNI</th>
                                    <th>
                                        <ion-icon :icon="pencilOutline"></ion-icon>
                                    </th>
                                    <th>Equipo</th>
                                    <th>País</th>
                                    <th>Supervisor</th>
                                    <th>Función</th>
                                    <th>Está activo?</th>

                                    <th v-for="date in workersAndPaymentsTableUI.dates" :key="date.month + date.year">
                                        {{ date.month }}/{{ date.year }}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="worker in workersAndPaymentsTableUI.workers">
                                    <td  style="white-space: nowrap;"><b>{{ worker.name }}</b></td>
                                    <td>{{ worker.dni }}</td>
                                    <td>
                                        <ion-button size="small" fill="clear"  @click="editWorker(worker as unknown as IWorker)">
                                            <ion-icon :icon="pencilOutline"></ion-icon>
                                        </ion-button>
                                    </td>
                                    <td>{{ worker.team }}</td>
                                    <td>{{ worker.country }}</td>
                                    <td>{{ worker.supervisor }}</td>
                                    <td>{{ worker.role }}</td>
                                    <td>
                                        <ion-chip v-if="worker.is_active" color="success">
                                            <ion-label style="font-size: 12px;">Activo</ion-label>
                                            <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                                        </ion-chip>
                                        <ion-chip v-if="!worker.is_active" color="danger">
                                            <ion-label style="font-size: 12px;">Inactivo</ion-label>
                                            <ion-icon :icon="closeCircleOutline"></ion-icon>
                                        </ion-chip>
                                    </td>

                                    

                                    <td v-for="payment in worker.payments">
                                        <ion-chip v-if="payment.hasPayment" color="primary" @click="changeWorkerPayment(worker as unknown as IWorker, payment as unknown as IWorkerPayment, payment.month, payment.year)">
                                            <ion-label style="white-space: nowrap;">{{ payment.amountString }}</ion-label>
                                        </ion-chip>

                                        <ion-chip v-if="!payment.hasPayment" color="light" @click="changeWorkerPayment(worker as unknown as IWorker, null, payment.month, payment.year)">
                                            <ion-label>0.00</ion-label>
                                        </ion-chip>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <br>
                    </article>
                </main>
            </article>
            <article v-if="segmentValue == 'payments'" class="content">
                <header class="ion-padding">
                    <ion-select interface="popover" label="Seleciona un año" label-placement="floating" fill="outline" mode="md" :value="yearDropdownChosen" v-model="yearDropdownChosen">
                        <ion-select-option v-for="period in yearsAvailableOptions"  :value="period.value">{{ period.text }}</ion-select-option>
                    </ion-select>
                </header>
                <ion-progress-bar type="indeterminate" v-if="isLoading"></ion-progress-bar>
                <ion-fab slot="fixed" vertical="bottom" horizontal="end" :edge="false">
                    <ion-fab-button @click="createWorkersPayment">
                        <ion-icon :icon="addOutline"></ion-icon>
                    </ion-fab-button>
                </ion-fab>
                <main>
                    <ion-accordion-group style="margin-top:10px">
                        <ion-accordion v-for="worker in workersAndPaymentsTableUI.workers" :key="worker.id">
                            <ion-item slot="header" color="light" :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                                <ion-label>
                                    <h2><b>{{ worker.name }}</b></h2>
                                    <p>{{ worker.dni }} - {{ worker.role }}</p>
                                    <p>{{ worker.team }} - {{ worker.supervisor }}</p>
                                </ion-label>
                            </ion-item>
                            <section slot="content">
                                <ion-list>
                                    <ion-item v-for="payment in worker.payments.filter((payment) => {return payment.hasPayment})" :key="payment.id" button @click="changeWorkerPayment(worker as unknown as IWorker, (payment.hasPayment ? payment as unknown as IWorkerPayment : null), payment.month, payment.year)" :detail="true">
                                        <ion-label v-if="payment.hasPayment" color="success">
                                            <h2><b>{{payment.month }}/{{ payment.year }}</b></h2>
                                            <p>Pago realizado</p>
                                        </ion-label>

                                        <ion-label v-if="payment.hasPayment" color="success" slot="end">
                                            <p><b>{{ payment.amountString }}</b></p>
                                        </ion-label>

                                        <ion-label v-if="!payment.hasPayment">
                                            <h2><b>{{payment.month }}/{{ payment.year }}</b></h2>
                                        </ion-label>
                                    </ion-item>
                                </ion-list>
                            </section>
                        </ion-accordion>
                    </ion-accordion-group>
                    <br>
                </main>
            </article>
        </main>
    </section>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonCheckbox, IonSegment,IonSelect, IonSelectOption, IonButton, IonSegmentButton, IonContent, IonAccordion, IonAccordionGroup, IonProgressBar, IonImg, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController } from '@ionic/vue';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { computed, ref, watch } from 'vue';
import { Dialog } from '@/utils/Dialog/Dialog';
import AttendanceIcon from '&/assets/icons/attendance.svg';

import { addOutline, albumsOutline, alertCircleOutline, cashOutline, checkmarkCircleOutline,addCircleOutline, cogOutline,pencilOutline, sendOutline, closeCircleOutline  } from 'ionicons/icons';
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
import { onMounted } from 'vue';
import { onUnmounted } from 'vue';
import { IWorker, IWorkerPayment } from '@/interfaces/WorkerInterfaces';
import CreateWorker from '@/dialogs/CreateWorker/CreateWorker.vue';
import CreateWorkerPayment from '@/dialogs/CreateWorkerPayment/CreateWorkerPayment.vue';
import CreateWorkersPayment from '@/dialogs/CreateWorkerPayment/CreateWorkersPayment.vue';
import EditWorker from '@/dialogs/EditWorker/EditWorker.vue';
import { useManagementHtml } from '@/views/management/management';


const isLoading = ref<boolean>(true);
const segmentValue = ref<string>('workers');
const workers = ref<IWorker[]>([]);
const payments = ref<IWorkerPayment[]>([]);
const page = ref<HTMLElement|null>(null);

const workersAndPaymentsTableUI = computed(() => {
    const year = yearDropdownChosen.value;
    const dates = Array.from({length: 12}).map((_, i) => {
        return {
            year: year,
            month: i + 1,
        };
    })

    const workersData = workers.value.map((worker) => {
        const workerPayments = payments.value.filter((payment) => payment.worker_id == worker.id);
        const workerPaymentsByDate = dates.map((date) => {
            const workerPayment = workerPayments.find((payment) => {
                return payment.year == date.year && payment.month == date.month;
            })
            return {
                id: workerPayment?.id || 0,
                amount: workerPayment?.amount || 0,
                currency: workerPayment?.currency || '',
                month: date.month,
                year: date.year,
                hasPayment: !!workerPayment,
                amountString: Toolbox.moneyFormat(workerPayment?.amount || 0, workerPayment?.currency as any || 'PEN')
            };
        })
        return {
            id: worker.id,
            name: worker.name,
            team: worker.team,
            country: worker.country,
            supervisor: worker.supervisor,
            role: worker.role,
            is_active: worker.is_active,
            payments: workerPaymentsByDate,
            dni: worker.dni
        }
    })

    return {
        dates,
        workers: workersData
    }
})


const configurationsData = computed(() => {
    let items = [
        {
            id: 'table',
            title: 'Trabajadores e pagos',
            enabled: !Viewport.data.value.isScreenNarrow
        },
        {
            id: 'workers',
            title: 'Trabajadores',
            enabled: true
        },
        {
            id: 'payments',
            title: 'Pagos',
            enabled: true
        }
    ];


    return items.filter((item) => item.enabled);
});


const loadWorkersAndPayments = async () => {
    isLoading.value = true;
    workers.value = await RequestAPI.get('/workers');
    payments.value = await RequestAPI.get('/worker-payments');
    isLoading.value = false;
}

const addWorker = async () => {
    Dialog.show(CreateWorker, {
        onLoaded($this) {
            $this.on('created', (event:any) => {
                loadWorkersAndPayments();
            })
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        }
    })
}

const editWorker = async (worker:IWorker) => {
    Dialog.show(EditWorker, {
        onLoaded($this) {
            $this.on('deleted', (event:any) => {
                loadWorkersAndPayments();
            })
            $this.on('updated', (event:any) => {
                loadWorkersAndPayments();
            })
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        },
        props: {
            worker: worker
        }
    })
}

const createWorkersPayment = async (worker:IWorker, month: number, year:number) => {
    Dialog.show(CreateWorkersPayment, {
        onLoaded($this) {
            $this.on('updated', (event:any) => {
                loadWorkersAndPayments();
            })
            $this.on('created', (event:any) => {
                loadWorkersAndPayments();
            })
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        },
        props: {
            month,
            year,
            worker
        }
    })
}

const changeWorkerPayment = async (worker:IWorker|null = null, payment: IWorkerPayment|null = null, month: number, year:number) => {
    Dialog.show(CreateWorkerPayment, {
        onLoaded($this) {
            $this.on('deleted', (event:any) => {
                loadWorkersAndPayments();
            })
            $this.on('updated', (event:any) => {
                loadWorkersAndPayments();
            })
            $this.on('created', (event:any) => {
                loadWorkersAndPayments();
            })
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        },
        props: {
            workerPayment: payment,
            month,
            year,
            worker
        }
    })
}
const yearDropdownChosen = ref<number>(DateTime.now().year);
const yearsAvailableOptions = computed(() => {
    const options = [];
    for (let year = DateTime.now().year; year >= 2023; year--){
        options.push({
            value: year,
            text: `${DateTime.fromObject({year}).toFormat('yyyy')}`
        })
    }
    return options;
})
watch(yearDropdownChosen, (value) => {
    if (value == null){
        return;
    }
    loadWorkersAndPayments();
})

onMounted(() => {
    const callbackId = AppEvents.on('all:reload', () => {
        loadWorkersAndPayments();
    })

    onUnmounted(() => {
        AppEvents.off('all:reload', callbackId);
    })
    loadWorkersAndPayments();
    const info = useManagementHtml();
    page.value = info.page.value;
})
</script>

<style scoped lang="scss">

.content{
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
    overflow-x: scroll;
}

.table-holder{
    overflow-x: auto;
}

@media (min-width: 768px) {
    .table-holder{
        margin-left: 16px;
        margin-right: 16px;
    }
}

$color_1: var(--ion-color-light-contrast);
$background-color_1: var(--ion-color-light-shade);
$background-color_2: var(--ion-color-light-tint);
$background-color_3: var(--ion-color-dark);

.attendance-table{
	overflow: auto;
	width: 100%;
    position: relative;
    font-size: 12px;
	table {
		border: 1px solid $background-color_2;
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
		border-bottom: 1px solid $background-color_1;
		background-color: $background-color_2;
		color: $color_1;
		padding: 5px;
        z-index: 10;
	}
	td {
        border-bottom: 1px solid $background-color_1;
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
    tr[head]{
        th:first-child{
            position: sticky;
            left: 0;
            z-index: 15;
        }
    }
}

</style>