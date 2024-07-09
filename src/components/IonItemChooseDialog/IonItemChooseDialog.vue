<template>
    <ion-item button @click="handleClick" :disabled="disabled">
        <ion-label>
            <h3 style="font-size: 12px;">{{ label }}</h3>
            <p v-if="!showPlaceholder" style="font-size: 16px; color: var(--ion-text-color);">{{ text }}</p>
            <p v-if="showPlaceholder" style="font-size: 16px; color: var(--ion-color-medium-shade);">{{ text }}</p>
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
    if (props.value){
        if (typeof props.value === 'string' && props.value.trim().length == 0){
            return props.placeholder
        }
        return props.value
    }else{
        return props.placeholder
    }
})

const showPlaceholder = computed(() => {
    if (props.value){
        if (typeof props.value === 'string' && props.value.trim().length == 0){
            return true
        }
        return false
    }else{
        return true
    }
})


</script>

<style scoped lang="scss">


</style>