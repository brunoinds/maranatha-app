<template>
    <section class="content">
        <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>


        <DynamicScroller
            :items="loansUI"
            :min-item-size="70"
            class="scroller"
            :buffer="15"
        >
            <template v-slot="{ item, index, active }">
                <DynamicScrollerItem
                    :item="item"
                    :active="active"
                    :data-index="index"
                >
                    <ion-item button @click="openWarehouseLoan(item.original)">
                        <ion-avatar slot="start" v-if="item.product_item?.product.image">
                            <img :src="item.product_item.product.image" />
                        </ion-avatar>
                        <ion-label>
                            <h2><b>#00{{ item.id }}</b></h2>
                            <h2><b>{{ item.product_item?.product.name }}</b></h2>
                            <h3>{{ item.date }} - {{ item.loaned_to?.name }}</h3>
                            <p>{{ item.product_item?.product.description }}</p>
                            <p>{{ item.product_item?.product.brand }}</p>
                        </ion-label>
                        <ProductItemLoanStatusChip :request="item" slot="end" />
                    </ion-item>
                </DynamicScrollerItem>
            </template>
        </DynamicScroller>
    </section>


    <ion-fab slot="fixed" vertical="bottom" horizontal="end" :edge="false" v-if="false">
        <ion-fab-button @click="createWarehouseLoan">
            <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
    </ion-fab>
</template>


<script setup lang="ts">

import { IonList, IonItem, IonLabel, IonFab, IonAvatar, IonFabButton, IonIcon, IonProgressBar } from '@ionic/vue';
import { PropType, computed, onMounted, onUnmounted, ref } from 'vue';
import { IWarehouse, IWarehouseProductItemLoan } from '@/interfaces/InventoryInterfaces';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import { addOutline } from 'ionicons/icons';
import { Dialog } from '@/utils/Dialog/Dialog';
import CreateInventoryWarehouseOutcome from '@/dialogs/CreateInventoryWarehouseOutcome/CreateInventoryWarehouseOutcome.vue';
import EditInventoryWarehouseOutcome from '@/dialogs/EditInventoryWarehouseOutcome/EditInventoryWarehouseOutcome.vue';
import { Viewport } from '@/utils/Viewport/Viewport';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import CreateInventoryWarehouseLoan from '@/dialogs/CreateInventoryWarehouseLoan/CreateInventoryWarehouseLoan.vue';
import ProductItemLoanStatusChip from '@/components/ProductItemLoanStatusChip/ProductItemLoanStatusChip.vue';
import EditInventoryWarehouseLoan from '@/dialogs/EditInventoryWarehouseLoan/EditInventoryWarehouseLoan.vue';
import { DynamicScroller, DynamicScrollerItem, RecycleScroller } from 'vue-virtual-scroller'

const isLoading = ref<boolean>(false);
const props = defineProps({
    warehouse: {
        type: Object as PropType<IWarehouse>,
        required: true
    }
});

const loansData = ref<IWarehouseProductItemLoan[]>([]);

const loansUI = computed(() => {
    return loansData.value.map((loan) => {
        return {
            ...loan,
            date: new Date(loan.loaned_at || '').toLocaleDateString(),
            original: loan
        }
    }).sort((a, b) => b.id - a.id);
});

const loadLoans = async () => {
    isLoading.value = true;
    const response = await RequestAPI.get(`/inventory/warehouses/${props.warehouse.id}/loans`);
    loansData.value = response;
    isLoading.value = false;
}


const createWarehouseLoan = () => {
    Dialog.show(CreateInventoryWarehouseLoan, {
        props: {
            warehouseId: props.warehouse.id
        },
        onLoaded($this) {
            $this.on('created', (event:any) => {
                loadLoans()
            })
        },
        modalControllerOptions: {
            //presentingElement: props.page,
            //showBackdrop: true,
        }
    })
}
const openWarehouseLoan = (loan: IWarehouseProductItemLoan) => {
    Dialog.show(EditInventoryWarehouseLoan, {
        props: {
            productItemLoanId: loan.id,
        },
        onLoaded($this) {
            
        },
        modalControllerOptions: {
  
        }
    })
}
onMounted(() => {
    loadLoans();
    const callbackId = AppEvents.on('inventory:reload', () => {
        loadLoans()
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

.scroller {
    height: calc(92vh - 198px);
}
</style>

