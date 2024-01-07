<template>
    <ion-label>{{label}}</ion-label>
    <article slot="end">
        <ion-datetime-button :datetime="randomId"></ion-datetime-button>
    </article>

    <ion-modal :keep-contents-mounted="true">
        <ion-datetime presentation="date" :value="value" :id="randomId" @ion-change="changeValue"></ion-datetime>
    </ion-modal>

</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonSelect, IonModal, IonDatetimeButton, IonNote, IonPopover, IonDatetime, IonSelectOption, IonTitle, IonContent, IonImg, IonAvatar,IonBackButton, IonProgressBar, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController } from '@ionic/vue';
import { PropType, computed, ref } from 'vue';

import { addOutline, albumsOutline, alertCircleOutline, checkmarkCircleOutline, close, logIn } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { DateTime } from 'luxon';
const accountsData = ref<any>(null);
const isLoading = ref<boolean>(true);
const router = useRouter();
const page = ref<HTMLElement|null>(null);

const props = defineProps({
    presentation: {
        type: String as PropType<'date' | 'time' | 'text' | 'month' | 'year' | 'datetime-local'>,
        required: true
    },
    label: {
        type: String as PropType<string>,
        required: true
    },
    value: {
        type: String as PropType<string>,
        required: true
    }
})

const emit = defineEmits(['change', 'update:modelValue']);

const randomId = Math.random().toString(36).substring(7);

const dateTimeValue = ref(props.value);

const changeValue = (event: any) => {
    dateTimeValue.value = DateTime.fromISO(event.detail.value).toISO() as unknown as string;
    emit('change', dateTimeValue.value);
    emit('update:modelValue', dateTimeValue.value);
}



</script>