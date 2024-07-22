<template>
    <ion-label v-if="label">{{label}}</ion-label>
    <article slot="end">
        <ion-datetime-button presentation="month-year"  :id="'btn-' + randomId" :datetime="randomId"></ion-datetime-button>
    </article>
    <ion-modal :keep-contents-mounted="true">
        <ion-datetime presentation="month-year" :value="valueReadable" :id="randomId" @ion-change="changeValue"></ion-datetime>
    </ion-modal>

</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar,IonInput, IonSelect, IonModal, IonDatetimeButton, IonNote, IonPopover, IonDatetime, IonSelectOption, IonTitle, IonContent, IonImg, IonAvatar,IonBackButton, IonProgressBar, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController } from '@ionic/vue';
import { DateTime } from 'luxon';
import { PropType, computed, nextTick, onMounted, ref, watch } from 'vue';


const props = defineProps({
    label: {
        type: String as PropType<string>,
        required: false
    },
    value: {
        type: Object as PropType<{
            start: string,
            end: string
        }>,
        required: true
    },
})

const valueReadable = computed(() => {
    return props.value.start;
})

const emit = defineEmits(['change', 'update:modelValue']);

const randomId = Math.random().toString(36).substring(7);


const changeValue = (ev) => {
    const newStartDate = DateTime.fromISO(ev.detail.value).startOf('month').toISODate();
    const newEndDate = DateTime.fromISO(ev.detail.value).endOf('month').toISODate();
    emit('change', {
        start: newStartDate,
        end: newEndDate
    });
    emit('update:modelValue', {
        start: newStartDate,
        end: newEndDate
    });
}

onMounted(() => {

})
</script>


<style scoped lang="scss">

</style>