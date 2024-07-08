<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-title>Almacenes</ion-title>
                <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-fab slot="fixed" vertical="bottom" horizontal="end" :edge="false">
                <ion-fab-button @click="createNewWarehouse">
                    <ion-icon :icon="addOutline"></ion-icon>
                </ion-fab-button>
            </ion-fab>

            <section>
                <ion-list>
                    <ion-item button v-for="warehouse in warehousesData" :key="warehouse.id" @click="openWarehouse(warehouse.id)">
                        <ion-label>
                            <h2>{{ warehouse.name }}</h2>
                            <p>{{ warehouse.zone }}</p>
                            <p>{{ warehouse.country }}</p>
                        </ion-label>
                    </ion-item>
                </ion-list>
            </section>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonCheckbox, IonSegment, IonSelect, IonSelectOption, IonButton, IonSegmentButton, IonContent, IonAccordion, IonAccordionGroup, IonProgressBar, IonImg, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController } from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { IWarehouse } from '@/interfaces/InventoryInterfaces';
import { Dialog } from '@/utils/Dialog/Dialog';
import CreateWarehouse from '@/dialogs/CreateWarehouse/CreateWarehouse.vue';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { useRouter } from 'vue-router';

const router = useRouter();
const page = ref<HTMLElement|null>(null);
const isLoading = ref<boolean>(false);
const warehousesData = ref<IWarehouse[]>([]);

const createNewWarehouse = () => {
    Dialog.show(CreateWarehouse, {
        onLoaded($this) {
            $this.on('created', (event:any) => {
                loadWarehouses();
                AppEvents.emit('inventory:reload');
            })
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        }
    })
}



const loadWarehouses = async () => {
    isLoading.value = true;
    const response = await RequestAPI.get('/inventory/warehouses');

    warehousesData.value = response;

    isLoading.value = false;
}

const openWarehouse = (id: number) => {
    router.push(`/inventory/warehouses/${id}`);
}


onMounted(() => {
    loadWarehouses();

    const callbackId = AppEvents.on('inventory:reload', () => {
        loadWarehouses();
    })
    onUnmounted(() => {
        AppEvents.off('all:reload', callbackId);
    })
});
</script>

<style scoped lang="scss">
</style>