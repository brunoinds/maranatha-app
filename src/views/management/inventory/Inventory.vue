<template>
    <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>

    <section>
        <header class="ion-padding">
            <ion-segment :scrollable="true" :value="subSegmentValue" v-model="subSegmentValue">
                <ion-segment-button v-for="subSection in subSections" :value="subSection.id" :key="subSection.id">
                    <ion-label>{{ subSection.title }}</ion-label>
                </ion-segment-button>
            </ion-segment>
        </header>
        <main class="content">
            <section>
                <main>
                    <article v-if="subSegmentValue == 'Almacenes'" class="limiter">
                        <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                            <ion-item v-for="warehouse in warehousesData" button @click="openWarehouse(warehouse)">
                                <ion-icon :icon="storefrontOutline" style="font-size: 34px;" slot="start" color="primary"></ion-icon>
                                <ion-label>
                                    <h2><b>{{ warehouse.name }}</b></h2>
                                    <h3>{{ warehouse.zone }}</h3>
                                    <p>{{ warehouse.country }}</p>
                                </ion-label>
                            </ion-item> 
                        </ion-list>


                        <ion-fab slot="fixed" vertical="bottom" horizontal="end" :edge="false">
                            <ion-fab-button @click="createWarehouse">
                                <ion-icon :icon="addOutline"></ion-icon>
                            </ion-fab-button>
                        </ion-fab>
                    </article>

                    <article v-if="subSegmentValue == 'Productos'" class="limiter">
                        <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                            <ion-item  button v-for="product in productsData" :key="product.id" @click="editProduct(product)">
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

                        <ion-fab slot="fixed" vertical="bottom" horizontal="end" :edge="false">
                            <ion-fab-button @click="createProduct">
                                <ion-icon :icon="addOutline"></ion-icon>
                            </ion-fab-button>
                        </ion-fab>
                    </article>

                    <article v-if="subSegmentValue == 'Pack de Productos'" class="limiter">
                        <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                            <ion-item v-for="productPack in productsPacksData" button :key="productPack.id" @click="editProductsPack(productPack)">
                                <ion-icon :icon="logoDropbox" slot="start"></ion-icon>

                                <ion-label>
                                    <h2>{{ productPack.name }}</h2>
                                    <p>{{ productPack.products.length }} productos en este pack</p>
                                </ion-label>
                            </ion-item>
                        </ion-list>


                        <ion-fab slot="fixed" vertical="bottom" horizontal="end" :edge="false">
                            <ion-fab-button @click="createProductsPack">
                                <ion-icon :icon="addOutline"></ion-icon>
                            </ion-fab-button>
                        </ion-fab>
                    </article>
                </main>
            </section>
        </main>
    </section>
</template>

<script setup lang="ts">
import CreateInventoryProduct from '@/dialogs/CreateInventoryProduct/CreateInventoryProduct.vue';
import CreateInventoryProductsPack from '@/dialogs/CreateInventoryProductsPack/CreateInventoryProductsPack.vue';
import CreateWarehouse from '@/dialogs/CreateWarehouse/CreateWarehouse.vue';
import EditInventoryProduct from '@/dialogs/EditInventoryProduct/EditInventoryProduct.vue';
import EditInventoryProductsPack from '@/dialogs/EditInventoryProductsPack/EditInventoryProductsPack.vue';
import { IProduct, IProductsPack, IWarehouse } from '@/interfaces/InventoryInterfaces';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { Dialog } from '@/utils/Dialog/Dialog';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { Viewport } from '@/utils/Viewport/Viewport';
import { IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonSegment, IonSegmentButton, IonProgressBar } from '@ionic/vue';
import { addOutline, logoDropbox, storefrontOutline } from 'ionicons/icons';
import TimeAgo from 'javascript-time-ago';
import es from 'javascript-time-ago/locale/es';
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLoading = ref<boolean>(false);
const subSegmentValue = ref<string>('Almacenes');
const subSections = ref([
    {
        id: 'Almacenes',
        title: '🏭 Almacenes',
    },
    {
        id: 'Productos',
        title: '🛠 Productos',
    },
    {
        id: 'Pack de Productos',
        title: '🧰 Pack de Productos',
    }
]);
const warehousesData = ref<IWarehouse[]>([]);
const productsData = ref<IProduct[]>([]);
const productsPacksData = ref<IProductsPack[]>([]);

const openWarehouse = (warehouse: IWarehouse) => {
    router.push(`/inventory/warehouses/${warehouse.id}`);
}

const createWarehouse = () => {
    Dialog.show(CreateWarehouse, {
        props: {
            
        },
        onLoaded($this) {
            $this.on('created', (event:any) => {
                AppEvents.emit('inventory:reload')
            })
        },
        modalControllerOptions: {
            
        }
    })
}
const createProduct = () => {
    Dialog.show(CreateInventoryProduct, {
        onLoaded($this) {
            $this.on('created', (event:any) => {
                AppEvents.emit('inventory:reload')
            })
        },
        modalControllerOptions: {
            
        }
    })
}
const createProductsPack = () => {
    Dialog.show(CreateInventoryProductsPack, {
        onLoaded($this) {
            $this.on('created', (event:any) => {
                AppEvents.emit('inventory:reload')
            })
        },
        modalControllerOptions: {
            
        }
    })
}
const editProductsPack = (productsPack: IProductsPack) => {
    Dialog.show(EditInventoryProductsPack, {
        props: {
            productsPack
        },
        onLoaded($this) {
            $this.on('deleted', (event:any) => {
                AppEvents.emit('inventory:reload')
            })
            $this.on('updated', (event:any) => {
                AppEvents.emit('inventory:reload')
            })
        },
        modalControllerOptions: {
            
        }
    })
}
const editProduct = (product: IProduct) => {
    Dialog.show(EditInventoryProduct, {
        props: {
            product
        },
        onLoaded($this) {
            $this.on('deleted', (event:any) => {
                AppEvents.emit('inventory:reload')
            })
            $this.on('updated', (event:any) => {
                AppEvents.emit('inventory:reload')
            })
        },
        modalControllerOptions: {
            
        }
    })
}

const loadWarehouses = async () => {
    isLoading.value = true;
    try {
        const response = await RequestAPI.get('/inventory/warehouses');
        warehousesData.value = response;

    } catch (error) {
    }
    isLoading.value = false;
}
const loadProducts = async () => {
    isLoading.value = true;
    try {
        const response = await RequestAPI.get('/inventory/products');
        productsData.value = response;

    } catch (error) {
    }
    isLoading.value = false;
}
const loadProductsPacks = async () => {
    isLoading.value = true;
    try {
        const response = await RequestAPI.get('/inventory/products-packs');
        productsPacksData.value = response;
    } catch (error) {
    }
    isLoading.value = false;
}

onMounted(() => {
    loadWarehouses();
    loadProducts();
    loadProductsPacks();


    const callbackId = AppEvents.on('inventory:reload', () => {
        loadWarehouses();
        loadProducts();
        loadProductsPacks();
    })
    onUnmounted(() => {
        AppEvents.off('inventory:reload', callbackId);
    })
})
</script>

<style scoped lang="scss">
.content{
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
}
</style>

