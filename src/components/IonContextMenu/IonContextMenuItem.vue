<template>
    <button ref="buttonElement" :label="label" :value="value" @click="onClickItem">
        <ion-label :color="color">
            {{ label }}
        </ion-label>
        <ion-icon :icon="icon" :color="color"></ion-icon>
    </button>
</template>

<script setup lang="ts">

import { onMounted, getCurrentInstance, ref } from 'vue';
import { IonList, IonItem, IonLabel, IonBackdrop, IonIcon } from '@ionic/vue';

const buttonElement = ref(null);

const props = defineProps({
    icon: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: false,
        default: 'default'
    },
    value: {
        type: String,
        required: false,
        default: null
    }
})

const emit = defineEmits(['click']);

const onClickItem = () => {
    emit('click');
}

onMounted(() => {

});

</script>


<style scoped lang="scss">
button{
    display: flex;
    align-items: center;
    column-gap: 10px;
    font-size: 15px;
    padding: 11px 15px;
    width: 100%;
    justify-content: space-between;
    background: transparent;
    > p{
        margin: 0;
        text-align: left;
    }


    &[is-hovering="true"]{
        background: var(--ion-color-light);
    }
}



</style>