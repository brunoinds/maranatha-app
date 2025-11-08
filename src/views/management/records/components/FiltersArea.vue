<template>
    <article>
        <ion-list>
            <ion-item v-for="filter in props.filters" :key="filter.id">
                <ion-select v-if="filter.value.type == 'dropdown'" :label="filter.value.name" v-model="filter.value.value" :multiple="filter.value.multiple ? filter.value.multiple : false">
                    <ion-select-option v-for="option in filter.value.options" :value="option.value">{{option.name}}</ion-select-option>
                </ion-select>
                <IonDateRangeMonthItem v-if="filter.value.type == 'daterangemonth'" :label="filter.value.name" :value="filter.value.value" v-model="filter.value.value"></IonDateRangeMonthItem>

                <IonDateRangeItem v-if="filter.value.type == 'daterange'" :label="filter.value.name" :value="filter.value.value" v-model="filter.value.value"></IonDateRangeItem>
                <IonDatetimeItem v-if="filter.value.type == 'date'" :label="filter.value.name" :value="filter.value.value" :presentation="filter.value.type"  v-model="filter.value.value"></IonDatetimeItem>
                <ion-input v-if="filter.value.type == 'textbox'" :label="filter.value.name" v-model="filter.value.value"></ion-input>
            </ion-item>
        </ion-list>
    </article>
</template>

<script setup lang="ts">
import { IonInput, IonItem, IonList, IonSelect, IonSelectOption } from '@ionic/vue';
import { PropType, ref, watch } from 'vue';

import IonDateRangeItem from '@/components/IonDateRangeItem/IonDateRangeItem.vue';
import IonDateRangeMonthItem from '@/components/IonDateRangeMonthItem/IonDateRangeMonthItem.vue';
import IonDatetimeItem from '@/components/IonDatetimeItem/IonDatetimeItem.vue';
import { useRouter } from 'vue-router';

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