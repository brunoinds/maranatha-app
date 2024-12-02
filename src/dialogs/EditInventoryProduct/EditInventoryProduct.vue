<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Editar Producto</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="save()">Guardar</ion-button>
                </ion-buttons>
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


                <IonTextSelectionInput label="Categoría" placeholder="Ej.: Materiales de Construcción" label-placement="stacked" :value="dynamicData.category" v-model="dynamicData.category" :disabled="isLoading" :items="autocompletionUI.categories"></IonTextSelectionInput>

                <IonTextSelectionInput label="Subcategoría" placeholder="Ej.: Materiales de Construcción" label-placement="stacked" :value="dynamicData.sub_category" v-model="dynamicData.sub_category" :disabled="isLoading" :items="autocompletionUI.sub_categories"></IonTextSelectionInput>

                <IonTextSelectionInput label="Marca" placeholder="Ej.: Aceros Perú" label-placement="stacked" v-model="dynamicData.brand" :value="dynamicData.brand" :disabled="isLoading" :items="autocompletionUI.brands"></IonTextSelectionInput>

                <IonTextSelectionInput label="Presentación" placeholder="Ej.: Presentación opcional" label-placement="stacked" :value="dynamicData.presentation" v-model="dynamicData.presentation" :disabled="isLoading" :items="autocompletionUI.presentations"></IonTextSelectionInput>


                <ion-item>
                    <ion-input label="Código de barras" placeholder="Ej.: Código de barras opcional" label-placement="stacked" v-model="dynamicData.code" :disabled="isLoading"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-select label="Tipo de unidad" label-placement="stacked" interface="action-sheet" v-model="dynamicData.unit" :disabled="isLoading" @ion-change="onChangeUnit">
                        <ion-select-option v-for="unit in Toolbox.inventoryProductUnits()" :value="unit">{{ Toolbox.inventoryProductUnitName(unit) }}</ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item>
                    <ion-input label="¿Es prestable?" label-placement="stacked" :readonly="true" :value="dynamicData.is_loanable  ? 'Sí' : 'No'" :disabled="isLoading"></ion-input>
                    <ion-toggle slot="end" :enable-on-off-labels="true" v-model="dynamicData.is_loanable" :disabled="isLoading || getUnitNature(dynamicData.unit) == 'Float'"></ion-toggle>
                </ion-item>
                <ion-item>
                    <ion-select label="Almacenes" label-placement="stacked" interface="action-sheet" v-model="dynamicData.inventory_warehouses_ids" :multiple="true" :disabled="isLoading">
                        <ion-select-option v-for="warehouse in listWarehouses" :value="warehouse.id">{{ warehouse.name }}</ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item>
                    <ion-input label="Url foto" placeholder="" label-placement="stacked" v-model="dynamicData.image" :disabled="isLoading"></ion-input>
                </ion-item>
            </ion-list>

            <section class="ion-padding">
                <ion-button expand="block" shape="round" color="danger" size="default" style="height: 50px" @click="deleteProduct" :disabled="isLoading && Session.getCurrentSessionSync()?.roles().includes('admin')">
                    <ion-icon :icon="trashOutline" slot="end"></ion-icon>
                    Borrar producto
                </ion-button>
                <ion-label class="ion-text-center">
                    <br>
                    <p>Solamente el administrador puede borrar productos</p>
                </ion-label>
            </section>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import ImageSearch from '@/dialogs/ImageSearch/ImageSearch.vue';
import { EInventoryProductStatus, EInventoryProductUnitType, getUnitNature, IProduct, IWarehouse } from '@/interfaces/InventoryInterfaces';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import { IonAvatar, IonButton, IonButtons, IonContent, IonHeader, IonToggle, IonIcon, IonLabel, IonInput, IonItem, IonList, IonPage, IonProgressBar, IonSelect, IonSelectOption, IonTitle, IonToolbar, alertController, toastController } from '@ionic/vue';
import { pricetagOutline, trashOutline } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { Dialog, DialogEventEmitter } from "../../utils/Dialog/Dialog";
import { Session } from '@/utils/Session/Session';
import { InventoryStore } from '@/utils/Stored/InventoryStore';
import IonTextSelectionInput from '@/components/IonTextSelectionInput/IonTextSelectionInput.vue';

const categoryInput = ref<any | null>(null);
const subcategoryInput = ref<any|null>(null);
const brandInput = ref<any | null>(null);
const presentationInput = ref<any | null>(null);
const page = ref<HTMLElement|null>(null);
const listProducts = ref<Array<IProduct>>([]);
const listWarehouses = ref<Array<IWarehouse>>([]);

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
    },
    product: {
        type: Object as () => IProduct,
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
    is_loanable: boolean,
    inventory_warehouses_ids: number[]
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
    is_loanable: false,
    inventory_warehouses_ids: []
});

dynamicData.value = {
    name: props.product.name,
    description: props.product.description || '',
    category: props.product.category || '',
    sub_category: props.product.sub_category || '',
    brand: props.product.brand || '',
    presentation: props.product.presentation || '',
    unit: props.product.unit,
    code: props.product.code || '',
    status: props.product.status,
    image: props.product.image || '',
    isLoadingImage: false,
    is_loanable: props.product.is_loanable,
    inventory_warehouses_ids: props.product.inventory_warehouses_ids
}


const onBlurName = async () => {
    return;
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
const save = async () => {
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

    const doOperation = () => {
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
            is_loanable: dynamicData.value.is_loanable,
            inventory_warehouses_ids: dynamicData.value.inventory_warehouses_ids
        }

        RequestAPI.put('/inventory/products/' + props.product.id , dataParsed).then(async (response) => {
            await InventoryStore.refreshProducts();
            props.emitter.fire('updated', {});
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

    if (getUnitNature(dynamicData.value.unit) != getUnitNature(props.product.unit)){
        if ((getUnitNature(dynamicData.value.unit) == 'Float')){
            const alert = await alertController.create({
                header: '¡Atención!',
                message: 'Al cambiar la unidad de este producto a una unidad de tipo decimal, el producto no podrá ser prestado. Todos los préstamos registrados de este producto, así como sus entradas y salidas serán borradas permanentemente. ¿Estás seguro de continuar?',
                buttons: [
                    {
                        text: 'Cancelar',
                        role: 'cancel'
                    },
                    {
                        text: 'Continuar',
                        role: 'destructive',
                        handler: () => {
                            doOperation();
                        }
                    }
                ]
            })

            await alert.present();
        }else if (getUnitNature(dynamicData.value.unit) == 'Integer'){
            const alert = await alertController.create({
                header: '¡Atención!',
                message: 'Al cambiar la unidad de este producto a una unidad de tipo entero, todas las entradas y salidas de este producto serán borradas permanentemente. ¿Estás seguro de continuar?',
                buttons: [
                    {
                        text: 'Cancelar',
                        role: 'cancel'
                    },
                    {
                        text: 'Continuar',
                        role: 'destructive',
                        handler: () => {
                            doOperation();
                        }
                    }
                ]
            })

            await alert.present();
        }
    }else{
        doOperation();
    }

}

const deleteProduct = async () => {
    alertController.create({
        header: '⚠️ Operación de Alto Riesgo ⚠️',
        message: 'Al borrar este producto, todas las operaciones relacionadas a este producto serán afectadas. ¿Estás seguro de borrar este producto?',
        buttons: [
            {
                text: 'Cancelar',
                role: 'cancel'
            },
            {
                text: 'Borrar',
                role: 'destructive',
                handler: async () => {
                    isLoading.value = true;
                    RequestAPI.delete('/inventory/products/' + props.product.id).then(async (response) => {
                        await InventoryStore.refreshProducts();
                        props.emitter.fire('deleted', {});
                        props.emitter.fire('close');

                        toastController.create({
                            message: '✅ Producto borrado exitosamente',
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
            }
        ]
    }).then(async (alert) => {
        await alert.present();
    });
}
const loadProducts = async () => {
    isLoading.value = true;
    listProducts.value = await InventoryStore.getProducts();
    isLoading.value = false;
}
const loadWarehouses = async () => {
    isLoading.value = true;
    listWarehouses.value = await InventoryStore.getWarehouses();
    isLoading.value = false;
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

const onChangeUnit = () => {
    if (getUnitNature(dynamicData.value.unit) == 'Float'){
        dynamicData.value.is_loanable = false;
    }
}

onMounted(() => {
    loadProducts();
    loadWarehouses();
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