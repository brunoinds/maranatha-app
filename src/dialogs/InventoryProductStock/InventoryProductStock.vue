<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cerrar</ion-button>
                </ion-buttons>
                <ion-title>Stock de Producto</ion-title>
                <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
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
                        {{ productWithStock.stock.in_stock_count == 0 ? 'Agotado' : productWithStock.stock.in_stock_count + ' unidades' }}
                    </ion-chip>
                </ion-item>
                <ion-item>
                    <ion-label>
                        Unidades compradas
                    </ion-label>
                    <ion-label slot="end" class="ion-text-right">
                        {{ productWithStock.stock.items.length }}
                    </ion-label>
                </ion-item>
                <ion-item>
                    <ion-label>
                        Unidades vendidas
                    </ion-label>
                    <ion-label slot="end" class="ion-text-right">
                        {{ productWithStock.stock.items.filter((item) => item.inventory_warehouse_outcome_id != null).length }}
                    </ion-label>
                </ion-item>
                <ion-item>
                    <ion-label>
                        Unidades en stock
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
                                <p><b>{{ income.totalPriceText }}</b> ({{ income.priceText }} c/u)</p>
                            </ion-label>
                            <ion-label slot="end" class="ion-text-right"  color="success">
                                <h2><b>+{{ income.count }} un.</b></h2>
                            </ion-label>
                            <ion-icon :icon="arrowUpCircleOutline" color="success" slot="end"></ion-icon>
                        </ion-item>

                        <ion-item v-for="outcome in income.outcomes" button @click="openOutcome(outcome.outcome_id)">
                            <ion-label>
                                <p><b>Salida #00{{ outcome.outcome_id }}</b></p>
                            </ion-label>
                            <ion-label slot="end" class="ion-text-right"  color="danger">
                                -{{ outcome.count }} un.
                            </ion-label>
                            <ion-icon :icon="arrowDownCircleOutline"  color="danger" slot="end"></ion-icon>
                        </ion-item>

                        <ion-item>
                            <ion-label>
                                Quedan
                            </ion-label>
                            <ion-label slot="end" class="ion-text-right" color="primary">
                                <h2><b>{{ income.remaining_count }} un.</b></h2>
                                <p>restantes en stock</p>
                            </ion-label>
                        </ion-item>
                    </ion-list>
                </article>
            </article>
            <article v-if="viewSegment == 'Ítems'">
                <ion-list>
                    <ion-list-header>Ítems</ion-list-header>
                    <ion-item v-for="(item,index) in productWithStock.stock.items" :key="item.id" button @click="showProductItem(item.id)">
                        <ion-label>
                            <h2><b>#{{ index + 1 }}</b></h2>
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
import { IonButton, IonButtons, IonContent, IonSegment, IonSegmentButton, IonHeader, IonChip, IonAvatar, IonSearchbar, IonListHeader, IonLabel, IonInput,IonIcon, IonSelect, IonSelectOption, IonItem, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar, alertController, toastController } from '@ionic/vue';
import { computed, onMounted, ref } from 'vue';
import { Dialog, DialogEventEmitter } from "../../utils/Dialog/Dialog";
import { arrowForwardCircleOutline, cubeOutline, storefrontOutline, checkmarkOutline, arrowUpCircleOutline, arrowDownCircleOutline } from 'ionicons/icons';
import { IWorker } from '@/interfaces/WorkerInterfaces';
import { IProduct, IProductWithWarehouseStock, IWarehouse } from '@/interfaces/InventoryInterfaces';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import InventoryProductsPackSelector from '@/dialogs/InventoryProductsPackSelector/InventoryProductsPackSelector.vue';
import EditInventoryWarehouseOutcome from '@/dialogs/EditInventoryWarehouseOutcome/EditInventoryWarehouseOutcome.vue';
import EditInventoryWarehouseIncome from '@/dialogs/EditInventoryWarehouseIncome/EditInventoryWarehouseIncome.vue';
import ProductItemStatusChip from '@/components/ProductItemStatusChip/ProductItemStatusChip.vue';
import EditInventoryProductItem from '@/dialogs/EditInventoryProductItem/EditInventoryProductItem.vue';

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
});


const productHistoryUI = computed(() => {
    //Group by props.productWithStock.stock.items['inventory_warehouse_income_id']:
    const groupedByIncome = props.productWithStock.stock.items.reduce((acc, item) => {
        if (!acc[item.inventory_warehouse_income_id]){
            acc[item.inventory_warehouse_income_id] = [];
        }
        acc[item.inventory_warehouse_income_id].push(item);
        return acc;
    }, {} as Record<number, Array<IProductWithWarehouseStock['stock']['items'][0]>>);

    const incomes = Object.entries(groupedByIncome).map(([key, value]) => {
        return {
            income_id: value[0].inventory_warehouse_income_id,
            items: value
        }
    }).map((income) => {
        return {
            income_id: income.income_id,
            count: income.items.length,
            price: income.items[0].buy_amount,
            currency: income.items[0].buy_currency,
            total_price: income.items.reduce((acc, item) => acc + item.buy_amount, 0),
            outcomes: (() => {
                const outcomeItems = income.items.filter((item) => item.inventory_warehouse_outcome_id != null).reduce((acc, item) => {
                    if (!acc[item.inventory_warehouse_outcome_id]){
                        acc[item.inventory_warehouse_outcome_id] = [];
                    }
                    acc[item.inventory_warehouse_outcome_id].push(item);
                    return acc;
                }, {});


                return Object.entries(outcomeItems).map(([key, value]) => {
                    return {
                        outcome_id: value[0].inventory_warehouse_outcome_id,
                        items: value
                    }
                }).map((outcome) => {
                    return {
                        outcome_id: outcome.outcome_id,
                        count: outcome.items.length,
                    }
                });
            })(),
            remaining_count: income.items.filter((item) => item.inventory_warehouse_outcome_id == null).length
        }
    });

    return incomes.map((income) => {
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

const showProductItem = (id: string) => {
    Dialog.show(EditInventoryProductItem, {
        props: {
            productItemId: id
        },
        onLoaded($this) {
            
        }
    })
}


onMounted(() => {
    
})


</script>

<style scoped lang="scss">
.offwhite{
    background-color: var(--ion-color-light-tint);
    padding-top: 10px;
    padding-bottom: 10px;
}
</style>