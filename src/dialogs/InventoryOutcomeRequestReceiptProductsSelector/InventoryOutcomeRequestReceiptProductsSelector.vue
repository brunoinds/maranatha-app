<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Revisar Recibimiento de Productos</ion-title>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <ion-list-header>
                <ion-label>
                    <h1><b>Productos</b></h1>
                    <p>Revisa la cantidad de productos que has recibido</p>
                </ion-label>
            </ion-list-header>
            <br>
            <section class="offwhite">
                <ion-list :inset="true" v-for="product in dynamicData.products" :key="product.product.id">
                    <ion-item>
                        <ion-avatar slot="start" v-if="product.product?.image">
                            <img :src="product.product?.image" />
                        </ion-avatar>
                        <ion-label>
                            <h2><b>{{ product.product.name }}</b></h2>
                            <p>{{ product.product.description }}</p>
                            <p>{{ product.product.brand }}</p>
                        </ion-label>
                    </ion-item>
                    <ion-item>
                        <ion-input label="Cantidad Enviada" :disabled="true" type="number" inputmode="numeric" :min="1" :readonly="true" v-model="product.sent" class="ion-text-right"></ion-input>
                    </ion-item>
                    <ion-item :color="product.sent == product.received ? undefined : 'danger'">
                        <ion-input label="Cantidad Recibida" type="number" inputmode="numeric" :min="1" v-model="product.received" class="ion-text-right"></ion-input>
                    </ion-item>
                </ion-list>

                <section class="ion-padding">
                    <ion-button color="success" @click="confirmReceipt" :disabled="isLoading" expand="block">
                        Confirmar recibimiento
                        <ion-icon slot="end" :icon="checkmarkCircleOutline"></ion-icon>
                    </ion-button>
                </section>
            </section>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IProduct, IWarehouse } from '@/interfaces/InventoryInterfaces';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { IonButton, IonButtons, IonContent, IonHeader, IonListHeader, IonIcon, IonInput, IonItem,IonAvatar, IonLabel, IonList, IonPage, IonProgressBar, IonSelect, IonSelectOption, IonTitle, IonToolbar, alertController, toastController } from '@ionic/vue';
import { arrowForwardCircleOutline, storefrontOutline, alertOutline, trashOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { DialogEventEmitter } from "../../utils/Dialog/Dialog";
import Warehouse from '@/views/inventory/warehouses/Warehouse.vue';



const isLoading = ref<boolean>(false);
const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
    products: {
        type: Object as () => Array<{
            product: IProduct,
            sent: number,
            received: number
        }>,
        required: true
    }
});
const dynamicData = ref<{
    products: Array<{
        product: IProduct,
        sent: number,
        received: number
    }>,
}>({
    products: props.products
});


const allProductsQuantity = computed(() => {
    return {
        sent: dynamicData.value.products.reduce((acc, product) => acc + (isNaN(parseInt(product.sent)) ? 0 : parseInt(product.sent)), 0),
        received: dynamicData.value.products.reduce((acc, product) => acc + (isNaN(parseInt(product.received)) ? 0 : parseInt(product.received)), 0),
    }
})

const confirmReceipt = async () => {
    if (allProductsQuantity.value.sent === allProductsQuantity.value.received) {
        confirmReceiptAll();
    } else {
        notReceiveAll();
    }
}

const confirmReceiptAll = async () => {
    const alert = await alertController.create({
        header: 'Todos productos recibidos',
        message: '¿Has recibido todos los productos que han sido enviados?',
        buttons: [
            {
                text: 'No',
                role: 'cancel',
            },
            {
                text: 'Sí, todos',
                handler: () => {
                    props.emitter.fire('received-all', dynamicData.value.products.map(product => {
                        return {
                            product: product.product,
                            quantity: isNaN(parseInt(product.received)) ? 0 : parseInt(product.received)
                        }
                    }));
                    props.emitter.fire('close')
                }
            }
        ]
    })
    alert.present();
}

const notReceiveAll = async () => {
    const alert = await alertController.create({
        header: 'Diferencia en productos recibidos',
        message: 'Ud. será enviado al chat con el almacén para coordinar la entrega de los productos faltantes o en exceso. ¿Seguro que no haz recibido todos los productos correctamente?',
        buttons: [
            {
                text: 'Cancelar',
                role: 'cancel',
            },
            {
                text: 'Sí, no he recibido',
                role: 'destructive',
                handler: () => {
                    props.emitter.fire('not-received-all', dynamicData.value.products.map(product => {
                        return {
                            product: product.product,
                            quantity:  isNaN(parseInt(product.received)) ? 0 : parseInt(product.received)
                        }
                    }));
                    props.emitter.fire('close')
                }
            }
        ]
    })

    alert.present();
}


onMounted(() => {

})
</script>

<style scoped lang="scss">
.offwhite{
    background-color: var(--ion-color-light-tint);
    padding-top: 10px;
    padding-bottom: 10px;
}
</style>