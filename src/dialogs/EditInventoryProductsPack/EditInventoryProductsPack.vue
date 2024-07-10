<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Pack de Productos</ion-title>
                <ion-buttons slot="end">
                    <ion-button v-if="dynamicData.products.length > 0" @click="checkoutActions.save()">Guardar</ion-button>
                </ion-buttons>
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
                            <ion-list v-if="!isLoading" :inset="true" v-for="(product) in dynamicData.products" :key="product.product.id">
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
                                        <ion-input label="Cantidad" type="number" inputmode="numeric" :min="1" v-model="product.quantity" class="ion-text-right"></ion-input>
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
                                <ion-button :disabled="isLoading" color="danger" @click="checkoutActions.delete" expand="block">
                                    Borrar Pack de Productos
                                    <ion-icon slot="end" :icon="trashOutline"></ion-icon>
                                </ion-button>
                            </section>
                        </section>
                    </ion-accordion>
                </ion-accordion-group>
            </article>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import InventoryProductSelector from '@/dialogs/InventoryProductSelector/InventoryProductSelector.vue';
import { INewProductsPack, IProduct, IProductsPack } from '@/interfaces/InventoryInterfaces';
import { Dialog, DialogEventEmitter } from '@/utils/Dialog/Dialog';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { InventoryStore } from '@/utils/Stored/InventoryStore';
import { IonAccordion, IonAccordionGroup, IonAvatar, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar, alertController, toastController } from '@ionic/vue';
import { bagAddOutline, trashOutline } from 'ionicons/icons';
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
const productsData = ref<IProduct[]>([]);

const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
    productsPack: {
        type: Object as () => IProductsPack,
        required: true
    }
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
    save: async () => {
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
                    quantity: parseInt(productData.quantity as any)
                }
            })
        }

        try {
            const response = await RequestAPI.put(`/inventory/products-packs/${props.productsPack.id}`, form)
            await InventoryStore.refreshProductsPacks();
            props.emitter.fire('updated', {});
            props.emitter.fire('close');

            const toast = await toastController.create({
                message: '✅ Pack de productos guardado con éxito',
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
    },
    delete: async () => {
        //Add alertController to confirm delete
        const alert = await alertController.create({
            header: 'Eliminar Pack de Productos',
            message: '¿Estás seguro de que deseas eliminar este pack de productos?',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel'
                },
                {
                    text: 'Eliminar pack',
                    role: 'destructive',
                    handler: () => {
                        deletePack();
                    }
                }
            ]
        });

        await alert.present();



        async function deletePack(){
            isLoading.value = true;
            try {
                const response = await RequestAPI.delete(`/inventory/products-packs/${props.productsPack.id}`);
                await InventoryStore.refreshProductsPacks();
                props.emitter.fire('deleted', {});
                props.emitter.fire('close');

                const toast = await toastController.create({
                    message: '✅ Pack de productos eliminado con éxito',
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
    },
}


const loadProducts = async () => {
    const response = await InventoryStore.getProducts();
    productsData.value = response;
}

onMounted(async () => {
    isLoading.value = true;
    await loadProducts();
    setTimeout(() => {
        accordionGroupEl.value.$el.value = "first";
    }, 100);

    dynamicData.value.name = props.productsPack.name;
    dynamicData.value.products = props.productsPack.products.map((productItem) => {
        return {
            product: productsData.value.find((product) => product.id == productItem.product_id) as IProduct,
            quantity: productItem.quantity
        }
    })
    isLoading.value = false;
})
</script>

<style scoped lang="scss">

.offwhite{
    background-color: var(--ion-color-light-tint);
    padding-top: 10px;
    padding-bottom: 10px;
}
</style>