<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Elegir imagen</ion-title>
            </ion-toolbar>
            <ion-toolbar>
                <ion-searchbar v-model="dynamicData.search" :animated="true" placeholder="Buscar imagen" :debounce="1000"  @ionInput="searchImage"  @ionChange="searchImage"></ion-searchbar>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <article class="grid">
                <ion-img @click="chooseImage(image)" class="grid-item" v-for="image in imageResults" :key="image" :src="image" style="width: 100%; height: auto; cursor: pointer; object-fit: cover;"></ion-img>
            </article>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { IonButton, IonButtons, IonContent, IonHeader, IonImg, IonPage, IonProgressBar, IonSearchbar, IonTitle, IonToolbar } from '@ionic/vue';
import { onMounted, ref } from 'vue';
import { DialogEventEmitter } from "../../utils/Dialog/Dialog";


import { Toolbox } from '@/utils/Toolbox/Toolbox';

const {isLoading, startLoading } = Toolbox.useIsLoading();

const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
    query: {
        type: String,
        required: false
    }
});
const dynamicData = ref<{
    search: string
}>({
    search: ''
});

if (props.query){
    dynamicData.value.search = props.query;
}

const imageResults = ref<Array<string>>([]);

const searchImage = async () => {
    await startLoading(async () => {
        if (!dynamicData.value.search){
            return;
        }
        imageResults.value = await RequestAPI.get('/inventory/product-image-search', {
            query: dynamicData.value.search
        });
    });
}

const chooseImage = async (image: string) => {
    props.emitter.fire('close');
    props.emitter.fire('choose-src', image);

    return;
    const response = await fetch(image);
    const blob = await response.blob();
    const file = new File([blob], 'image.png', {type: blob.type});
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
        image = (reader.result as string).split('base64,')[1];
        props.emitter.fire('choose-base64', image);
    }
}


onMounted(async () => {
    await searchImage();
});
</script>

<style scoped lang="scss">

.grid{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    width: 100%;

    .grid-item {
        aspect-ratio: 1 / 1;
        background-color: #f0f0f0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>