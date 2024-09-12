<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Importar Productos desde un Pedido</ion-title>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <article>
                <ion-accordion-group ref="accordionGroupEl">
                    <ion-accordion value="first">
                        <ion-item slot="header" color="light">
                            <ion-label>
                                <h2><b>1. Elegir pedido</b></h2>
                                <p>Selecciona el pedido que deseas importar los productos al almacén</p>
                            </ion-label>
                        </ion-item>
                        <section slot="content" class="offwhite">
                            <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                                <ion-item v-for="outcome in outcomesUI" button @click="(outcome.is_available) ? dynamicData.selectedOutcomeRequestId = (outcome.id) : undefined" :disabled="!outcome.is_available" :color="dynamicData.selectedOutcomeRequestId == (outcome.id) ? 'primary' : undefined">
                                    <ion-label>
                                        <h2><b>Pedido #00{{ outcome.id }}</b></h2>
                                        <h3><b>{{ outcome.user?.name }}</b></h3>
                                        <p>{{ outcome.date_ago }}</p>
                                        <p><b>{{ outcome.products_count }} ítems solicitados</b></p>
                                    </ion-label>
                                    <OutcomeRequestStatusChip slot="end" :request="outcome" :view-mode="'Dispacher'" />
                                    <ion-icon  slot="end" v-if="dynamicData.selectedOutcomeRequestId == (outcome.id)" :icon="checkmarkCircleOutline"></ion-icon>
                                </ion-item>
                            </ion-list>

                            <ion-label class="ion-text-center">
                                <p>Solamente los pedidos solicitados por ti y ya finalizados aparecerán</p>
                            </ion-label>
                        </section>
                    </ion-accordion>
                    <ion-accordion value="second">
                        <ion-item slot="header" color="light">
                            <ion-label>
                                <h2><b>2. Confirmar importación</b></h2>
                                <p>Confirma la importación de los productos al almacén</p>
                            </ion-label>
                        </ion-item>
                        <section slot="content">
                            <ion-list-header>Pedido seleccionado: </ion-list-header>
                            <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                                <ion-item v-if="selectedOutcomeUI">
                                    <ion-label>
                                        <h2><b>Pedido #00{{ selectedOutcomeUI.id }}</b></h2>
                                        <h3><b>{{ selectedOutcomeUI.user?.name }}</b></h3>
                                        <p>{{ selectedOutcomeUI.date_ago }}</p>
                                        <p><b>{{ selectedOutcomeUI.products_count }} ítems solicitados</b></p>
                                    </ion-label>
                                    <OutcomeRequestStatusChip slot="end" :request="selectedOutcomeUI" :view-mode="'Dispacher'" />
                                </ion-item>
                            </ion-list>

                            <ion-label class="ion-text-center" v-if="!selectedOutcomeUI">
                                <p>Aún no has seleccionado el pedido</p>
                            </ion-label>

                            <section class="ion-padding">
                                <ion-button :disabled="dynamicData.selectedOutcomeRequestId == null" color="success" @click="checkoutActions.createNewIncome" expand="block">
                                    Confirmar e Ingresar Productos
                                    <ion-icon slot="end" :icon="checkmarkCircleOutline"></ion-icon>
                                </ion-button>
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
import OutcomeRequestStatusChip from '@/components/OutcomeRequestStatusChip/OutcomeRequestStatusChip.vue';
import InventoryProductSelector from '@/dialogs/InventoryProductSelector/InventoryProductSelector.vue';
import { EInventoryWarehouseOutcomeRequestStatus, IProduct, IWarehouseOutcomeRequest } from '@/interfaces/InventoryInterfaces';
import { IUser } from '@/interfaces/UserInterfaces';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { Dialog, DialogEventEmitter } from '@/utils/Dialog/Dialog';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { Viewport } from '@/utils/Viewport/Viewport';
import { IonAccordion, IonAccordionGroup, IonButton, IonButtons, IonContent, IonListHeader, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar, alertController, toastController } from '@ionic/vue';
import { checkmarkCircleOutline } from 'ionicons/icons';
import TimeAgo from 'javascript-time-ago';
import es from 'javascript-time-ago/locale/es';
import { DateTime } from "luxon";
import { computed, onMounted, onUnmounted, ref } from 'vue';


TimeAgo.addLocale(es);
const timeAgo = new TimeAgo('es-PE');
const accordionGroupEl = ref<any>(null);
const isLoading = ref<boolean>(true);
const outcomesData = ref<IWarehouseOutcomeRequest[]>([]);
const usersData = ref<IUser[]>([]);

const props = defineProps({
    warehouseId: {
        type: Number,
        required: true
    },
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
});

const dynamicData = ref<{
    selectedOutcomeRequestId: number | null,
}>({
    selectedOutcomeRequestId: null
})

const outcomesUI = computed(() => {
    return outcomesData.value.map((outcome) => {
        return {
            ...outcome,
            date_ago: timeAgo.format(new Date(outcome.requested_at || outcome.created_at)),
            user: usersData.value.find(user => user.id === outcome.user_id),
            products_count: outcome.requested_products.reduce((acc, product) => acc + product.quantity, 0),
            original: outcome,
            is_available: outcome.inventory_warehouse_outcome_id != null && outcome.status == EInventoryWarehouseOutcomeRequestStatus.Finished
        }
    }).filter((outcome) => outcome.is_available).sort((a, b) => b.id - a.id);
});

const selectedOutcomeUI = computed(() => {
    return outcomesUI.value.find((outcome) => outcome.id == dynamicData.value.selectedOutcomeRequestId);
})

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
                        if (dynamicData.value.productsList.find((p) => p.id == product.id)){
                            return;
                        }

                        dynamicData.value.productsList.push(product);
                        dynamicData.value.productsListWithQuantity.push({
                            product,
                            quantity: 1,
                            amount: 10
                        })
                    })
                })
                $this.on('selected-with-quantity', (event:any) => {
                    const products = event.data;
                    products.forEach((product:any) => {
                        //Check if the product is already in the list:
                        if (dynamicData.value.productsList.find((p) => p.id == product.product.id)){
                            return;
                        }
                        dynamicData.value.productsList.push(product.product);
                        dynamicData.value.productsListWithQuantity.push({
                            product: product.product,
                            quantity: product.quantity,
                            amount: 10
                        })
                    })
                })
            },
        })
    }
}

const checkoutActions = {
    createNewIncome: async () => {
        const outcomeRequest = outcomesData.value.find((outcome) => outcome.id == dynamicData.value.selectedOutcomeRequestId) as IWarehouseOutcomeRequest;

        const alert = alertController.create({
            header: 'Confirmar importación',
            message: `¿Estás seguro de importar los productos del pedido #00${outcomeRequest.id} al almacén?`,
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                },
                {
                    text: 'Confirmar',
                    handler: () => {
                        checkoutActions.importProducts(outcomeRequest);
                    }
                }
            ]
        });

        await alert.then((alert) => {
            alert.present();
        });
    },
    importProducts: async (outcomeRequest: IWarehouseOutcomeRequest) => {
        isLoading.value = true;

        try {
            const response = await RequestAPI.post(`/inventory/warehouse-outcome-requests/${outcomeRequest.id}/import-products-as-income`, {
                warehouse_id: props.warehouseId,
            });
            props.emitter.fire('created', {});
            props.emitter.fire('close');

            const toast = await toastController.create({
                message: '✅ Productos ingresados exitosamente',
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

const loadOutcomes = async () => {
    isLoading.value = true;
    const response = await RequestAPI.get('/inventory/me/outcome-requests');
    usersData.value = await RequestAPI.get('/users');
    outcomesData.value = response;
    isLoading.value = false;
}

onMounted(async () => {
    loadOutcomes();
    const callbackId = AppEvents.on('inventory:reload', () => {
        loadOutcomes();
    })
    onUnmounted(() => {
        AppEvents.off('inventory:reload', callbackId);
    });
})
</script>

<style scoped lang="scss">

.offwhite{
    background-color: var(--ion-color-light-tint);
    padding-top: 10px;
    padding-bottom: 10px;
}
</style>