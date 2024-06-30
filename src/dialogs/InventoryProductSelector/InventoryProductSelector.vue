<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Elegir Producto</ion-title>
                <ion-buttons slot="end">
                    <ion-button v-if="allowMultipleSelection" @click="finishSelection()">Elegir</ion-button>
                </ion-buttons>
            </ion-toolbar>
            <ion-toolbar>
                <ion-searchbar v-model="dynamicData.search" :animated="true" placeholder="Buscar Producto"></ion-searchbar>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <ion-list>
                <ion-item button v-for="product in productsUI" :key="product.id" @click="selectProduct(product)" :detail="false">
                    <ion-label>
                        <h2>{{ product.name }}</h2>
                        <p>{{ product.description }}</p>
                    </ion-label>
                    <ion-icon v-if="dynamicData.selectedProducts.includes(product)" color="primary" :icon="checkmarkOutline" slot="end"></ion-icon>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { IonButton, IonButtons, IonContent, IonHeader, IonSearchbar, IonLabel, IonInput,IonIcon, IonSelect, IonSelectOption, IonItem, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar, alertController, toastController } from '@ionic/vue';
import { computed, onMounted, ref } from 'vue';
import { DialogEventEmitter } from "../../utils/Dialog/Dialog";
import { arrowForwardCircleOutline, cubeOutline, storefrontOutline, checkmarkOutline } from 'ionicons/icons';
import { IWorker } from '@/interfaces/WorkerInterfaces';
import { IProduct, IWarehouse } from '@/interfaces/InventoryInterfaces';


const isLoading = ref<boolean>(false);
const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
    contextWarehouseId: {
        type: Number,
        required: false,
        default: null
    },
    allowMultipleSelection: {
        type: Boolean,
        required: false,
        default: false
    }
});

const productsData = ref<IProduct[]>([]);

const dynamicData = ref<{
    search: string,
    selectedProducts: IProduct[]
}>({
    search: '',
    selectedProducts: []
});


const productsUI = computed(() => {
    return productsData.value.filter((product) => {
        if (dynamicData.value.search.length === 0) return true;
        return  product.name.toLowerCase().includes(dynamicData.value.search.toLowerCase()) || 
                product.description?.toLowerCase().includes(dynamicData.value.search.toLowerCase()) || 
                product.brand?.toLowerCase().includes(dynamicData.value.search.toLowerCase());
    })
})

const loadProducts = async () => {
    isLoading.value = true;
    const response = await RequestAPI.get('/inventory/products');

    productsData.value = response;
    isLoading.value = false;
}



const finishSelection = () => {
    if (props.allowMultipleSelection){
        props.emitter.fire('selected', dynamicData.value.selectedProducts);
    } else {
        props.emitter.fire('selected', dynamicData.value.selectedProducts[0]);
    }
    props.emitter.fire('close');
}

const selectProduct = (product: IProduct) => {
    if (dynamicData.value.selectedProducts.includes(product)){
        dynamicData.value.selectedProducts = dynamicData.value.selectedProducts.filter((selectedProduct) => selectedProduct.id !== product.id);
    } else {
        if (!props.allowMultipleSelection){
            dynamicData.value.selectedProducts = [product];
            finishSelection();
        }else{
            dynamicData.value.selectedProducts.push(product);
        }
    }
}


onMounted(() => {
    loadProducts();
})


</script>

<style scoped lang="scss">
</style>