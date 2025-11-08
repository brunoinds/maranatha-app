<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button :defaultHref="'/inventory/warehouses/' + warehouseId"></ion-back-button>
                </ion-buttons>
                <ion-title>Stock de Almacén</ion-title>
                <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-fab slot="fixed" vertical="bottom" horizontal="end" :edge="false">
                <ion-fab-button @click="createWarehouseIncome">
                    <ion-icon :icon="addOutline"></ion-icon>
                </ion-fab-button>
            </ion-fab>


            <article class="ion-padding">
                <ion-searchbar v-model="dynamicData.query" :animated="true" placeholder="Buscar Producto"></ion-searchbar>
            </article>


            <v-data-table
                :theme="currentDeviceTheme"
                :headers="productsUI.table.headers"
                :items="productsUI.table.body"
                :loading-text="'Cargando datos...'"
                :loading="isLoading"
                :search="dynamicData.query"
            >

                <template v-slot:item.image="{ item }">
                    <ion-avatar v-if="item.image">
                        <ion-img :src="item.image"></ion-img>
                    </ion-avatar>
                    
                </template>
                <template v-slot:item.stock.in_stock_count="{ value }">
                    <ion-chip :color="value > 0 ? 'success' : 'danger'">
                        <ion-label v-if="value > 0">{{ value }}</ion-label>
                        <ion-label v-else>Agotado</ion-label>
                    </ion-chip>
                </template>

                <template v-slot:item.identification="{ value }">
                    <ion-button size="small">
                        <ion-icon :icon="pencilOutline"></ion-icon>
                    </ion-button>
                </template>
            </v-data-table>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import CreateInventoryWarehouseIncome from '@/dialogs/CreateInventoryWarehouseIncome/CreateInventoryWarehouseIncome.vue';
import { IProductWithWarehouseStock } from '@/interfaces/InventoryInterfaces';
import { EMoneyType } from '@/interfaces/ReportInterfaces';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { Dialog } from '@/utils/Dialog/Dialog';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { Theme } from '@/utils/Theme/Theme';
import { IonBackButton, IonButton, IonButtons, IonChip, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonImg, IonLabel, IonPage, IonProgressBar, IonSearchbar, IonTitle, IonToolbar } from '@ionic/vue';
import { addOutline, pencilOutline } from 'ionicons/icons';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';



const route = useRoute();
const page = ref<HTMLElement|null>(null);
const isLoading = ref<boolean>(false);
const warehouseId = route.params.warehouseId as string;

const dynamicData = ref({
    query: '',
})
const warehouseProductsStock = ref<IProductWithWarehouseStock[]>([]);

const productsUI = computed(() => {
    return {
        table: {
            headers: [
                {
                    key: 'id',
                    title: 'ID'
                },{
                    key: 'identification',
                    title: 'Editar'
                },{
                    key: 'image',
                    title: 'Imagen'
                },
                {
                    key: 'name',
                    title: 'Nombre'
                },
                {
                    key: 'category',
                    title: 'Categoría'
                },
                {
                    key: 'brand',
                    title: 'Marca'
                },
                {
                    key: 'stock.in_stock_count',
                    title: 'Stock'
                },
                {
                    title: 'Precio de Compra',
                    align: 'center',
                    children: Object.keys(EMoneyType).map((moneyType) => {
                        return {
                            title: moneyType,
                            value: `stock.average_buy_price.${moneyType}`
                        }
                    })
                },
                {
                    title: 'Precio de Venta',
                    align: 'center',
                    children: Object.keys(EMoneyType).map((moneyType) => {
                        return {
                            title: moneyType,
                            value: `stock.average_buy_price.${moneyType}`
                        }
                    }),
                }
            ],
            body: warehouseProductsStock.value
            .map((product) => {
                return {
                    ...product,
                    identification: product.id,
                }
            })
        }
    }
})


const createWarehouseIncome = () => {
    Dialog.show(CreateInventoryWarehouseIncome, {
        props: {
            warehouseId: warehouseId
        },
        onLoaded($this) {
            $this.on('created', (event:any) => {
                AppEvents.emit('inventory:reload');
            })
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        }
    })
}


const loadWarehouseStock = async () => {
    isLoading.value = true;
    const response = (await RequestAPI.get(`/inventory/warehouses/${warehouseId}/stock`)).items;
    warehouseProductsStock.value = response;
    isLoading.value = false;
}

const currentDeviceTheme = computed(() => {
    return Theme.getTheme();
});
onMounted(() => {
    loadWarehouseStock();
    const callbackId = AppEvents.on('inventory:reload', () => {
        loadWarehouseStock();
    })
    onUnmounted(() => {
        AppEvents.off('inventory:reload', callbackId);
    })
});
</script>

<style scoped lang="scss">
</style>