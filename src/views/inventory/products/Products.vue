<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-title>Productos</ion-title>
                <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-fab slot="fixed" vertical="bottom" horizontal="end" :edge="false" v-if="Session.getCurrentSessionSync()?.isAdmin()">
                <ion-fab-button @click="createNewProduct">
                    <ion-icon :icon="addOutline"></ion-icon>
                </ion-fab-button>
            </ion-fab>

            <section>
                <article>
                    <ion-searchbar v-model="dynamicData.query" :animated="true" placeholder="Buscar Producto"></ion-searchbar>
                </article>


                <DynamicScroller
                    :items="productsUI"
                    :min-item-size="77.4"
                    class="scroller"
                >
                    <template v-slot="{ item, index, active }">
                    <DynamicScrollerItem
                        :item="item"
                        :active="active"
                        :size-dependencies="[
                        item.message,
                        ]"
                        :data-index="index"
                    >
                        <ion-item>
                            <ion-avatar slot="start" v-if="item.image">
                                <img :src="item.image" />
                            </ion-avatar>
                            <ion-label>
                                <h2>{{ item.name }}</h2>
                                <p>{{ item.description }}</p>
                                <p>{{ item.brand }}</p>
                            </ion-label>
                        </ion-item>
                    </DynamicScrollerItem>
                    </template>
                </DynamicScroller>



                <ion-list v-if="false">
                    <ion-item v-for="product in productsUI" :key="product.id">
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
import CreateInventoryProduct from '@/dialogs/CreateInventoryProduct/CreateInventoryProduct.vue';
import { IProduct } from '@/interfaces/InventoryInterfaces';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { Dialog } from '@/utils/Dialog/Dialog';
import { Session } from '@/utils/Session/Session';
import { InventoryStore } from '@/utils/Stored/InventoryStore';
import { IonAvatar, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonProgressBar, IonSearchbar, IonTitle, IonToolbar } from '@ionic/vue';
import 'ion-peek-pop/styles.css';
import { addOutline } from 'ionicons/icons';
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';


const page = ref<HTMLElement|null>(null);
const isLoading = ref<boolean>(false);

const productsData = ref<IProduct[]>([]);


const dynamicData = ref({
    query: '',
})

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


const productsUI = computed(() => {
    return productsData.value.filter((product) => {
        if (dynamicData.value.query.trim().length > 0) {
            return product.name.toLowerCase().includes(dynamicData.value.query.toLowerCase());
        }
        return true;
    }).toSorted((a, b) => {
        return a.name.localeCompare(b.name);
    });
})

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