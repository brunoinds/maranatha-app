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

                <IonTextSelectionInput label="Categoría" placeholder="Ej.: Materiales de Construcción" label-placement="stacked" v-model="dynamicData.category" :value="dynamicData.category" :disabled="isLoading" :items="autocompletionUI.categories"></IonTextSelectionInput>

                <IonTextSelectionInput label="Subcategoría" placeholder="Ej.: Materiales de Construcción" label-placement="stacked" v-model="dynamicData.sub_category" :value="dynamicData.sub_category" :disabled="isLoading" :items="autocompletionUI.sub_categories"></IonTextSelectionInput>

                <IonTextSelectionInput label="Marca" placeholder="Ej.: Aceros Perú" label-placement="stacked" v-model="dynamicData.brand" :disabled="isLoading" :value="dynamicData.brand" :items="autocompletionUI.brands"></IonTextSelectionInput>

                <IonTextSelectionInput label="Presentación" placeholder="Ej.: Presentación opcional" label-placement="stacked" v-model="dynamicData.presentation" :value="dynamicData.presentation" :disabled="isLoading" :items="autocompletionUI.presentations"></IonTextSelectionInput>

                <ion-item>
                    <ion-input label="Código de barras" placeholder="Ej.: Código de barras opcional" label-placement="stacked" v-model="dynamicData.code" :disabled="isLoading"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-select label="Tipo de unidad" label-placement="stacked" interface="action-sheet" v-model="dynamicData.unit" :disabled="isLoading">
                        <ion-select-option v-for="unit in Toolbox.inventoryProductUnits()" :value="unit">{{ Toolbox.inventoryProductUnitName(unit) }}</ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item>
                    <ion-input label="¿Es prestable?" label-placement="stacked" :readonly="true" :value="dynamicData.is_loanable ? 'Sí' : 'No'" :disabled="isLoading"></ion-input>
                    <ion-toggle slot="end" :enable-on-off-labels="true" v-model="dynamicData.is_loanable" :disabled="isLoading"></ion-toggle>
                </ion-item>
                <ion-item>
                    <ion-input label="Url foto" placeholder="" label-placement="stacked" v-model="dynamicData.image" :disabled="isLoading"></ion-input>
                </ion-item>
            </ion-list>

            <section class="ion-padding">
                <ion-button expand="block" shape="round" size="default" style="height: 50px" @click="createProduct" :disabled="isLoading">
                    <ion-icon :icon="arrowForwardCircleOutline" slot="end"></ion-icon>
                    Crear Producto
                </ion-button>
            </section>


            <br><br><br><br><br><br><br><br><br><br><br><br>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { IonButton, IonButtons, IonContent, IonHeader, IonToggle, IonInput,IonIcon, IonAvatar, IonLabel, IonSelect, IonSelectOption, IonItem, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar, alertController, toastController } from '@ionic/vue';
import { computed, onMounted, ref } from 'vue';
import { Dialog, DialogEventEmitter } from "../../utils/Dialog/Dialog";
import { arrowForwardCircleOutline, cubeOutline, cameraOutline, pricetagOutline } from 'ionicons/icons';
import { IWorker } from '@/interfaces/WorkerInterfaces';
import { EInventoryProductStatus, EInventoryProductUnitType, IProduct } from '@/interfaces/InventoryInterfaces';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import ImageSearch from '@/dialogs/ImageSearch/ImageSearch.vue';
import { InventoryStore } from '@/utils/Stored/InventoryStore';
import IonTextSelectionInput from '@/components/IonTextSelectionInput/IonTextSelectionInput.vue';

const categoryInput = ref<any | null>(null);
const subcategoryInput = ref<any|null>(null);
const brandInput = ref<any | null>(null);
const presentationInput = ref<any | null>(null);
const page = ref<HTMLElement|null>(null);
const listProducts = ref<Array<IProduct>>([]);

const autocompletionUI = computed(() => {
    return {
        categories: listProducts.value.map((product) => product.category).filter((value, index, self) => self.indexOf(value) === index).map((item) => {
            return {
                name: item,
                value: item
            }
        }).filter((item) => item.name?.length > 0).toSorted((a, b) => a.name.localeCompare(b.name)),
        sub_categories: listProducts.value.map((product) => product.sub_category).filter((value, index, self) => self.indexOf(value) === index).map((item) => {
            return {
                name: item,
                value: item
            }
        }).filter((item) => item.name?.length > 0).toSorted((a, b) => a.name.localeCompare(b.name)),
        brands: listProducts.value.map((product) => product.brand).filter((value, index, self) => self.indexOf(value) === index).map((item) => {
            return {
                name: item,
                value: item
            }
        }).filter((item) => item.name?.length > 0).toSorted((a, b) => a.name.localeCompare(b.name)),
        presentations: listProducts.value.map((product) => product.presentation).filter((value, index, self) => self.indexOf(value) === index).map((item) => {
            return {
                name: item,
                value: item
            }
        }).filter((item) => item.name?.length > 0),
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
    sub_category: string,
    brand: string,
    presentation: string,
    unit: EInventoryProductUnitType,
    code: string,
    status: EInventoryProductStatus,
    image: string,
    isLoadingImage: boolean,
    is_loanable: boolean
}>({
    name: '',
    description: '',
    category: '',
    sub_category: '',
    brand: '',
    presentation: '',
    unit: EInventoryProductUnitType.Units,
    code: '',
    status: EInventoryProductStatus.Active,
    image: '',
    isLoadingImage: false,
    is_loanable: false
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
        sub_category: dynamicData.value.sub_category || null,
        brand: dynamicData.value.brand || null,
        presentation: dynamicData.value.presentation || null,
        unit: dynamicData.value.unit,
        code: dynamicData.value.code || null,
        status: dynamicData.value.status,
        image: dynamicData.value.image || null,
        is_loanable: dynamicData.value.is_loanable
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