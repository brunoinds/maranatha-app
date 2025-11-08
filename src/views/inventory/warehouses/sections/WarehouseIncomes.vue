<template>
    <section class="content">
        <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        <br>




        <article v-for="incomeGrouped  in incomesGrouppedUI">
            <ion-list-header>{{ incomeGrouped.monthYearText }}</ion-list-header>
            <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                <ion-item v-for="income in incomeGrouped.attendances" button @click="openWarehouseIncome(income.original)">
                    <ion-label>
                        <h2><b>#00{{ income.id }} - {{ income.job?.code }} - {{ income.job?.name }}</b></h2>
                        <h3>{{ income.date }}</h3>
                        <p v-if="income.expense"><b>Expense:</b> ({{ income.expense.code }}) {{ income.expense.name }}</p>
                        <p>{{ income.items_count }} productos</p>
                    </ion-label>
                    <ion-label slot="end" color="primary">
                        <h2><b>{{ income.amount }}</b></h2>
                    </ion-label>
                </ion-item>
            </ion-list>
        </article>

    </section>

    <ion-fab slot="fixed" vertical="bottom" horizontal="end" :edge="false">
        <ion-fab-button @click="createWarehouseIncomeFromOutcome">
            <ion-icon :icon="downloadOutline"></ion-icon>
        </ion-fab-button>
        <br>
        <ion-fab-button @click="createWarehouseIncome">
            <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
    </ion-fab>
</template>


<script setup lang="ts">

import CreateInventoryWarehouseIncome from '@/dialogs/CreateInventoryWarehouseIncome/CreateInventoryWarehouseIncome.vue';
import EditInventoryWarehouseIncome from '@/dialogs/EditInventoryWarehouseIncome/EditInventoryWarehouseIncome.vue';
import ImportInventoryWarehouseIncome from '@/dialogs/ImportInventoryWarehouseIncome/ImportInventoryWarehouseIncome.vue';
import { IWarehouse, IWarehouseIncome } from '@/interfaces/InventoryInterfaces';
import { IExpense, IJob } from '@/interfaces/JobsAndExpensesInterfaces';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { Dialog } from '@/utils/Dialog/Dialog';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { JobsAndExpenses } from '@/utils/Stored/JobsAndExpenses';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import { Viewport } from '@/utils/Viewport/Viewport';
import { IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonProgressBar } from '@ionic/vue';
import { addOutline, downloadOutline } from 'ionicons/icons';
import { DateTime } from 'luxon';
import { PropType, computed, onMounted, onUnmounted, ref } from 'vue';

const isLoading = ref<boolean>(false);
const props = defineProps({
    warehouse: {
        type: Object as PropType<IWarehouse>,
        required: true
    }
});

const jobsAndExpenses = ref<{jobs: Array<IJob>, expenses: Array<IExpense>}>({
    jobs: [],
    expenses: []
});

const incomesData = ref<IWarehouseIncome[]>([]);

const incomesUI = computed(() => {
    return incomesData.value.map((income) => {
        return {
            ...income,
            date: DateTime.fromJSDate(new Date(income.date)).toFormat("dd/MM/yyyy").toString(),
            amount: Toolbox.moneyFormat(income.amount, income.currency),
            items_count: income.items_count,
            job: jobsAndExpenses.value.jobs.find((job) => job.code == income.job_code),
            expense: jobsAndExpenses.value.expenses.find((expense) => expense.code == income.expense_code),
            original: income
        }
    }).sort((a, b) => b.id - a.id);
});

const loadIncomes = async () => {
    isLoading.value = true;
    const response = await RequestAPI.get(`/inventory/warehouses/${props.warehouse.id}/incomes`);
    incomesData.value = response;
    isLoading.value = false;
}

const createWarehouseIncome = () => {
    Dialog.show(CreateInventoryWarehouseIncome, {
        props: {
            warehouseId: props.warehouse.id
        },
        onLoaded($this) {
            $this.on('created', (event:any) => {
                AppEvents.emit('inventory:reload');
            })
        },
        modalControllerOptions: {
            //presentingElement: props.page,
            //showBackdrop: true,
        }
    })
}

const createWarehouseIncomeFromOutcome = () => {
    Dialog.show(ImportInventoryWarehouseIncome, {
        props: {
            warehouseId: props.warehouse.id
        },
        onLoaded($this) {
            $this.on('created', (event:any) => {
                AppEvents.emit('inventory:reload');
            })
        },
        modalControllerOptions: {
            //presentingElement: props.page,
            //showBackdrop: true,
        }
    })
}

const openWarehouseIncome = (warehouseIncome: IWarehouseIncome) => {
    Dialog.show(EditInventoryWarehouseIncome, {
        props: {
            warehouseIncome: warehouseIncome,
            isReadonly: false
        },
        onLoaded($this) {
            $this.on('updated', (event:any) => {
                AppEvents.emit('inventory:reload');
            })
            $this.on('deleted', (event:any) => {
                AppEvents.emit('inventory:reload');
            })
        },
        modalControllerOptions: {
            //presentingElement: props.page,
            //showBackdrop: true,
        }
    })
}



const incomesGrouppedUI = computed(() => {
    //Group attendances by from_date month/year:
    const groupedAttendances = incomesUI.value.sort((a, b) => {
        return DateTime.fromFormat(b.date, 'dd/MM/yyyy').toMillis() - DateTime.fromFormat(a.date, 'dd/MM/yyyy').toMillis();
    }).reduce((acc, attendance) => {
        const monthYear = DateTime.fromFormat(attendance.date, 'dd/MM/yyyy').toFormat('MM/yyyy');
        if (!acc[monthYear]){
            acc[monthYear] = [];
        }
        acc[monthYear].push(attendance);
        return acc;
    }, {} as {[key: string]: any[]});

    const groupedAttendancesUI = Object.keys(groupedAttendances).map((key) => {
        return {
            monthYear: key,
            monthYearText: DateTime.fromFormat(key, 'MM/yyyy').toFormat('MMMM yyyy'),
            attendances: groupedAttendances[key]
        }
    })

    return groupedAttendancesUI;
})

const loadJobsAndExpenses = async () => {
    const jobs =  await JobsAndExpenses.getJobs() as unknown as Array<IJob>;
    jobsAndExpenses.value.jobs = jobs

    const expenses = await JobsAndExpenses.getExpenses() as unknown as Array<IExpense>;
    jobsAndExpenses.value.expenses = expenses;
}


onMounted(() => {
    loadIncomes();
    loadJobsAndExpenses();
    const callbackId = AppEvents.on('inventory:reload', () => {
        loadIncomes()
    })
    onUnmounted(() => {
        AppEvents.off('inventory:reload', callbackId);
    })
});
</script>

<style scoped lang="scss">
.content{
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
}
ion-fab[slot="fixed"]{
    position: fixed;
}
</style>

