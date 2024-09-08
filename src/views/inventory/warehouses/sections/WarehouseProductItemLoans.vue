<template>
    <section class="content">
        <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>

        <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
            <ion-item v-for="loan in loansUI" button @click="openWarehouseLoan(loan.original)">
                <ion-avatar slot="start" v-if="loan.product_item?.product.image">
                    <img :src="loan.product_item.product.image" />
                </ion-avatar>
                <ion-label>
                    <h2><b>#00{{ loan.id }}</b></h2>
                    <h2><b>{{ loan.product_item?.product.name }}</b></h2>
                    <h3>{{ loan.date }} - {{ loan.loaned_to?.name }}</h3>
                    <p>{{ loan.product_item?.product.description }}</p>
                    <p>{{ loan.product_item?.product.brand }}</p>

                </ion-label>
                <ProductItemLoanStatusChip :request="loan" slot="end" />
            </ion-item>
        </ion-list>
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
</style>

