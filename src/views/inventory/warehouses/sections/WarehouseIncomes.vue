<template>
    <section class="content">
        <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>

        <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
            <ion-item v-for="income in incomesUI" button @click="openWarehouseIncome(income.original)">
                <ion-label>
                    <h2><b>#00{{ income.id }}</b></h2>
                    <h3>{{ income.date }}</h3>
                    <p>{{ income.items_count }} productos</p>
                </ion-label>
                <ion-label slot="end" color="primary">
                    <h2><b>{{ income.amount }}</b></h2>
                </ion-label>
            </ion-item>
        </ion-list>
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

import { IonList, IonItem, IonLabel, IonFab, IonFabButton, IonIcon, IonProgressBar } from '@ionic/vue';
import { PropType, computed, onMounted, onUnmounted, ref } from 'vue';
import { IWarehouse, IWarehouseIncome } from '@/interfaces/InventoryInterfaces';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import { Dialog } from '@/utils/Dialog/Dialog';
import CreateInventoryWarehouseIncome from '@/dialogs/CreateInventoryWarehouseIncome/CreateInventoryWarehouseIncome.vue';
import { addOutline, downloadOutline } from 'ionicons/icons';
import EditInventoryWarehouseIncome from '@/dialogs/EditInventoryWarehouseIncome/EditInventoryWarehouseIncome.vue';
import { DateTime } from 'luxon';
import { Viewport } from '@/utils/Viewport/Viewport';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import ImportInventoryWarehouseIncome from '@/dialogs/ImportInventoryWarehouseIncome/ImportInventoryWarehouseIncome.vue';

const isLoading = ref<boolean>(false);
const props = defineProps({
    warehouse: {
        type: Object as PropType<IWarehouse>,
        required: true
    }
});

const incomesData = ref<IWarehouseIncome[]>([]);

const incomesUI = computed(() => {
    return incomesData.value.map((income) => {
        return {
            ...income,
            date: DateTime.fromJSDate(new Date(income.date)).toFormat("dd/MM/yyyy").toString(),
            amount: Toolbox.moneyFormat(income.amount, income.currency),
            items_count: income.items_count,
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

onMounted(() => {
    loadIncomes();
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

