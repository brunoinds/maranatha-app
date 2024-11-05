<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cerrar</ion-button>
                </ion-buttons>
                <ion-title>Stock de Producto</ion-title>
            </ion-toolbar>
            <ion-toolbar>
                <ion-segment v-model="viewSegment">
                    <ion-segment-button value="General">
                        📖 General
                    </ion-segment-button>
                    <ion-segment-button value="Ítems">
                        📋 Ítems
                    </ion-segment-button>
                </ion-segment>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <article v-if="viewSegment == 'General'">
                <ion-item>
                    <ion-avatar slot="start" v-if="productWithStock.image">
                        <img :src="productWithStock.image" />
                    </ion-avatar>
                    <ion-label>
                        <h2><b>{{ productWithStock.name }}</b></h2>
                        <p>{{ productWithStock.description }}</p>
                        <p>{{ productWithStock.brand }}</p>
                    </ion-label>
                    <ion-chip v-if="productWithStock.stock" :color="productWithStock.stock.in_stock_count == 0 ? 'danger' : 'success'" slot="end">
                        {{ productWithStock.stock.in_stock_count == 0 ? 'Agotado' : productWithStock.stock.in_stock_count + ' ' + Toolbox.inventoryProductUnitName(productWithStock.unit).toLowerCase()}}
                    </ion-chip>
                </ion-item>
                <ion-item>
                    <ion-label>
                        {{Toolbox.inventoryProductUnitName(productWithStock.unit)}} compradas
                    </ion-label>
                    <ion-label slot="end" class="ion-text-right">
                        {{ productWithStock.stock.all_count }}
                    </ion-label>
                </ion-item>
                <ion-item>
                    <ion-label>
                        {{Toolbox.inventoryProductUnitName(productWithStock.unit)}} vendidas
                    </ion-label>
                    <ion-label slot="end" class="ion-text-right">
                        {{ productWithStock.stock.sold_count }}
                    </ion-label>
                </ion-item>
                <ion-item>
                    <ion-label>
                        {{Toolbox.inventoryProductUnitName(productWithStock.unit)}} en stock
                    </ion-label>
                    <ion-label slot="end" class="ion-text-right">
                        {{ productWithStock.stock.in_stock_count }}
                    </ion-label>
                </ion-item>
                <ion-item v-for="(value, key) in productWithStock.stock.average_buy_price" :key="key">
                    <ion-label>
                        <p>Precio promedio en {{ key }}</p>
                    </ion-label>
                    <ion-label slot="end" class="ion-text-right">
                        <p>~{{ Toolbox.moneyFormat(value as any, key) }}</p>
                    </ion-label>
                </ion-item>

                <br>
                <ion-list-header>Historial de movimientos</ion-list-header>
                <br>
                <article class="offwhite">
                    <ion-list v-for="income in productHistoryUI" :inset="true">
                        <ion-item @click="openIncome(income.income_id)" button>
                            <ion-label>
                                <h2><b>Ingreso #00{{ income.income_id }}</b></h2>
                                <p><b>{{ income.totalPriceText }}</b> ({{ income.priceText }} c/ {{ Toolbox.inventoryProductUnitName(productWithStock.unit).toLowerCase().substring(0,2) }}.)</p>
                            </ion-label>
                            <ion-label slot="end" class="ion-text-right"  color="success">
                                <h2><b>+{{ income.count }} {{ Toolbox.inventoryProductUnitName(productWithStock.unit).toLowerCase().substring(0,2) }}.</b></h2>
                            </ion-label>
                            <ion-icon :icon="arrowUpCircleOutline" color="success" slot="end"></ion-icon>
                        </ion-item>

                        <ion-item v-for="outcome in income.outcomes" button @click="openOutcome(outcome.outcome_id)">
                            <ion-label>
                                <p><b>Salida #00{{ outcome.outcome_id }}</b></p>
                            </ion-label>
                            <ion-label slot="end" class="ion-text-right"  color="danger">
                                -{{ outcome.count }} {{ Toolbox.inventoryProductUnitName(productWithStock.unit).toLowerCase().substring(0,2) }}.
                            </ion-label>
                            <ion-icon :icon="arrowDownCircleOutline"  color="danger" slot="end"></ion-icon>
                        </ion-item>

                        <ion-item>
                            <ion-label>
                                Quedan
                            </ion-label>
                            <ion-label slot="end" class="ion-text-right" color="primary">
                                <h2><b>{{ income.remaining_count }} {{ Toolbox.inventoryProductUnitName(productWithStock.unit).toLowerCase().substring(0,2) }}.</b></h2>
                                <p>restantes en stock</p>
                            </ion-label>
                        </ion-item>
                    </ion-list>
                </article>
            </article>
            <article v-if="viewSegment == 'Ítems'">
                <ion-list>
                    <ion-list-header>Ítems</ion-list-header>

                    <ion-item>
                        <ion-select label="Página:" v-model="paginatedInfo.page" label-placement="stacked" @ion-change="onChangePage" interface="action-sheet">
                            <ion-select-option v-for="page in pagesUI" :value="page">{{ page }}</ion-select-option>
                        </ion-select>
                    </ion-item>

                    <br>
                    

                    <ion-item v-for="(item) in paginatedItemsUI" :key="item.id" button :disabled="getUnitNature(productWithStock.unit) == 'Float'" @click="showProductItem(item.id)">
                        <ion-label>
                            <h2><b>#{{ item.index }}</b></h2>
                            <p v-if="item.batch">S/N: {{ item.batch }}</p>
                        </ion-label>
                        <ProductItemStatusChip slot="end" :request="item" />
                    </ion-item>
                </ion-list>
            </article>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { IonButton, IonButtons, IonContent, IonSegment, IonInfiniteScroll, IonInfiniteScrollContent, IonSegmentButton, IonHeader, IonChip, IonAvatar, IonSearchbar, IonListHeader, IonLabel, IonInput,IonIcon, IonSelect, IonSelectOption, IonItem, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar, alertController, toastController, InfiniteScrollCustomEvent } from '@ionic/vue';
import { computed, onMounted, ref } from 'vue';
import { Dialog, DialogEventEmitter } from "../../utils/Dialog/Dialog";
import { arrowForwardCircleOutline, cubeOutline, storefrontOutline, checkmarkOutline, arrowUpCircleOutline, arrowDownCircleOutline } from 'ionicons/icons';
import { IWorker } from '@/interfaces/WorkerInterfaces';
import { getUnitNature, IInventoryProductItem, IProduct, IProductWithWarehouseStock, IWarehouse } from '@/interfaces/InventoryInterfaces';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import InventoryProductsPackSelector from '@/dialogs/InventoryProductsPackSelector/InventoryProductsPackSelector.vue';
import EditInventoryWarehouseOutcome from '@/dialogs/EditInventoryWarehouseOutcome/EditInventoryWarehouseOutcome.vue';
import EditInventoryWarehouseIncome from '@/dialogs/EditInventoryWarehouseIncome/EditInventoryWarehouseIncome.vue';
import ProductItemStatusChip from '@/components/ProductItemStatusChip/ProductItemStatusChip.vue';
import EditInventoryProductItem from '@/dialogs/EditInventoryProductItem/EditInventoryProductItem.vue';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'



const isLoading = ref(false);
const viewSegment = ref('General');
const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
    productWithStock: {
        type: Object as () => IProductWithWarehouseStock,
        required: true,
    },
    warehouseId: {
        type: Number,
        required: true
    }
});

const paginatedItems = ref<Array<IInventoryProductItem>>([]);
const paginatedInfo = ref({
    page: 1,
    totalPages: 1
})
const movimentsData = ref<any>([]);

const pagesUI = computed(() => {
    return Array.from({ length: paginatedInfo.value.totalPages }, (_, i) => i + 1);
})

const paginatedItemsUI = computed(() => {
    return paginatedItems.value.map((item, index) => {
        return {
            ...item,
            index: (index + 1) + ((paginatedInfo.value.page - 1) * 100)
        }
    })
})

const productHistoryUI = computed(() => {
    return movimentsData.value.map((income) => {
        return {
            ...income,
            priceText: Toolbox.moneyFormat(income.price, income.currency),
            totalPriceText: Toolbox.moneyFormat(income.total_price, income.currency),
        }
    })
})

const openOutcome = async (outcomeId: number) => {
    isLoading.value = true;
    const outcomeRequest = await RequestAPI.get('/inventory/warehouse-outcomes/' + outcomeId);

    Dialog.show(EditInventoryWarehouseOutcome, {
        props: {
            warehouseOutcome: outcomeRequest,
            isReadonly: true
        },
        onLoaded($this) {
            
        },
        modalControllerOptions: {
        }
    })

    isLoading.value = false;
}

const openIncome = async (incomeId: number) => {
    isLoading.value = true;
    const incomeRequest = await RequestAPI.get('/inventory/warehouse-incomes/' + incomeId);

    Dialog.show(EditInventoryWarehouseIncome, {
        props: {
            warehouseIncome: incomeRequest,
            isReadonly: true
        },
        onLoaded($this) {
            
        },
        modalControllerOptions: {
        }
    })

    isLoading.value = false;
}

const showProductItem = (id: number) => {
    Dialog.show(EditInventoryProductItem, {
        props: {
            productItemId: id
        },
        onLoaded($this) {
            
        }
    })
}

const onChangePage = () => {
    fetchPaginatedProductItems(paginatedInfo.value.page);
}

const fetchPaginatedProductItems = async (page: number = 1) => {
    isLoading.value = true;
    const itemsRequest = await RequestAPI.get(`/inventory/warehouses/${props.warehouseId}/products/${props.productWithStock.id}/items?page=${page}`);
    paginatedItems.value = itemsRequest.items;
    paginatedInfo.value.page = page;
    paginatedInfo.value.totalPages = itemsRequest.pages;
    movimentsData.value = itemsRequest.movements_history;
    isLoading.value = false;
}

onMounted(() => {
    fetchPaginatedProductItems(1)
})


</script>

<style scoped lang="scss">
.offwhite{
    background-color: var(--ion-color-light-tint);
    padding-top: 10px;
    padding-bottom: 10px;
}

.scroller {
    height: 300px;
}
</style>