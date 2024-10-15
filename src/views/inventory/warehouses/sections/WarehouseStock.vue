<template>
    <section>
        <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>

        <article class="ion-padding">
            <ion-searchbar v-model="dynamicData.query" :animated="true" placeholder="Buscar Producto"></ion-searchbar>
        </article>

        <!-- <ion-list>
            <ion-item v-for="product in productsUI.list" button :key="product.id" @click="openProductStock(product)">
                <ion-avatar v-if="product.image" slot="start">
                    <ion-img :src="product.image"></ion-img>
                </ion-avatar>
                <ion-label>
                    <h2><b>{{ product.name }}</b></h2>
                    <p>{{ product.description }}</p>
                    <p>{{ product.brand }}</p>
                </ion-label>
                <ion-label slot="end">
                    <ion-chip :color="product.stock.in_stock_count > 0 ? 'success' : 'danger'">
                        <ion-label v-if="product.stock.in_stock_count > 0">{{ product.stock.in_stock_count }}</ion-label>
                        <ion-label v-else>Agotado</ion-label>
                    </ion-chip>
                </ion-label>
            </ion-item>
        </ion-list> -->

        <DynamicScroller
            :items="productsUI.list"
            :min-item-size="61.4"
            class="scroller"
            :buffer="15"
            v-if="Viewport.data.value.deviceSetting != 'DesktopLandscape'"
        >
            <template v-slot="{ item, index, active }">
                <DynamicScrollerItem
                    :item="item"
                    :active="active"
                    :data-index="index"
                    :min-height="77.9"
                >
                    <ion-item button :key="item.id" @click="openProductStock(item)">
                        <ion-avatar v-if="item.image" slot="start">
                            <ion-img :src="item.image"></ion-img>
                        </ion-avatar>
                        <ion-label>
                            <h2><b>{{ item.name }}</b></h2>
                            <p>{{ item.description }}</p>
                            <p>{{ item.brand }}</p>
                        </ion-label>
                        <ion-label slot="end">
                            <ion-chip :color="item.stock.in_stock_count > 0 ? 'success' : 'danger'">
                                <ion-label v-if="item.stock.in_stock_count > 0">{{ item.stock.in_stock_count }}</ion-label>
                                <ion-label v-else>Agotado</ion-label>
                            </ion-chip>
                        </ion-label>
                    </ion-item>
                </DynamicScrollerItem>
            </template>
        </DynamicScroller>



        <v-data-table
            :theme="currentDeviceTheme"
            :headers="productsUI.table.headers"
            :items="productsUI.table.body"
            :loading-text="'Cargando datos...'"
            :loading="isLoading"
            :search="dynamicData.query"
            v-if="Viewport.data.value.deviceSetting == 'DesktopLandscape'"
        >

            <template v-slot:item.image="{ item }">
                <ion-avatar v-if="item.image">
                    <ion-img :src="item.image"></ion-img>
                </ion-avatar>
                
            </template>
            <template v-slot:item.stock.in_stock_count="{ value, item }">
                <ion-chip :color="value > 0 ? 'success' : 'danger'" @click="openProductStock(productsUI.list.find((product) => product.id == item.id))">
                    <ion-label v-if="value > 0">{{ value }}</ion-label>
                    <ion-label v-else>Agotado</ion-label>
                </ion-chip>
            </template>

        </v-data-table>
    </section>

    <ion-fab slot="fixed" vertical="bottom" horizontal="end" :edge="false">
        <ion-fab-button @click="createWarehouseIncome">
            <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
    </ion-fab>
</template>


<script setup lang="ts">

import CreateInventoryWarehouseIncome from '@/dialogs/CreateInventoryWarehouseIncome/CreateInventoryWarehouseIncome.vue';
import InventoryProductStock from '@/dialogs/InventoryProductStock/InventoryProductStock.vue';
import { IProductWithWarehouseStock, IWarehouse } from '@/interfaces/InventoryInterfaces';
import { EMoneyType } from '@/interfaces/ReportInterfaces';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { Dialog } from '@/utils/Dialog/Dialog';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { Theme } from '@/utils/Theme/Theme';
import { Viewport } from '@/utils/Viewport/Viewport';
import { IonAvatar, IonChip, IonFab, IonFabButton, IonIcon, IonImg, IonItem, IonLabel, IonList, IonProgressBar, IonSearchbar } from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import { PropType, computed, onMounted, onUnmounted, ref } from 'vue';
import { DynamicScroller, DynamicScrollerItem, RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const isLoading = ref<boolean>(false);
const props = defineProps({
    warehouse: {
        type: Object as PropType<IWarehouse>,
        required: true
    }
});


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
                },
                {
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
            body: warehouseProductsStock.value.map((product) => {
                return {
                    ...product,
                    identification: product.id,
                }
            })
        },
        list: warehouseProductsStock.value
        .filter((product) => {
            if (Viewport.data.value.deviceSetting != 'DesktopLandscape'){
                return product.name.toLowerCase().includes(dynamicData.value.query.toLowerCase())
            }else{
                return true;
            }
        })
        .toSorted((a, b) => {
            return a.name.localeCompare(b.name);
        })
        .map((product) => {
                return {
                    ...product,
                    identification: product.id,
                }
        })
    }
})



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

const openProductStock = (productWithStock: IProductWithWarehouseStock) => {
    Dialog.show(InventoryProductStock, {
        props: {
            productWithStock,
            warehouseId: props.warehouse.id
        },
        onLoaded($this) {
            
        },
        modalControllerOptions: {
            //presentingElement: props.page,
            //showBackdrop: true,
        }
    })
}


const loadWarehouseStock = async () => {
    isLoading.value = true;
    const response = (await RequestAPI.get(`/inventory/warehouses/${props.warehouse.id}/stock`)).items;
    warehouseProductsStock.value = response.filter((item: any) => item.stock.all_count > 0);
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
ion-fab[slot="fixed"]{
    position: fixed;
}


.scroller {
    height: calc(100vh - 350px);
}
</style>