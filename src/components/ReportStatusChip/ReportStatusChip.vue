<template>
    <article>
        <ion-chip :color="statusColor">
            <ion-icon :icon="statusIcon"></ion-icon>
            <ion-label>{{statusText}}</ion-label>
        </ion-chip>
    </article>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent,IonAccordion, IonAccordionGroup, IonProgressBar, IonImg, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController } from '@ionic/vue';
import { IReport, EReportStatus } from '../../interfaces/ReportInterfaces';
import { PropType, computed } from 'vue';
import { cashOutline, checkmarkCircleOutline, closeCircleOutline, pencilOutline, timeOutline } from 'ionicons/icons';

const props = defineProps({
    report: {
        type: Object as PropType<IReport>,
        required: true
    },
});


const statusText = computed(() => {
    return (() => {
        if (props.report.status == EReportStatus.Draft){
            return 'Borrador';
        }else if (props.report.status == EReportStatus.Submitted){
            return 'Pend. Aprob.';
        }else if (props.report.status == EReportStatus.Approved){
            return 'Pend. Reemb.';
        }else if (props.report.status == EReportStatus.Rejected){
            return 'Rechazado';
        }else if (props.report.status == EReportStatus.Restituted){
            return 'Pagado';
        }else{
            return 'Borrador';
        }
    })()
});
const statusIcon = computed(() => {
    return (() => {
        if (props.report.status == EReportStatus.Draft){
            return pencilOutline;
        }else if (props.report.status == EReportStatus.Submitted){
            return timeOutline;
        }else if (props.report.status == EReportStatus.Approved){
            return cashOutline;
        }else if (props.report.status == EReportStatus.Rejected){
            return closeCircleOutline;
        }else if (props.report.status == EReportStatus.Restituted){
            return checkmarkCircleOutline;
        }else{
            return pencilOutline;
        }
    })()
});
const statusColor = computed(() => {
    return (() => {
        if (props.report.status == EReportStatus.Draft){
            return 'medium';
        }else if (props.report.status == EReportStatus.Submitted){
            return 'warning';
        }else if (props.report.status == EReportStatus.Approved){
            return 'tertiary';
        }else if (props.report.status == EReportStatus.Rejected){
            return 'danger';
        }else if (props.report.status == EReportStatus.Restituted){
            return 'success';
        }else{
            return 'medium';
        }
    })()
});

</script>

<style scoped lang="scss">

</style>