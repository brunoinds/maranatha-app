<template>
    <article>
        <ion-list>
            <ion-item v-for="filter in props.filters" :key="filter.id">
                <ion-select v-if="filter.value.type == 'dropdown'" :label="filter.value.name" v-model="filter.value.value">
                    <ion-select-option v-for="option in filter.value.options" :value="option.value">{{option.name}}</ion-select-option>
                </ion-select>
                <IonDateRangeItem :label="filter.value.name" :value="filter.value.value" v-if="filter.value.type == 'daterange'" v-model="filter.value.value"></IonDateRangeItem>
                <IonDatetimeItem :label="filter.value.name" :value="filter.value.value" :presentation="filter.value.type" v-if="filter.value.type == 'date'" v-model="filter.value.value"></IonDatetimeItem>
                <ion-input v-if="filter.value.type == 'textbox'" :label="filter.value.name" v-model="filter.value.value"></ion-input>
            </ion-item>
        </ion-list>
    </article>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonSelect, IonInput, IonNote, IonPopover, IonDatetime, IonSelectOption, IonTitle, IonContent, IonImg, IonAvatar,IonBackButton, IonProgressBar, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController } from '@ionic/vue';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { PropType, computed, ref, watch } from 'vue';
import { Dialog } from '@/utils/Dialog/Dialog';
import EditUser from '@/dialogs/EditUser/EditUser.vue';

import { addOutline, albumsOutline, alertCircleOutline, checkmarkCircleOutline, close, logIn } from 'ionicons/icons';
import { IReport } from '@/interfaces/ReportInterfaces';
import { useRouter } from 'vue-router';
import IonDatetimeItem from '@/components/IonDatetimeItem/IonDatetimeItem.vue';
import IonDateRangeItem from '@/components/IonDateRangeItem/IonDateRangeItem.vue';
const accountsData = ref<any>(null);
const isLoading = ref<boolean>(true);
const router = useRouter();
const page = ref<HTMLElement|null>(null);

const props = defineProps({
    filters: {
        type: Array as PropType<any[]>,
        required: true
    }
});

const emit = defineEmits(['change', 'update:modelValue']);


const filtersData = ref(props.filters);

watch(filtersData, (newValue) => {
    emit('change', newValue);
    emit('update:modelValue', newValue);
})

</script>