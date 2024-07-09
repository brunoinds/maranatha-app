<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Nuevo Producto</ion-title>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <section class="ion-padding">
                <article class="header" style="text-align: center;">
                    <br><br>
                    <ion-icon :icon="pricetagOutline" style="font-size: 94px;"  v-if="dynamicData.image.length == 0"></ion-icon>
                    <ion-avatar style="height: 128px; width: 128px;" aria-hidden="true" v-if="dynamicData.image.length > 0">
                        <img alt="" :src="dynamicData.image" />
                    </ion-avatar>
                    <ion-button size="small" fill="clear" v-if="dynamicData.image.length > 0" @click="dynamicData.image = ''">Remover foto del producto</ion-button>
                    <ion-button size="small" fill="clear" v-if="dynamicData.image.length == 0" @click="searchImage">Seleccionar foto del producto</ion-button>
                </article>
            </section>
            <ion-list :inset="true">
                <ion-item>
                    <ion-input label="Nombre" placeholder="Ej.: Acero" label-placement="stacked" v-model="dynamicData.name" :disabled="isLoading" @ion-blur="onBlurName"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input label="Descripción" placeholder="Ej.: Detalles opcionales del producto" label-placement="stacked" v-model="dynamicData.description" :disabled="isLoading"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input ref="categoryInput" label="Categoría" placeholder="Ej.: Materiales de Construcción" label-placement="stacked" v-model="dynamicData.category" :disabled="isLoading"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input ref="brandInput" label="Marca" placeholder="Ej.: Aceros Perú" label-placement="stacked" v-model="dynamicData.brand" :disabled="isLoading"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input ref="presentationInput" label="Presentación" placeholder="Ej.: Presentación opcional" label-placement="stacked" v-model="dynamicData.presentation" :disabled="isLoading"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input label="Código de barras" placeholder="Ej.: Código de barras opcional" label-placement="stacked" v-model="dynamicData.code" :disabled="isLoading"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-select label="Tipo de unidad" label-placement="stacked" interface="action-sheet" v-model="dynamicData.unit" :disabled="isLoading">
                        <ion-select-option v-for="unit in Toolbox.inventoryProductUnits()" :value="unit">{{ Toolbox.inventoryProductUnitName(unit) }}</ion-select-option>
                    </ion-select>
                </ion-item>
            </ion-list>

            <datalist id="inventory-products-categories-datatlist">
                <option v-for="item in autocompletionUI.categories" :key="item" :value="item">{{ item }}</option>
            </datalist>
            <datalist id="inventory-products-brands-datatlist">
                <option v-for="item in autocompletionUI.brands" :key="item" :value="item">{{ item }}</option>
            </datalist>
            <datalist id="inventory-products-presentations-datatlist">
                <option v-for="item in autocompletionUI.presentations" :key="item" :value="item">{{ item }}</option>
            </datalist>

            <section class="ion-padding">
                <ion-button expand="block" shape="round" size="default" style="height: 50px" @click="createProduct" :disabled="isLoading">
                    <ion-icon :icon="arrowForwardCircleOutline" slot="end"></ion-icon>
                    Crear Producto
                </ion-button>
            </section>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { IonButton, IonButtons, IonContent, IonHeader, IonInput,IonIcon, IonAvatar, IonLabel, IonSelect, IonSelectOption, IonItem, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar, alertController, toastController } from '@ionic/vue';
import { computed, onMounted, ref } from 'vue';
import { Dialog, DialogEventEmitter } from "../../utils/Dialog/Dialog";
import { arrowForwardCircleOutline, cubeOutline, cameraOutline, pricetagOutline } from 'ionicons/icons';
import { IWorker } from '@/interfaces/WorkerInterfaces';
import { EInventoryProductStatus, EInventoryProductUnitType, IProduct } from '@/interfaces/InventoryInterfaces';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import ImageSearch from '@/dialogs/ImageSearch/ImageSearch.vue';
import { InventoryStore } from '@/utils/Stored/InventoryStore';

const categoryInput = ref<any | null>(null);
const brandInput = ref<any | null>(null);
const presentationInput = ref<any | null>(null);
const page = ref<HTMLElement|null>(null);
const listProducts = ref<Array<IProduct>>([]);

const autocompletionUI = computed(() => {
    return {
        categories: listProducts.value.map((product) => product.category).filter((value, index, self) => self.indexOf(value) === index),
        brands: listProducts.value.map((product) => product.brand).filter((value, index, self) => self.indexOf(value) === index),
        presentations: listProducts.value.map((product) => product.presentation).filter((value, index, self) => self.indexOf(value) === index),
    }
});


const isLoading = ref<boolean>(false);
const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    }
});

const dynamicData = ref<{
    name: string,
    description: string,
    category: string,
    brand: string,
    presentation: string,
    unit: EInventoryProductUnitType,
    code: string,
    status: EInventoryProductStatus,
    image: string,
    isLoadingImage: boolean
}>({
    name: '',
    description: '',
    category: '',
    brand: '',
    presentation: '',
    unit: EInventoryProductUnitType.Units,
    code: '',
    status: EInventoryProductStatus.Active,
    image: '',
    isLoadingImage: false
});


const onBlurName = async () => {
    if (dynamicData.value.image.length > 0){
        return;
    }

    if (dynamicData.value.name.trim().length == 0){
        return;
    }

    if (dynamicData.value.isLoadingImage){
        return;
    }

    dynamicData.value.isLoadingImage = true;
    const imageResult = await RequestAPI.get('/inventory/product-image-search', {
        query: dynamicData.value.name
    });
    dynamicData.value.isLoadingImage = false;

    if (imageResult.length > 0){
        dynamicData.value.image = imageResult[0];
    }
}
const createProduct = async () => {
    const validationResponse = validateCamps();

    if (!validationResponse.isValid){
        alertController.create({
            header: 'Oops...',
            message: validationResponse.errors[0] as string,
            buttons: ['OK']
        }).then((alert) => {
            alert.present();
        });
        return;
    }


    isLoading.value = true;


    const dataParsed = {
        name: dynamicData.value.name,
        description: dynamicData.value.description || null,
        category: dynamicData.value.category || null,
        brand: dynamicData.value.brand || null,
        presentation: dynamicData.value.presentation || null,
        unit: dynamicData.value.unit,
        code: dynamicData.value.code || null,
        status: dynamicData.value.status,
        image: dynamicData.value.image || null
    }

    RequestAPI.post('/inventory/products', dataParsed).then(async (response) => {
        await InventoryStore.refreshProducts();
        props.emitter.fire('created', {});
        props.emitter.fire('close');

        toastController.create({
            message: '✅ Producto creado exitosamente',
            duration: 2000
        }).then(async (toast) => {
            await toast.present();
        });
    }).catch((error) => {
        alertController.create({
            header: 'Oops...',
            message: error.response.message,
            buttons: ['OK']
        }).then(async (alert) => {
            await alert.present();
        });
    }).finally(() => {
        isLoading.value = false;
    });
}
const loadProducts = async () => {
    listProducts.value = await InventoryStore.getProducts();
}

const validateCamps = () => {
    let errors:Array<string> = [];

    if (dynamicData.value.name.trim().length == 0){
        errors.push("Por favor, ingresa el nombre del producto");
    }

    return {
        isValid: errors.length == 0,
        errors: errors
    }
}

const searchImage = () => {
    Dialog.show(ImageSearch, {
        props: {
            query: dynamicData.value.name
        },
        onLoaded($this) {
            $this.on('choose-src', (event:any) => {
                dynamicData.value.image = event.data
            })
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        }
    })
}

onMounted(() => {
    setTimeout(() => {
        categoryInput.value.$el.nativeInput.setAttribute('list', 'inventory-products-categories-datatlist');
        brandInput.value.$el.nativeInput.setAttribute('list', 'inventory-products-brands-datatlist');
        presentationInput.value.$el.nativeInput.setAttribute('list', 'inventory-products-presentations-datatlist');
    }, 500);

    loadProducts();
})
</script>

<style scoped lang="scss">

.header{
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 10px;
}
</style>