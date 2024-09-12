<template>
    <section class="content">
        <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>

        <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
            <ion-item v-for="outcome in outcomesUI" button @click="openWarehouseOutcome(outcome.original)">
                <ion-label>
                    <h2><b>#00{{ outcome.id }}</b></h2>
                    <h3>{{ outcome.date }}</h3>
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


    <ion-fab slot="fixed" vertical="bottom" horizontal="end" :edge="false">
        <ion-fab-button @click="createWarehouseOutcome">
            <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
    </ion-fab>
</template>


<script setup lang="ts">

import { IonList, IonItem, IonLabel, IonFab, IonFabButton, IonIcon, IonProgressBar } from '@ionic/vue';
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

const isLoading = ref<boolean>(false);
const props = defineProps({
    warehouse: {
        type: Object as PropType<IWarehouse>,
        required: true
    }
});

const outcomesData = ref<IWarehouseOutcome[]>([]);

const outcomesUI = computed(() => {
    return outcomesData.value.map((outcome) => {
        return {
            ...outcome,
            date: new Date(outcome.date).toLocaleDateString(),
            amount: outcome.amount.map((amount) => {
                return Toolbox.moneyFormat(amount.amount, amount.currency)
            }),
            items_count: outcome.items_count,
            original: outcome
        }
    }).sort((a, b) => b.id - a.id);
});

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
onMounted(() => {
    loadOutcomes();
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

