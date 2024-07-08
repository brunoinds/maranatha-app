<template>
    <article class="ion-padding article">
        <ion-img v-if="props.icon" :src="props.icon"></ion-img>
        <h2 v-if="props.title">{{ props.title }}</h2>
        <p class="ion-text-center" v-if="props.description">{{ props.description }}</p>
    </article>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { IonImg } from '@ionic/vue';


const props = defineProps({
    icon: {
        type: Object as () => any | null,
        required: false,
        default: null
    },
    title: {
        type: String,
        required: false,
        default: null
    },
    description: {
        type: String,
        required: false,
        default: null
    }
});
</script>

<style scoped lang="scss">
.article{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;

    > ion-img{
        width: 90%;
        margin: 0 auto;
    }
}
</style>