<template>
    <article>
        <ion-chip :color="statusData.color">
            <ion-icon :icon="statusData.icon"></ion-icon>
            <ion-label>{{statusData.text}}</ion-label>
        </ion-chip>
    </article>
</template>

<script setup lang="ts">
import { EInventoryWarehouseOutcomeRequestStatus, IWarehouseOutcomeRequest } from '@/interfaces/InventoryInterfaces';
import { IonChip, IonIcon, IonLabel } from '@ionic/vue';
import { airplaneOutline, alertCircleOutline, bagHandleOutline, checkboxOutline, checkmarkCircleOutline, closeCircleOutline, locationOutline, pencilOutline, timeOutline } from 'ionicons/icons';
import { PropType, computed, ref } from 'vue';

const props = defineProps({
    request: {
        type: Object as PropType<IWarehouseOutcomeRequest>,
        required: true
    },
    viewMode: {
        type: String as PropType<'Requester'|'Dispacher'>,
        required: true
    }
});

const statusData = computed(() => {
    return (() => {
        if (props.viewMode == 'Dispacher'){
            if (props.request.status == EInventoryWarehouseOutcomeRequestStatus.Draft){
                return {
                    text: 'Borrador',
                    icon: pencilOutline,
                    color: 'medium'
                };
            }else if (props.request.status == EInventoryWarehouseOutcomeRequestStatus.Requested){
                return {
                    text: 'Solicitado',
                    icon: timeOutline,
                    color: 'warning'
                }
            }else if (props.request.status == EInventoryWarehouseOutcomeRequestStatus.Rejected){
                return {
                    text: 'Rechazado',
                    icon: closeCircleOutline,
                    color: 'danger'
                }
            }else if (props.request.status == EInventoryWarehouseOutcomeRequestStatus.Approved){
                return {
                    text: 'Separar productos',
                    icon: bagHandleOutline,
                    color: 'warning'
                }
            }else if (props.request.status == EInventoryWarehouseOutcomeRequestStatus.Dispatched){
                return {
                    text: 'Enviar productos',
                    icon: airplaneOutline,
                    color: 'warning'
                }
            }else if (props.request.status == EInventoryWarehouseOutcomeRequestStatus.OnTheWay){
                return {
                    text: 'En camino',
                    icon: airplaneOutline,
                    color: 'primary'
                }
            }else if (props.request.status == EInventoryWarehouseOutcomeRequestStatus.Delivered){
                return {
                    text: 'Entregado',
                    icon: locationOutline,
                    color: 'primary'
                }
            }else if (props.request.status == EInventoryWarehouseOutcomeRequestStatus.Finished){
                return {
                    text: 'Finalizado',
                    icon: checkmarkCircleOutline,
                    color: 'success'
                }
            }else{
                return {
                    text: 'Borrador',
                    icon: pencilOutline,
                    color: 'medium'
                }
            }
        }else{
            if (props.request.status == EInventoryWarehouseOutcomeRequestStatus.Draft){
                return {
                    text: 'Borrador',
                    icon: pencilOutline,
                    color: 'medium'
                };
            }else if (props.request.status == EInventoryWarehouseOutcomeRequestStatus.Requested){
                return {
                    text: 'Solicitado',
                    icon: timeOutline,
                    color: 'primary'
                }
            }else if (props.request.status == EInventoryWarehouseOutcomeRequestStatus.Rejected){
                return {
                    text: 'Rechazado',
                    icon: closeCircleOutline,
                    color: 'danger'
                }
            }else if (props.request.status == EInventoryWarehouseOutcomeRequestStatus.Approved){
                return {
                    text: 'Aprobado',
                    icon: checkboxOutline,
                    color: 'primary'
                }
            }else if (props.request.status == EInventoryWarehouseOutcomeRequestStatus.Dispatched){
                return {
                    text: 'Esperando envío',
                    icon: bagHandleOutline,
                    color: 'primary'
                }
            }else if (props.request.status == EInventoryWarehouseOutcomeRequestStatus.OnTheWay){
                return {
                    text: 'En camino',
                    icon: airplaneOutline,
                    color: 'warning'
                }
            }else if (props.request.status == EInventoryWarehouseOutcomeRequestStatus.Delivered){
                return {
                    text: 'Revisar entrega',
                    icon: alertCircleOutline,
                    color: 'warning'
                }
            }else if (props.request.status == EInventoryWarehouseOutcomeRequestStatus.Finished){
                return {
                    text: 'Finalizado',
                    icon: checkmarkCircleOutline,
                    color: 'success'
                }
            }else{
                return {
                    text: 'Borrador',
                    icon: pencilOutline,
                    color: 'medium'
                }
            }
        }
    })()
})

</script>

<style scoped lang="scss">

</style>