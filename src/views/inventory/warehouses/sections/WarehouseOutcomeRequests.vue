<template>
    <section class="content">
        <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>

        <ion-segment v-model="selectedView">
            <ion-segment-button value="Outcomes">
                <ion-label>Salidas</ion-label>
            </ion-segment-button>
            <ion-segment-button value="Loans">
                <ion-label>Préstamos</ion-label>
            </ion-segment-button>
        </ion-segment>

        <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
            <ion-item v-for="outcome in outcomesUI" button @click="openWarehouseOutcomeRequest(outcome)">
                <ion-label>
                    <h2><b>{{ outcome.title }}</b></h2>
                    <h3><b>{{ outcome.user?.name }}</b></h3>
                    <p>{{ outcome.date_ago }}</p>
                    <br>
                    <p><b>Job:</b> {{ outcome.job.code }} {{ outcome.job.name }}</p>
                    <p><b>Expense:</b> {{ outcome.expense.code }} {{ outcome.expense.name }}</p>
                    <p><b>{{ outcome.products_count }} ítems solicitados</b></p>
                </ion-label>

                    <!-- <ion-button size="default" fill="clear" v-if="outcome.chat.unseen_messages_count" :disabled="true">
                        <ion-icon slot="start" :icon="chatbubbleEllipsesOutline"></ion-icon>
                        {{ outcome.chat.unseen_messages_count }}
                    </ion-button>
                    -->
                <OutcomeRequestStatusChip slot="end" :request="outcome" :view-mode="'Dispacher'" />
            </ion-item>
        </ion-list>
    </section>


    <ion-fab slot="fixed" vertical="bottom" horizontal="end" :edge="false">
        <ion-fab-button @click="openQrCodeScanner('Dispacher')">
            <ion-icon :icon="qrCodeOutline"></ion-icon>
        </ion-fab-button>
        <br>
        <ion-fab-button @click="createWarehouseOutcomeRequest">
            <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
    </ion-fab>
</template>


<script setup lang="ts">

import { IonList, IonItem, IonLabel, IonFab, IonFabButton, IonIcon, IonButton, IonProgressBar, IonSegment, IonSegmentButton } from '@ionic/vue';
import { PropType, computed, onMounted, onUnmounted, ref } from 'vue';
import { IWarehouse, IWarehouseOutcome, IWarehouseOutcomeRequest } from '@/interfaces/InventoryInterfaces';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import { addOutline, chatbubbleEllipsesOutline, qrCodeOutline } from 'ionicons/icons';
import { Dialog } from '@/utils/Dialog/Dialog';
import CreateInventoryWarehouseOutcome from '@/dialogs/CreateInventoryWarehouseOutcome/CreateInventoryWarehouseOutcome.vue';
import EditInventoryWarehouseOutcome from '@/dialogs/EditInventoryWarehouseOutcome/EditInventoryWarehouseOutcome.vue';
import CreateInventoryWarehouseOutcomeRequest from '@/dialogs/CreateInventoryWarehouseOutcomeRequest/CreateInventoryWarehouseOutcomeRequest.vue';
import { useRouter } from 'vue-router';
import  OutcomeRequestStatusChip  from '@/components/OutcomeRequestStatusChip/OutcomeRequestStatusChip.vue';
import TimeAgo from 'javascript-time-ago';
import es from 'javascript-time-ago/locale/es';
import { IUser } from '@/interfaces/UserInterfaces';
import { Session } from '@/utils/Session/Session';
import { Viewport } from '@/utils/Viewport/Viewport';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { QRCodeScanner } from '@/dialogs/QRCodeScanner/QRCodeScanner';
import { IExpense, IJob } from '@/interfaces/JobsAndExpensesInterfaces';
import { JobsAndExpenses } from '@/utils/Stored/JobsAndExpenses';

TimeAgo.addLocale(es);
const timeAgo = new TimeAgo('es-PE');

const router = useRouter();

const isLoading = ref<boolean>(false);
const props = defineProps({
    warehouse: {
        type: Object as PropType<IWarehouse>,
        required: true
    }
});

const outcomesData = ref<IWarehouseOutcomeRequest[]>([]);
const usersData = ref<IUser[]>([]);
const jobsAndExpenses = ref<{jobs: Array<IJob>, expenses: Array<IExpense>}>({
    jobs: [],
    expenses: []
});

const selectedView = ref<'Loans'|'Outcomes'>('Outcomes');

const loadJobsAndExpenses = async () => {
    const jobs =  await JobsAndExpenses.getJobs() as unknown as Array<IJob>;
    jobsAndExpenses.value.jobs = jobs

    const expenses = await JobsAndExpenses.getExpenses() as unknown as Array<IExpense>;
    jobsAndExpenses.value.expenses = expenses;
}
const outcomesUI = computed(() => {
    return outcomesData.value.map((outcome) => {
        const job = jobsAndExpenses.value.jobs.find(job => job.code === outcome.job_code) || { code: '', name: '' };
        const expense = jobsAndExpenses.value.expenses.find(expense => expense.code === outcome.expense_code) || { code: '', name: '' };
        return {
            ...outcome,
            date_ago: timeAgo.format(new Date(outcome.requested_at || outcome.created_at)),
            user: usersData.value.find(user => user.id === outcome.user_id),
            products_count: outcome.requested_products.reduce((acc, product) => acc + product.quantity, 0),
            job,
            expense,
            title: `Pedido #00${outcome.id} - ${job.code} ${job?.name} - ${expense.code} ${expense?.name}`,
            request_type: (outcome as any).request_type as 'Outcomes' | 'Loans',
            original: outcome
        }
    }).sort((a, b) => b.id - a.id).filter(outcome => outcome.request_type === selectedView.value);
});

const loadOutcomes = async () => {
    isLoading.value = true;
    const response = await RequestAPI.get(`/inventory/warehouses/${props.warehouse.id}/outcome-requests`);
    usersData.value = await RequestAPI.get('/users');
    outcomesData.value = response;
    isLoading.value = false;

}

const openQrCodeScanner = (viewModeAs:string) => {
    QRCodeScanner.open().onScan().then((content) => {
        if (content.includes('app/inventory/outcome-requests/')){
            const id = content.split('?view-mode')[0].split('/').pop();
            router.push(`/inventory/outcome-requests/${id}?view-mode=${viewModeAs}`);
        }
    })
}


const createWarehouseOutcomeRequest = () => {
    Dialog.show(CreateInventoryWarehouseOutcomeRequest, {
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
const openWarehouseOutcomeRequest = (warehouseOutcomeRequest: IWarehouseOutcomeRequest) => {
    router.push(`/inventory/outcome-requests/${warehouseOutcomeRequest.id}?view-mode=Dispacher`);
}
onMounted(() => {
    loadOutcomes();
    loadJobsAndExpenses();
    const callbackId = AppEvents.on('inventory:reload', () => {
        loadOutcomes();
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

