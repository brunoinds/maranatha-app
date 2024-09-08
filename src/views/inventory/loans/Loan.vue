<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import EditInventoryWarehouseLoan from '@/dialogs/EditInventoryWarehouseLoan/EditInventoryWarehouseLoan.vue';
import { IWarehouseProductItemLoan } from '@/interfaces/InventoryInterfaces';
import { Dialog, DialogEventEmitter } from '@/utils/Dialog/Dialog';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { IonButton, IonButtons, IonContent, IonAvatar, IonHeader, IonListHeader, IonLabel, IonItem, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar } from '@ionic/vue';
import { DateTime } from 'luxon';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';


const route = useRoute();
const router = useRouter();
const isLoading = ref<boolean>(true);



const showLoan = () => {
    const loanId = route.params.id
    Dialog.show(EditInventoryWarehouseLoan, {
        props: {
            productItemLoanId: loanId
        },
        onLoaded($this) {
            
        }
    })
    router.replace('/inventory')
}

onMounted(async () => {
    showLoan();
})
</script>

<style scoped lang="scss">

.offwhite{
    background-color: var(--ion-color-light-tint);
    padding-top: 10px;
    padding-bottom: 10px;
}
</style>