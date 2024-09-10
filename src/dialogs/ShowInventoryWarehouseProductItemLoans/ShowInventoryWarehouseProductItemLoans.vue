<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="emitter.fire('close')">Cerrar</ion-button>
                </ion-buttons>
                <ion-title>Registro de Préstamos del Producto</ion-title>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <ion-list>
                <ion-item v-if="loansRegistryUI.length > 0" button @click="openProductItemView">
                    <ion-avatar slot="start" >
                        <img :src="loansRegistryUI[0].product_item?.product.image" />
                    </ion-avatar>
                    <ion-label>
                        <h2><b>{{ loansRegistryUI[0].product_item?.product.name }}</b></h2>
                        <p>{{ loansRegistryUI[0].product_item?.product.description }}</p>
                        <p>{{ loansRegistryUI[0].product_item?.product.brand }}</p>
                        <p>S/N: {{ loansRegistryUI[0].product_item?.batch }}</p>
                    </ion-label>
                </ion-item>
            </ion-list>
            <br>
            <ion-list-header>Historial de préstamos</ion-list-header>
            <br>

            <ion-list>
                <ion-item v-for="loan in loansRegistryUI" :key="loan.id" button @click="showLoan(loan)">
                    <ion-label>
                        <h2><b>{{ loan.date }}</b></h2>
                        <p>{{ loan.loaned_to?.name }}</p>
                    </ion-label>
                    <ProductItemLoanStatusChip slot="end" :request="loan" />
                </ion-item>
            </ion-list>
            <br><br><br><br>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import ProductItemLoanStatusChip from '@/components/ProductItemLoanStatusChip/ProductItemLoanStatusChip.vue';
import EditInventoryProductItem from '@/dialogs/EditInventoryProductItem/EditInventoryProductItem.vue';
import EditInventoryWarehouseLoan from '@/dialogs/EditInventoryWarehouseLoan/EditInventoryWarehouseLoan.vue';
import { IWarehouseProductItemLoan } from '@/interfaces/InventoryInterfaces';
import { Dialog, DialogEventEmitter } from '@/utils/Dialog/Dialog';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { IonButton, IonButtons, IonContent, IonAvatar, IonHeader, IonListHeader, IonLabel, IonItem, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar } from '@ionic/vue';
import { DateTime } from 'luxon';
import { computed, onMounted, ref } from 'vue';

const isLoading = ref<boolean>(true);

const props = defineProps({
    productItemId: {
        type: Number,
        required: true
    },
    emitter: {
        type: DialogEventEmitter,
        required: true
    }
});

const loansRegistry = ref<IWarehouseProductItemLoan[]>([]);


const loansRegistryUI = computed(() => {
    return loansRegistry.value.map((loan) => {
        return {
            ...loan,
            date: DateTime.fromJSDate(new Date(loan.created_at)).toFormat('dd/MM/yyyy')
        }
    })
})

const loadLoanRegestry = async () => {
    isLoading.value = true;
    const response = await RequestAPI.get('/inventory/products/items/' + props.productItemId + '/loans');
    loansRegistry.value = response;
    isLoading.value = false;
}

const showLoan = (loan: IWarehouseProductItemLoan) => {
    Dialog.show(EditInventoryWarehouseLoan, {
        props: {
            productItemLoanId: loan.id
        },
        onLoaded($this) {
            
        }
    })
}

const openProductItemView = () => {
    Dialog.show(EditInventoryProductItem, {
        props: {
            productItemId: props.productItemId
        },
        onLoaded($this) {
            
        }
    })
}

onMounted(async () => {
    isLoading.value = false;
    loadLoanRegestry();
})
</script>

<style scoped lang="scss">

.offwhite{
    background-color: var(--ion-color-light-tint);
    padding-top: 10px;
    padding-bottom: 10px;
}
</style>