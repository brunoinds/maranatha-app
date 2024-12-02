<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="emitter.fire('close')">Cerrar</ion-button>
                </ion-buttons>
                <ion-title>Listado de Préstamos</ion-title>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <ion-list>
                <ion-item v-for="loan in loansRegistryUI" :key="loan.id" button @click="showLoan(loan)">
                    <ion-avatar slot="start" >
                        <img :src="loan.product_item?.product.image" />
                    </ion-avatar>
                    <ion-label>
                        <h2><b>{{ loan.product_item?.product.name }}</b></h2>
                        <p>{{ loan.product_item?.product.description }}</p>
                        <p>{{ loan.product_item?.product.brand }}</p>
                        
                        <p><b>Prestado para:</b> {{ loan.loaned_to?.name }}</p>
                        <p><b>Fecha:</b> {{ loan.date }}</p>
                        <p><b>Job:</b> {{ loan.movements[0]?.job_code }}</p>
                        <p><b>Expense:</b> {{ loan.movements[0]?.expense_code }}</p>
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
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { Dialog, DialogEventEmitter } from '@/utils/Dialog/Dialog';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { IonButton, IonButtons, IonContent, IonAvatar, IonHeader, IonListHeader, IonLabel, IonItem, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar } from '@ionic/vue';
import { DateTime } from 'luxon';
import { computed, onMounted, onUnmounted, PropType, ref } from 'vue';

const isLoading = ref<boolean>(true);

const props = defineProps({
    productsItemsLoans: {
        type: Array as PropType<IWarehouseProductItemLoan[]>,
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


const showLoan = (loan: IWarehouseProductItemLoan) => {
    Dialog.show(EditInventoryWarehouseLoan, {
        props: {
            productItemLoanId: loan.id
        },
        onLoaded($this) {
            
        }
    })
}


onMounted(async () => {
    isLoading.value = false;

    loansRegistry.value = props.productsItemsLoans;
})
</script>

<style scoped lang="scss">

.offwhite{
    background-color: var(--ion-color-light-tint);
    padding-top: 10px;
    padding-bottom: 10px;
}
</style>