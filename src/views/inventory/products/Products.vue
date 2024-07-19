<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-title>Productos</ion-title>
                <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-fab slot="fixed" vertical="bottom" horizontal="end" :edge="false">
                <ion-fab-button @click="createNewProduct">
                    <ion-icon :icon="addOutline"></ion-icon>
                </ion-fab-button>
            </ion-fab>

            <section>
                <ion-list>
                    <ion-item v-for="product in productsData" :key="product.id">
                        <ion-avatar slot="start" v-if="product.image">
                            <img :src="product.image" />
                        </ion-avatar>
                        <ion-label>
                            <h2>{{ product.name }}</h2>
                            <p>{{ product.description }}</p>
                            <p>{{ product.brand }}</p>
                        </ion-label>
                    </ion-item>
                </ion-list>
            </section>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonAvatar, IonCheckbox, IonSegment, IonSelect, IonSelectOption, IonButton, IonSegmentButton, IonContent, IonAccordion, IonAccordionGroup, IonProgressBar, IonImg, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController } from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { IProduct, IWarehouse } from '@/interfaces/InventoryInterfaces';
import { Dialog } from '@/utils/Dialog/Dialog';
import CreateInventoryProduct from '@/dialogs/CreateInventoryProduct/CreateInventoryProduct.vue';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { InventoryStore } from '@/utils/Stored/InventoryStore';
import {IonPeekPop, IonPeekPopContextMenuItem} from 'ion-peek-pop';
import 'ion-peek-pop/styles.css';

const page = ref<HTMLElement|null>(null);
const isLoading = ref<boolean>(false);

const productsData = ref<IProduct[]>([]);

const createNewProduct = () => {
    Dialog.show(CreateInventoryProduct, {
        onLoaded($this) {
            $this.on('created', (event:any) => {
                AppEvents.emit('inventory:reload');
            })
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        }
    })
}



const loadProducts = async () => {
    isLoading.value = true;
    const response = await InventoryStore.getProducts();

    productsData.value = response;

    isLoading.value = false;
}


onMounted(() => {
    loadProducts();

    const callbackId = AppEvents.on('inventory:reload', () => {
        loadProducts();
    })
    onUnmounted(() => {
        AppEvents.off('all:reload', callbackId);
    })
});
</script>

<style scoped lang="scss">
</style>