<template>
    <ion-item button @click="handleClick" :disabled="disabled">
        <ion-label>
            <h3 style="font-size: 12px;">{{ label }}</h3>
            <p v-if="props.value.length > 0" style="font-size: 16px; color: var(--ion-text-color);">{{ text }}</p>
            <p v-if="props.value.length == 0" style="font-size: 16px; color: var(--ion-color-medium-shade);">{{ text }}</p>
        </ion-label>
    </ion-item>
</template>


<script lang="ts" setup>
import { computed, defineProps, defineEmits } from 'vue';
import { IonItem, IonLabel } from '@ionic/vue';


const props = defineProps({
    placeholder: {
        type: String,
        required: false,
        default: 'Selecciona un item'
    },
    label: {
        type: String,
        required: true,
    },
    value: {
        type: Object as () => any,
        required: true
    },
    disabled: {
        type: Boolean,
        required: false,
        default: false
    }
})

const emit = defineEmits(['clicked']);

const handleClick = (event:any) => {
    emit('clicked', event)
}




const text = computed(() => {
    return props.value.length > 0 ? props.value : props.placeholder
})



</script>

<style scoped lang="scss">


</style>