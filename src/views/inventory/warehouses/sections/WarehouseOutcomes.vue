<template>
    <section class="content">
        <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        

        <div class="ion-padding">
            <ion-segment v-model="selectedView">
                <ion-segment-button value="Individuals">
                    <ion-label>Individuales</ion-label>
                </ion-segment-button>
                <ion-segment-button value="ByJobs">
                    <ion-label>Por Jobs</ion-label>
                </ion-segment-button>
            </ion-segment>
        </div>

        

        <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'" v-if="selectedView == 'Individuals'">
            <ion-item v-for="outcome in outcomesUI" button @click="openWarehouseOutcome(outcome.original)">
                <ion-label>
                    <h2><b>#00{{ outcome.id }} - {{ outcome.job?.code }} {{ outcome.job?.name }}</b></h2>
                    <h3>{{ outcome.date }}</h3>
                    <p v-if="outcome.expense"><b>Expense:</b> ({{ outcome.expense.code }}) {{ outcome.expense.name }}</p>
                    <p v-if="outcome.user"><b>Usuario:</b> {{ outcome.user.name }}</p>

                    <p>{{ outcome.items_count }} productos</p>
                </ion-label>
                <ion-label slot="end" color="primary">
                    <h2 v-for="(item, i) in outcome.amount">
                        <b v-if="i > 0">+</b>
                        <b>{{ item }}</b>
                    </h2>
                </ion-label>
            </ion-item>
        </ion-list>


        <article  v-if="selectedView == 'ByJobs'" class="ion-padding">
            <ion-accordion-group v-for="item in outcomesByJobsUI" :key="item.job?.code" value="first" >
                <ion-accordion value="first">
                    <ion-item slot="header" color="light">
                        <ion-label>
                            <h2><b>{{ item.job?.code }} - {{ item.job?.name }}</b></h2>
                            <p>{{ item.outcomes.length }} salidas</p>
                        </ion-label>
                    </ion-item>
                    <section slot="content" class="ion-padding">
                        <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                            <ion-item v-for="outcome in item.outcomes" button @click="openWarehouseOutcome(outcome.original)">
                                <ion-label>
                                    <h2><b>#00{{ outcome.id }}</b> - {{ outcome.expense?.code }} {{ outcome.expense?.name }}</h2>
                                    <h3>{{ outcome.date }}</h3>
                                    <p v-if="outcome.expense"><b>Expense:</b> ({{ outcome.expense.code }}) {{ outcome.expense.name }}</p>
                                    <p v-if="outcome.user"><b>Usuario:</b> {{ outcome.user.name }}</p>

                                    <p>{{ outcome.items_count }} productos</p>
                                </ion-label>
                                <ion-label slot="end" color="primary">
                                    <h2 v-for="(item, i) in outcome.amount">
                                        <b v-if="i > 0">+</b>
                                        <b>{{ item }}</b>
                                    </h2>
                                </ion-label>
                            </ion-item>
                        </ion-list>
                    </section>
                </ion-accordion>
            </ion-accordion-group>
        </article>
    </section>


    <ion-fab slot="fixed" vertical="bottom" horizontal="end" :edge="false">
        <ion-fab-button @click="createWarehouseOutcome">
            <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
    </ion-fab>
</template>


<script setup lang="ts">

import { IonList, IonItem, IonLabel, IonFab, IonFabButton, IonIcon, IonProgressBar, IonSegment, IonSegmentButton, IonAccordion, IonAccordionGroup } from '@ionic/vue';
import { PropType, computed, onMounted, onUnmounted, ref } from 'vue';
import { IWarehouse, IWarehouseOutcome } from '@/interfaces/InventoryInterfaces';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import { addOutline } from 'ionicons/icons';
import { Dialog } from '@/utils/Dialog/Dialog';
import CreateInventoryWarehouseOutcome from '@/dialogs/CreateInventoryWarehouseOutcome/CreateInventoryWarehouseOutcome.vue';
import EditInventoryWarehouseOutcome from '@/dialogs/EditInventoryWarehouseOutcome/EditInventoryWarehouseOutcome.vue';
import { Viewport } from '@/utils/Viewport/Viewport';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { IExpense, IJob } from '@/interfaces/JobsAndExpensesInterfaces';
import { JobsAndExpenses } from '@/utils/Stored/JobsAndExpenses';
import { IUser } from '@/interfaces/UserInterfaces';
import { UsersStore } from '@/utils/Stored/UsersStore';
import _ from 'lodash';

const isLoading = ref<boolean>(false);
const props = defineProps({
    warehouse: {
        type: Object as PropType<IWarehouse>,
        required: true
    }
});

const usersData = ref<Array<IUser>>([]);

const selectedView = ref<'Individuals'|'ByJobs'>('Individuals');


const outcomesData = ref<IWarehouseOutcome[]>([]);

const jobsAndExpenses = ref<{jobs: Array<IJob>, expenses: Array<IExpense>}>({
    jobs: [],
    expenses: []
});

const outcomesUI = computed(() => {
    return outcomesData.value.map((outcome) => {
        return {
            ...outcome,
            date: new Date(outcome.date).toLocaleDateString(),
            amount: outcome.amount.map((amount) => {
                return Toolbox.moneyFormat(amount.amount, amount.currency)
            }),
            items_count: outcome.items_count,
            job: jobsAndExpenses.value.jobs.find((job) => job.code == outcome.job_code) || { code: outcome.job_code, name: 'Sin Job' },
            expense: jobsAndExpenses.value.expenses.find((expense) => expense.code == outcome.expense_code),
            user: usersData.value.find((user) => user.id == outcome.user_id),
            original: outcome
        }
    }).sort((a, b) => b.id - a.id);
});

const outcomesByJobsUI = computed(() => {
    const jobs = Object.keys(_.groupBy(outcomesUI.value, 'job.code')).map((jobCode) => {
        const jobOutcomes = outcomesUI.value.filter((outcome) => outcome.job?.code == jobCode);
        return {
            job: jobOutcomes[0].job,
            outcomes: jobOutcomes
        }
    })

    return jobs;
})

const loadOutcomes = async () => {
    isLoading.value = true;
    const response = await RequestAPI.get(`/inventory/warehouses/${props.warehouse.id}/outcomes`);
    outcomesData.value = response;
    isLoading.value = false;
}


const createWarehouseOutcome = () => {
    Dialog.show(CreateInventoryWarehouseOutcome, {
        props: {
            warehouseId: props.warehouse.id
        },
        onLoaded($this) {
            $this.on('created', (event:any) => {
                loadOutcomes()
            })
        },
        modalControllerOptions: {
            //presentingElement: props.page,
            //showBackdrop: true,
        }
    })
}
const openWarehouseOutcome = (warehouseOutcome: IWarehouseOutcome) => {
    Dialog.show(EditInventoryWarehouseOutcome, {
        props: {
            warehouseOutcome: warehouseOutcome
        },
        onLoaded($this) {
            $this.on('deleted', (event:any) => {
                AppEvents.emit('inventory:reload');
            })
            $this.on('updated', (event:any) => {
                AppEvents.emit('inventory:reload');
            })
        },
        modalControllerOptions: {
            //presentingElement: props.page,
            //showBackdrop: true,
        }
    })
}

const loadJobsAndExpenses = async () => {
    const jobs =  await JobsAndExpenses.getJobs() as unknown as Array<IJob>;
    jobsAndExpenses.value.jobs = jobs

    const expenses = await JobsAndExpenses.getExpenses() as unknown as Array<IExpense>;
    jobsAndExpenses.value.expenses = expenses;
}
const loadUsers = async () => {
    const users = await UsersStore.getUsers();
    usersData.value = users;
}
onMounted(() => {
    loadOutcomes();
    loadJobsAndExpenses();
    loadUsers();
    const callbackId = AppEvents.on('inventory:reload', () => {
        loadOutcomes()
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

