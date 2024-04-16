<template>
    <ion-label v-if="label">{{label}}</ion-label>
    <span v-if="false">{{ startAndEnd }}</span>
    <article slot="end">
        <ion-datetime-button :id="'btn-' + randomId" :datetime="randomId"></ion-datetime-button>
    </article>
    <ion-modal :keep-contents-mounted="true">
        <CustomDateRange
            :id="randomId"
            min="2023-01-01T00:00:00"
            :start="startDate"
            :end="endDate"
            @update:start="(d) => {
                startDate = d;
                changeValue();
            }"
            @update:end="(d) => {
                endDate = d;
                changeValue();
            }"
        />
    </ion-modal>

</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar,IonInput, IonSelect, IonModal, IonDatetimeButton, IonNote, IonPopover, IonDatetime, IonSelectOption, IonTitle, IonContent, IonImg, IonAvatar,IonBackButton, IonProgressBar, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController } from '@ionic/vue';
import { PropType, computed, nextTick, onMounted, ref, watch } from 'vue';

import { addOutline, albumsOutline, alertCircleOutline, checkmarkCircleOutline, close, logIn } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { DateTime } from 'luxon';
import CustomDateRange from '@/components/IonDateRange/IonDateRange.vue';
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
const startDate = ref<string>(props.value.start);
const endDate = ref<string>(props.value.end);


const startAndEnd = computed(() => {
    applyButtonText();

    return {
        start: startDate.value,
        end: endDate.value
    }
})


const emit = defineEmits(['change', 'update:modelValue']);

const randomId = Math.random().toString(36).substring(7);

const applyButtonText = () => {
    const textSlot = document.getElementById('btn-' + randomId)?.shadowRoot?.querySelector('button > slot') as unknown as HTMLElement;

    if (!textSlot){
        setTimeout(() => {
            applyButtonText();
        }, 200);
        return;
    }
    //Get start date in current locale format with luxon, in like: Aug 23, 2021:
    const startDateFormatted = DateTime.fromFormat(startDate.value, 'yyyy-MM-dd').toLocaleString(DateTime.DATE_MED);
    const endDateFormatted = DateTime.fromFormat(endDate.value, 'yyyy-MM-dd').toLocaleString(DateTime.DATE_MED);
    if (startDate.value == endDate.value) {
        textSlot.textContent = startDateFormatted;
    } else {
        textSlot.textContent = `${startDateFormatted} - ${endDateFormatted}`;
    }
}

const changeValue = () => {
    applyButtonText();
    emit('change', {
        start: startDate.value,
        end: endDate.value
    });
    emit('update:modelValue', {
        start: startDate.value,
        end: endDate.value
    });
}

onMounted(() => {
    nextTick(() => {
        applyButtonText();
    })
})
</script>


<style scoped lang="scss">

</style>