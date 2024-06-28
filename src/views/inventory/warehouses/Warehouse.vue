<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-title>Almacén</ion-title>
                <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            
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
import { useRoute } from 'vue-router';



const route = useRoute();
const page = ref<HTMLElement|null>(null);
const isLoading = ref<boolean>(false);
const warehouseId = route.params.id as string;

const warehouseData = ref<IWarehouse|null>(null);





const loadWarehouse = async () => {
    isLoading.value = true;
    const response = await RequestAPI.get('/inventory/warehouses/' + warehouseId);

    warehouseData.value = response;

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