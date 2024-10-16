<template>
    <ion-item>
        <ion-select v-if="view == 'List'" :label="label"  :label-placement="labelPlacement" :value="value" :placeholder="placeholder" @ion-change="changeListValue" :disabled="disabled" :multiple="false">
            <ion-select-option v-for="item in items" :value="item.value">{{ item.name }}</ion-select-option>
        </ion-select>
        <ion-input v-if="view == 'Text'" :label="label"  :label-placement="labelPlacement" :placeholder="placeholder" :value="value" @ion-input="changeTextValue" :disabled="disabled"></ion-input>
        <ion-button slot="end" @click="changeView">
            <ion-icon v-if="view == 'List'" :icon="pencilOutline"></ion-icon>
            <ion-icon  v-if="view == 'Text'" :icon="listOutline"></ion-icon>
        </ion-button>
    </ion-item>
</template>


<script setup lang="ts">
import { IonItem, IonSelect, IonSelectOption, IonInput, IonIcon, IonButton } from '@ionic/vue';
import { listOutline, pencilOutline } from 'ionicons/icons';
import { defineProps, computed, PropType, defineModel, ref } from 'vue';

const view = ref('List');

const changeView = () => {
    view.value = view.value == 'List' ? 'Text' : 'List';
}

const props = defineProps({
    label: {
        type: String,
        required: false,
        default: ''
    },
    labelPlacement: {
        type: String,
        required: false,
        default: 'stacked'
    },
    placeholder: {
        type: String,
        required: false,
        default: ''
    },
    disabled: {
        type: Boolean,
        required: false,
        default: false
    },
    multiple: {
        type: Boolean,
        required: false,
        default: true
    },
    items: {
        type: Array as PropType<Array<{name: string, value: string}>>,
        required: true
    },
    value: {
        type: String,
        required: false,
        default: ''
    }
});

const model = defineModel();

const emit = defineEmits(['clicked', 'update:modelValue'])


const changeListValue = (event: CustomEvent) => {
    emit('update:modelValue',  event.detail.value)
}

const changeTextValue = (event: CustomEvent) => {
    emit('update:modelValue',  event.detail.value)
}


</script>

<style scoped lang="scss">

</style>