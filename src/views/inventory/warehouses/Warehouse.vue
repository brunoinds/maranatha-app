<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button :defaultHref="'/inventory'"></ion-back-button>
                </ion-buttons>
                <ion-title>Almacén</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="editWarehouse" v-if="showEditWarehouse">
                        <ion-icon :icon="ellipsisHorizontal"></ion-icon>
                    </ion-button>
                </ion-buttons>
                <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <article class="viewport" v-if="!isLoading">
                <aside v-if="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                    <br>
                    <article style="text-align: center;">
                        <br>
                        <ion-icon :icon="storefrontOutline" style="font-size: 94px;" color="primary"></ion-icon>
                        <h1><b>{{ warehouseData?.name }}</b></h1>

                        <ion-label>
                            <h3><b>{{ warehouseData?.zone }}</b></h3>
                            <p><b>{{ warehouseData?.country }}</b></p>
                        </ion-label>
                    </article>                    
                    <article>
                        <ion-list :inset="true">
                            <ion-item v-for="segment in segments" :key="segment.id" button :color="segmentValue == segment.id ? 'primary' : undefined" @click="segmentValue = segment.id">
                                <span slot="start">{{ segment.icon }}</span>
                                <ion-label>{{ segment.name }}</ion-label>
                            </ion-item>
                        </ion-list>
                    </article>
                </aside>
                <main>
                    <ion-list v-if="Viewport.data.value.deviceSetting != 'DesktopLandscape'">
                        <ion-item style="border-bottom: 1px solid var(--ion-color-light-shade);" :lines="'none'" color="light">
                            <ion-icon :icon="storefrontOutline" style="font-size: 34px;" slot="start" color="primary"></ion-icon>
                            <ion-label>
                                <h2><b>{{ warehouseData?.name }}</b></h2>
                                <h3><b>{{ warehouseData?.zone }}</b></h3>
                                <p><b>{{ warehouseData?.country }}</b></p>
                            </ion-label>
                        </ion-item>
                    </ion-list>

                    <header style="border-bottom: 1px solid var(--ion-color-light-shade);" v-if="Viewport.data.value.deviceSetting != 'DesktopLandscape'">
                        <ion-segment :scrollable="true" :value="segmentValue" v-model="segmentValue" mode="md">
                            <ion-segment-button v-for="segment in segments" :value="segment.id" :key="segment.id">
                                <ion-label>{{ segment.title }}</ion-label>
                            </ion-segment-button>
                        </ion-segment>
                    </header>

                    <article>
                        <br>
                        <ion-list-header style="font-size: 30px;">{{currentSegment?.title}}</ion-list-header>
                    </article>

                    <main>
                        <WarehouseIncomes v-if="segmentValue == 'incomes' && warehouseData" :warehouse="warehouseData"/>
                        <WarehouseOutcomes v-if="segmentValue == 'outcomes' && warehouseData" :warehouse="warehouseData"/>
                        <WarehouseStock v-if="segmentValue == 'stock' && warehouseData" :warehouse="warehouseData"/>
                        <WarehouseOutcomeRequests v-if="segmentValue == 'requests' && warehouseData" :warehouse="warehouseData"/>
                        <WarehouseProductItemLoans v-if="segmentValue == 'loans' && warehouseData" :warehouse="warehouseData"/>

                        <Records v-if="segmentValue == 'informs' && warehouseData" location="InventoryManagement" :preFilling="{
                            warehouse_ids: [warehouseData.id]
                        }"></Records>
                    </main>
                </main>
            </article>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle,IonButtons, IonBackButton, IonCheckbox, IonSegment, IonSelect, IonSelectOption, IonButton, IonSegmentButton, IonContent, IonAccordion, IonAccordionGroup, IonProgressBar, IonImg, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController } from '@ionic/vue';
import { addOutline, storefrontOutline, ellipsisHorizontal, storefront } from 'ionicons/icons';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { IWarehouse, IWarehouseIncome } from '@/interfaces/InventoryInterfaces';
import { Dialog } from '@/utils/Dialog/Dialog';
import CreateWarehouse from '@/dialogs/CreateWarehouse/CreateWarehouse.vue';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { useRoute, useRouter } from 'vue-router';
import CreateInventoryWarehouseIncome from '@/dialogs/CreateInventoryWarehouseIncome/CreateInventoryWarehouseIncome.vue';
import CreateInventoryWarehouseOutcome from '@/dialogs/CreateInventoryWarehouseOutcome/CreateInventoryWarehouseOutcome.vue';
import CreateInventoryWarehouseOutcomeRequest from '@/dialogs/CreateInventoryWarehouseOutcomeRequest/CreateInventoryWarehouseOutcomeRequest.vue';
import { Viewport } from '@/utils/Viewport/Viewport';
import WarehouseIncomes from '@/views/inventory/warehouses/sections/WarehouseIncomes.vue';
import WarehouseOutcomes from '@/views/inventory/warehouses/sections/WarehouseOutcomes.vue';
import WarehouseStock from '@/views/inventory/warehouses/sections/WarehouseStock.vue';
import WarehouseOutcomeRequests from '@/views/inventory/warehouses/sections/WarehouseOutcomeRequests.vue';
import EditWarehouse from '@/dialogs/EditWarehouse/EditWarehouse.vue';
import Records from '@/views/management/records/Records.vue';
import { Session } from '@/utils/Session/Session';
import WarehouseProductItemLoans from '@/views/inventory/warehouses/sections/WarehouseProductItemLoans.vue';


const route = useRoute();
const router = useRouter();
const page = ref<HTMLElement|null>(null);
const isLoading = ref<boolean>(false);
const segmentValue = ref<string>('requests');
const warehouseId = route.params.id as string;

const warehouseData = ref<IWarehouse|null>(null);

const showEditWarehouse = ref(Session.getCurrentSessionSync()?.roles().includes("admin"));


const segments = [
    {
        id: 'requests',
        title: '📋 Pedidos',
        name: 'Pedidos',
        icon: '📋'
    },
    {
        id: 'stock',
        title: '📦 Stock',
        name: 'Stock',
        icon: '📦'
    },
    {
        id: 'incomes',
        title: '📥 Ingresos',
        name: 'Ingresos',
        icon: '📥'
    },
    {
        id: 'outcomes',
        title: '📤 Salidas',
        name: 'Salidas',
        icon: '📤'
    },
    {
        id: 'loans',
        title: '🤝 Préstamos',
        name: 'Préstamos',
        icon: '🤝'
    },
    {
        id: 'informs',
        title: '🧾 Plantillas',
        name: 'Plantillas',
        icon: '🧾'
    }
];

const currentSegment = computed(() => {
    return segments.find((s) => {return s.id == segmentValue.value});
})
const warehouseIncomes = ref<Array<IWarehouseIncome>>([]);

const loadWarehouse = async () => {
    isLoading.value = true;
    const response = await RequestAPI.get('/inventory/warehouses/' + warehouseId);

    warehouseData.value = response;

    isLoading.value = false;
}

const editWarehouse = () => {
    Dialog.show(EditWarehouse, {
        props: {
            warehouse: warehouseData.value
        },
        onLoaded($this) {
            $this.on('deleted', (event:any) => {
                router.replace('/inventory');
            })
            $this.on('updated', (event:any) => {
                loadWarehouse();
            })
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        }
    })
}

const loadWarehouseIncomes = async () => {
    isLoading.value = true;
    const response = await RequestAPI.get(`/inventory/warehouses/${warehouseId}/incomes`);
    warehouseIncomes.value = response;
}

onMounted(() => {
    loadWarehouse();
    loadWarehouseIncomes();
    const callbackId = AppEvents.on('inventory:reload', () => {
        loadWarehouse();
        loadWarehouseIncomes();
    })
    onUnmounted(() => {
        AppEvents.off('inventory:reload', callbackId);
    })
});
</script>

<styles lang="scss" scoped>
.viewport {
    display: flex;
    flex-direction: row;
    height: 100%;
    > aside {
        width: 300px;
        height: 100%;
        border-right: 1px solid var(--ion-color-light-shade);
        background-color: var(--ion-color-light);
    }
    > main {
        flex: 1;
        height: 100%;
        overflow-y: auto;
        > article {
            padding: 10px;
        }
    }
}
</styles>