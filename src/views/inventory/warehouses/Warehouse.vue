<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-title>Almacén</ion-title>
                <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-fab slot="fixed" vertical="bottom" horizontal="end" :edge="false">
                <ion-fab-button @click="createWarehouseIncome">
                    <ion-icon :icon="addOutline"></ion-icon>
                </ion-fab-button>
            </ion-fab>



        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonCheckbox, IonSegment, IonSelect, IonSelectOption, IonButton, IonSegmentButton, IonContent, IonAccordion, IonAccordionGroup, IonProgressBar, IonImg, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController } from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { IWarehouse, IWarehouseIncome } from '@/interfaces/InventoryInterfaces';
import { Dialog } from '@/utils/Dialog/Dialog';
import CreateWarehouse from '@/dialogs/CreateWarehouse/CreateWarehouse.vue';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { useRoute } from 'vue-router';
import CreateInventoryWarehouseIncome from '@/dialogs/CreateInventoryWarehouseIncome/CreateInventoryWarehouseIncome.vue';



const route = useRoute();
const page = ref<HTMLElement|null>(null);
const isLoading = ref<boolean>(false);
const warehouseId = route.params.id as string;

const warehouseData = ref<IWarehouse|null>(null);

const warehouseIncomes = ref<Array<IWarehouseIncome>>([]);

const createWarehouseIncome = () => {
    Dialog.show(CreateInventoryWarehouseIncome, {
        props: {
            warehouseId: warehouseId
        },
        onLoaded($this) {
            $this.on('created', (event:any) => {
                loadWarehouse()
            })
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        }
    })
}


const loadWarehouse = async () => {
    isLoading.value = true;
    const response = await RequestAPI.get('/inventory/warehouses/' + warehouseId);

    warehouseData.value = response;

    isLoading.value = false;
}

const loadWarehouseIncomes = async () => {
    isLoading.value = true;
    const response = await RequestAPI.get('/inventory/warehouses-incomes/' + warehouseId );

    warehouseIncomes.value = response;

    isLoading.value = false;
}

onMounted(() => {
    loadWarehouse();

    const callbackId = AppEvents.on('inventory:reload', () => {
        loadWarehouse();
    })
    onUnmounted(() => {
        AppEvents.off('inventory:reload', callbackId);
    })
});
</script>

<style scoped lang="scss">
</style>