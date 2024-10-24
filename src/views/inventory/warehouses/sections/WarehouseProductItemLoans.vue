<template>
    <section class="content">
        <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>

        <article class="ion-padding">
            <ion-searchbar v-model="dynamicData.query" :animated="true" placeholder="Buscar Producto"></ion-searchbar>
        </article>

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

import ProductItemLoanStatusChip from '@/components/ProductItemLoanStatusChip/ProductItemLoanStatusChip.vue';
import CreateInventoryWarehouseLoan from '@/dialogs/CreateInventoryWarehouseLoan/CreateInventoryWarehouseLoan.vue';
import EditInventoryWarehouseLoan from '@/dialogs/EditInventoryWarehouseLoan/EditInventoryWarehouseLoan.vue';
import { IWarehouse, IWarehouseProductItemLoan } from '@/interfaces/InventoryInterfaces';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { Dialog } from '@/utils/Dialog/Dialog';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { IonAvatar, IonFab, IonFabButton, IonIcon, IonItem, IonSearchbar, IonLabel, IonProgressBar } from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import { PropType, computed, onMounted, onUnmounted, ref } from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';

const isLoading = ref<boolean>(false);
const props = defineProps({
    warehouse: {
        type: Object as PropType<IWarehouse>,
        required: true
    }
});

const dynamicData = ref({
    query: ''
})
const loansData = ref<IWarehouseProductItemLoan[]>([]);

const loansUI = computed(() => {
    return loansData.value.filter((loan) => {
        if (dynamicData.value.query.trim().length == 0) return true;

        return loan.product_item?.product.name.toLowerCase().includes(dynamicData.value.query.toLowerCase())
    }).map((loan) => {
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

