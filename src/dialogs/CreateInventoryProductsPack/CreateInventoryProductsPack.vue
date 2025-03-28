<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Nuevo Pack de Productos</ion-title>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <article>
                <ion-accordion-group ref="accordionGroupEl">
                    <ion-accordion value="first">
                        <ion-item slot="header" color="light">
                            <ion-label>
                                <h2><b>1. Agregar productos</b></h2>
                                <p>Selecciona los productos que harán parte del pack</p>
                            </ion-label>
                        </ion-item>
                        <section slot="content" class="offwhite">
                            <ion-list :inset="true" v-for="(product) in dynamicData.products" :key="product.product.id">
                                <ion-item>
                                    <ion-avatar slot="start" v-if="product.product.image">
                                        <img :src="product.product.image" />
                                    </ion-avatar>
                                    <ion-label>
                                        <h2><b>{{ product.product.name }}</b></h2>
                                        <p>{{ product.product.description }}</p>
                                        <p>{{ product.product.brand }}</p>
                                    </ion-label>
                                </ion-item>
                                <ion-item>
                                        <ion-input label="Cantidad" type="number" inputmode="decimal" :min="1" v-model="product.quantity" class="ion-text-right"></ion-input>
                                    </ion-item>
                                <ion-item button :detail="false" @click="actions.removeProduct(product.product)">
                                    <ion-label color="danger" class="ion-text-center">Eliminar producto</ion-label>
                                </ion-item>
                            </ion-list>

                            <section class="ion-padding">
                                <ion-button @click="actions.addNewProduct" expand="block" fill="outline">
                                    <ion-icon slot="end" :icon="bagAddOutline"></ion-icon>
                                    Agregar Produto al Pack</ion-button>
                            </section>
                        </section>
                    </ion-accordion>
                    <ion-accordion value="second">
                        <ion-item slot="header" color="light">
                            <ion-label>
                                <h2><b>2. Datos del Pack</b></h2>
                                <p>Ingresa los datos del pack de productos</p>
                            </ion-label>
                        </ion-item>
                        <section slot="content">
                            <ion-list>
                                <ion-item>
                                    <ion-input :label="'Nombre del Pack de Productos:'" label-placement="stacked" placeholder="Pack de Productos Sin Nombre" v-model="dynamicData.name"></ion-input>
                                </ion-item>
                            </ion-list>

                            <section class="ion-padding">
                                <ion-button :disabled="dynamicData.products.length == 0" color="success" @click="checkoutActions.createNewProductsPack" expand="block">
                                    Confirmar y Crear Pack de Productos
                                    <ion-icon slot="end" :icon="checkmarkCircleOutline"></ion-icon>
                                </ion-button>

                                <ion-label class="ion-text-center" v-if="dynamicData.products.length == 0">
                                    <br>
                                    <p>Por favor, agrega al menos 1 producto</p>
                                </ion-label>
                            </section>
                        </section>
                    </ion-accordion>
                </ion-accordion-group>
            </article>
            <br><br><br><br><br><br><br><br><br><br><br><br>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import InventoryProductSelector from '@/dialogs/InventoryProductSelector/InventoryProductSelector.vue';
import { IProduct } from '@/interfaces/InventoryInterfaces';
import { Dialog, DialogEventEmitter } from '@/utils/Dialog/Dialog';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { InventoryStore } from '@/utils/Stored/InventoryStore';
import { IonAccordion, IonAccordionGroup, IonAvatar, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar, alertController, toastController } from '@ionic/vue';
import { bagAddOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';

const accordionGroupEl = ref<any>(null);
const isLoading = ref<boolean>(true);


const dynamicData = ref<{
    name: string,
    products: Array<{
        product: IProduct,
        quantity: number
    }>
}>({
    name: "",
    products: []
})
const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
});




const validateData = async () => {
    const formErrors: Array<{field: string, message: string}> = [];

    if (dynamicData.value.name.trim() == ""){
        formErrors.push({
            field: "name",
            message: "Ingresa un nombre para el pack de productos"
        })
    }
    if (dynamicData.value.products.length == 0){
        formErrors.push({
            field: "products",
            message: "Al menos un producto es requerido"
        })
    }
    

    if (formErrors.length > 0){
        return {
            isValid: false,
            errors: formErrors
        };
    }else{
        return {
            isValid: true,
            errors: []
        };
    }
}

const actions = {
    addNewProduct: () => {
        Dialog.show(InventoryProductSelector, {
            props: {
                allowMultipleSelection: true
            },
            onLoaded($this) {
                $this.on('selected', (event:any) => {
                    const products = event.data;
                    products.forEach((product:IProduct) => {
                        if (dynamicData.value.products.find((productItem) => productItem.product.id == product.id)){
                            return;
                        }
                        dynamicData.value.products.push({
                            product: product,
                            quantity: 1
                        })
                    })
                })
            },
        })
    },
    removeProduct: (product: IProduct) => {
        dynamicData.value.products = dynamicData.value.products.filter((productData) => productData.product.id != product.id);
    }
}

const checkoutActions = {
    createNewProductsPack: async () => {
        const validationResponse = validateData();
        if (!(await validationResponse).isValid){
            alertController.create({
                header: "Oops...",
                subHeader: "Hay errores en el formulario",
                message: (await validationResponse).errors[0].message,
                buttons: ["OK"]
            }).then((alert) => {
                alert.present();
            })
            return;
        }

        isLoading.value = true;
        const form = {
            name: dynamicData.value.name,
            products: dynamicData.value.products.map((productData) => {
                return {
                    product_id: productData.product.id,
                    quantity: parseFloat(productData.quantity as any)
                }
            })
        }

        try {
            const response = await RequestAPI.post(`/inventory/products-packs`, form)
            await InventoryStore.refreshProductsPacks();
            props.emitter.fire('created', {});
            props.emitter.fire('close');

            const toast = await toastController.create({
                message: '✅ Pack de productos creado con éxito',
                duration: 2000
            })
            await toast.present();
        } catch (error) {
            alertController.create({
                header: 'Oops...',
                message: error.response.message,
                buttons: ['OK']
            }).then(async (alert) => {
                await alert.present();
            });
        }
        isLoading.value = false;
    }
}

const productsData = ref<IProduct[]>([]);

const loadProducts = async () => {
    isLoading.value = true;
    const response = await InventoryStore.getProducts();
    productsData.value = response;
    isLoading.value = false;
}

onMounted(async () => {
    isLoading.value = true;
    await loadProducts();
    setTimeout(() => {
        accordionGroupEl.value.$el.value = "first";
    }, 100);
})
</script>

<style scoped lang="scss">

.offwhite{
    background-color: var(--ion-color-light-tint);
    padding-top: 10px;
    padding-bottom: 10px;
}
</style>