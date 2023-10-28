<template>
    <IonTitle v-show="!hasSubtitle">{{ props.title }}</IonTitle>
    <section class="main" v-show="hasSubtitle">
        <h1>{{ props.title }}</h1>
        <p>{{ props.subtitle }}</p>
    </section>
</template>


<script setup lang="ts">

//Declare props:
import { defineProps, computed } from 'vue';
import {IonTitle} from '@ionic/vue';


const props = defineProps({
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        required: true
    }
});

const hasSubtitle = computed(() => {
    if (typeof props.subtitle == "string" && props.subtitle.trim().length > 0) {
        return true;
    } else {
        return false;
    }
});


</script>

<style scoped lang="scss">
    .main{
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        position: absolute;
        top: 5px;
        left: 50%;
        transform: translateX(-50%);
        width: -webkit-fill-available;
        > h1, p{
            text-align: center;
            white-space: nowrap;
            width: 80%;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        > h1{
            margin: 0;
            width: 100%;
            height: 100%;
            transform: translateZ(0px);
            font-size: 17px;
            font-weight: 600;
            text-align: center;
        }
        > p{
            margin: 0;
            font-size: 66%;
            font-weight: 500;
        }
    }
</style>