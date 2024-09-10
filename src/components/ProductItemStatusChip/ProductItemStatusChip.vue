<template>
    <article>
        <ion-chip :color="statusData.color">
            <ion-icon :icon="statusData.icon"></ion-icon>
            <ion-label>{{statusData.text}}</ion-label>
        </ion-chip>
    </article>
</template>

<script setup lang="ts">
import { EInventoryProductItemStatus, EInventoryWarehouseOutcomeRequestStatus, EInventoryWarehouseProductItemLoanStatus, IInventoryProductItem, IWarehouseOutcomeRequest, IWarehouseProductItemLoan } from '@/interfaces/InventoryInterfaces';
import { IonChip, IonIcon, IonLabel } from '@ionic/vue';
import { airplaneOutline, alertCircleOutline, bagCheckOutline, bagHandleOutline, buildOutline, checkboxOutline, checkmarkCircleOutline, closeCircleOutline, cubeOutline, locationOutline, pencilOutline, peopleOutline, removeCircleOutline, swapVerticalOutline, timeOutline } from 'ionicons/icons';
import { PropType, computed, ref } from 'vue';

const props = defineProps({
    request: {
        type: Object as PropType<IInventoryProductItem>,
        required: true
    }
});

const statusData = computed(() => {
    return (() => {
        if (props.request.status == EInventoryProductItemStatus.InStock){
            return {
                text: 'En Stock',
                icon: cubeOutline,
                color: 'primary'
            };
        }else if (props.request.status == EInventoryProductItemStatus.Sold){
            return {
                text: 'Vendido',
                icon: bagCheckOutline,
                color: 'success'
            }
        }else if (props.request.status == EInventoryProductItemStatus.Loaned){
            return {
                text: 'Prestado',
                icon: peopleOutline,
                color: 'success'
            }
        }else if (props.request.status == EInventoryProductItemStatus.InRepair){
            return {
                text: 'En Reparación',
                icon: buildOutline,
                color: 'warning'
            }
        }else if (props.request.status == EInventoryProductItemStatus.WriteOff){
            return {
                text: 'De baja',
                icon: removeCircleOutline,
                color: 'danger'
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