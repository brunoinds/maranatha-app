<template>
    <article>
        <ion-chip :color="statusData.color">
            <ion-icon :icon="statusData.icon"></ion-icon>
            <ion-label>{{statusData.text}}</ion-label>
        </ion-chip>
    </article>
</template>

<script setup lang="ts">
import { EInventoryWarehouseOutcomeRequestStatus, EInventoryWarehouseProductItemLoanStatus, IWarehouseOutcomeRequest, IWarehouseProductItemLoan } from '@/interfaces/InventoryInterfaces';
import { IonChip, IonIcon, IonLabel } from '@ionic/vue';
import { airplaneOutline, alertCircleOutline, bagHandleOutline, checkboxOutline, checkmarkCircleOutline, closeCircleOutline, locationOutline, pencilOutline, swapVerticalOutline, timeOutline } from 'ionicons/icons';
import { PropType, computed, ref } from 'vue';

const props = defineProps({
    request: {
        type: Object as PropType<IWarehouseProductItemLoan>,
        required: true
    }
});

const statusData = computed(() => {
    return (() => {
        if (props.request.status == EInventoryWarehouseProductItemLoanStatus.SendingToLoan){
            return {
                text: 'Enviando',
                icon: airplaneOutline,
                color: 'medium'
            };
        }else if (props.request.status == EInventoryWarehouseProductItemLoanStatus.OnLoan){
            return {
                text: 'Prestado',
                icon: timeOutline,
                color: 'primary'
            }
        }else if (props.request.status == EInventoryWarehouseProductItemLoanStatus.ReturningToWarehouse){
            return {
                text: 'Esperando devolución',
                icon: swapVerticalOutline,
                color: 'danger'
            }
        }else if (props.request.status == EInventoryWarehouseProductItemLoanStatus.Returned){
            return {
                text: 'Devuelto',
                icon: checkmarkCircleOutline,
                color: 'success'
            }
        }
        
        return {
            text: 'Desconocido',
            icon: alertCircleOutline,
            color: 'medium'
        }
    })()
})

</script>

<style scoped lang="scss">

</style>