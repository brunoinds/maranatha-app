<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Elige un Pack de Productos</ion-title>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <ion-list>
                <ion-item v-for="productPack in productsPacksData" :key="productPack.id" @click="choose(productPack)" button>
                    <ion-icon :icon="logoDropbox" slot="start"></ion-icon>
                    <ion-label>
                        <h2><b>{{ productPack.name }}</b></h2>
                        <p>{{ productPack.products.length }} productos</p>
                    </ion-label>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IProduct, IProductsPack } from '@/interfaces/InventoryInterfaces';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { IonButton, IonButtons, IonContent, IonIcon, IonHeader, IonItem, IonLabel, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar } from '@ionic/vue';
import { onMounted, ref } from 'vue';
import { DialogEventEmitter } from "../../utils/Dialog/Dialog";
import {logoDropbox} from 'ionicons/icons';

const isLoading = ref<boolean>(false);
const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    }
});

const productsPacksData = ref<IProductsPack[]>([]);
const productsData = ref<IProduct[]>([]);

const loadProductsPacks = async () => {
    isLoading.value = true;
    try {
        productsPacksData.value = await RequestAPI.get('/inventory/products-packs');
        productsData.value = await RequestAPI.get('/inventory/products');
    } catch (error) {
    }
    isLoading.value = false;
}

const choose = (pack: IProductsPack) => {
    props.emitter.fire('selected', (() => {
        const items = pack.products.map((productItem) => {
            const product = productsData.value.find((product) => product.id == productItem.product_id) as unknown as IProduct;
            return {
                product: product,
                quantity: parseInt(productItem.quantity as any)
            }
        });
        return items;
    })());
    props.emitter.fire('close');
}



onMounted(() => {
    loadProductsPacks();
})


</script>

<style scoped lang="scss">
</style>