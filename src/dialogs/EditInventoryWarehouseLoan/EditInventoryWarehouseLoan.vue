<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="emitter.fire('close')">Cerrar</ion-button>
                </ion-buttons>
                <ion-title>Préstamo de Producto #00{{ (productItemLoan) ? productItemLoan.id : productItemLoanId }}</ion-title>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <article v-if="loan && dataUI">
                <ion-list-header  :style="Viewport.data.value.deviceSetting != 'DesktopLandscape' ? 'margin-bottom: 10px;' : undefined">Producto</ion-list-header>
                <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                    <ion-item button @click="openProductItemView">
                        <ion-avatar slot="start" v-if="loan.product_item?.product.image">
                            <img :src="loan.product_item?.product.image" />
                        </ion-avatar>
                        <ion-label>
                            <h2><b>{{ loan.product_item?.product.name }}</b></h2>
                            <p>{{ loan.product_item?.product.description }}</p>
                            <p>{{ loan.product_item?.product.brand }}</p>
                            <p>S/N: {{ loan.product_item?.batch }}</p>
                        </ion-label>
                        <ProductItemLoanStatusChip slot="end" :request="loan" />
                    </ion-item>

                    <ion-item button @click="seeOutcomeRequest" v-if="loan.inventory_warehouse_outcome_request_id">
                        <ion-icon color="primary" slot="start" :icon="fileTrayFullOutline"></ion-icon>
                        <ion-label color="primary" >
                            <h2>Ver pedido</h2>
                        </ion-label>
                    </ion-item>

                    

                    <ion-item button @click="openProductItemView"  v-if="dataUI.isMeLoaner">
                        <ion-icon color="primary" slot="start" :icon="albumsOutline"></ion-icon>
                        <ion-label color="primary" >
                            <h2>Ver ítem en stock</h2>
                        </ion-label>
                    </ion-item>
                </ion-list>
                
                <br>




                <ion-accordion-group ref="accordionGroupEl">
                    <ion-accordion value="first">
                        <ion-item slot="header" color="light">
                            <ion-label>
                                <h2><b>1. Datos del préstamo</b></h2>
                                <p>Datos referente a la compra de los productos</p>
                            </ion-label>
                        </ion-item>
                        <section slot="content">
                            <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                                <ion-item v-if="dataUI.loaned_at">
                                    <ion-icon slot="start" :icon="personOutline"></ion-icon>
                                    <ion-input label="Prestado por:" label-placement="stacked" placeholder="Descripcion" :value="dataUI.loaned_by.name" :readonly="true"></ion-input>
                                </ion-item>
                                <ion-item v-if="dataUI.received_at">
                                    <ion-icon slot="start" :icon="peopleOutline"></ion-icon>
                                    <ion-input label="Prestado para:" label-placement="stacked" placeholder="Descripcion" :value="dataUI.loaned_to.name" :readonly="true"></ion-input>
                                </ion-item>
                            </ion-list>

                            <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                                <ion-item v-if="dataUI.loaned_at">
                                    <ion-icon slot="start" :icon="exitOutline"></ion-icon>
                                    <ion-input label="Prestado el:" label-placement="stacked" placeholder="Descripcion" :value="dataUI.loaned_at" :readonly="true"></ion-input>
                                </ion-item>
                                <ion-item v-if="dataUI.received_at">
                                    <ion-icon slot="start" :icon="checkmarkDoneOutline"></ion-icon>
                                    <ion-input label="Recibido por el prestatario:" label-placement="stacked" placeholder="Descripcion" :value="dataUI.received_at" :readonly="true"></ion-input>
                                </ion-item>
                                <ion-item v-if="dataUI.returned_at">
                                    <ion-icon slot="start" :icon="arrowUndoOutline"></ion-icon>
                                    <ion-input label="Devuelto por el prestatario:" label-placement="stacked" placeholder="Descripcion" :value="dataUI.returned_at" :readonly="true"></ion-input>
                                </ion-item>
                                <ion-item v-if="dataUI.confirm_returned_at">
                                    <ion-icon slot="start" :icon="enterOutline"></ion-icon>
                                    <ion-input label="Recibido por el almacén:" label-placement="stacked" placeholder="Descripcion" :value="dataUI.confirm_returned_at" :readonly="true"></ion-input>
                                </ion-item>
                            </ion-list>

                            <br>
                        </section>
                    </ion-accordion>
                    <ion-accordion value="second">
                        <ion-item slot="header" color="light">
                            <ion-label>
                                <h2><b>2. Job y expense</b></h2>
                                <p>Registro del Job y Expense del préstamo</p>
                            </ion-label>
                        </ion-item>
                        <section slot="content">
                            <ion-list  :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                                <ion-item v-for="moviment in movimentsUI" :key="moviment.id">
                                    <ion-icon color="primary" slot="start" :icon="swapVerticalOutline"></ion-icon>
                                    <ion-label>
                                        <h2><b>{{ moviment.user.name }}</b></h2>
                                        <h3>{{ moviment.date }}</h3>
                                        <h3><b>Job: </b> {{ moviment.job_code }} <b>Expense: </b> {{ moviment.expense_code }}</h3>
                                        <p>{{ moviment.description }}</p>
                                    </ion-label>
                                    <ion-button v-if="false" fill="clear" color="danger" @click="actions.deleteMoviment(moviment.id)">
                                        <ion-icon slot="icon-only" :icon="removeCircleOutline"></ion-icon>
                                    </ion-button>
                                </ion-item>
                            </ion-list>

                            <section class="ion-padding" v-if="false">
                                <ion-button @click="actions.addNewMoviment" expand="block" >
                                    <ion-icon slot="end" :icon="addCircleOutline"></ion-icon>
                                    Nuevo Movimiento
                                </ion-button>
                            </section>
                        </section>
                    </ion-accordion>

                    <ion-accordion value="third">
                        <ion-item slot="header" color="light">
                            <ion-label>
                                <h2><b>3. Intercurrencias</b></h2>
                                <p>Registro de intercurrencias con el producto</p>
                            </ion-label>
                        </ion-item>
                        <section slot="content">
                            <ion-list  :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                                <ion-item v-for="intercurrency in intercurrencesUI" :key="intercurrency.id">
                                    <ion-icon color="warning" slot="start" :icon="warningOutline"></ion-icon>
                                    <ion-label>
                                        <h2><b>{{ intercurrency.user.name }}</b></h2>
                                        <h3>{{ intercurrency.date }}</h3>
                                        <p>{{ intercurrency.description }}</p>
                                    </ion-label>
                                    <ion-button fill="clear" color="danger" @click="actions.deleteIntercurrence(intercurrency.id)">
                                        <ion-icon slot="icon-only" :icon="removeCircleOutline"></ion-icon>
                                    </ion-button>
                                </ion-item>
                            </ion-list>
                            <section class="ion-padding">
                                <ion-button @click="actions.addNewIntercurrence" expand="block">
                                    <ion-icon slot="end" :icon="addCircleOutline"></ion-icon>
                                    Nueva Intercurrencia
                                </ion-button>
                            </section>
                        </section>
                    </ion-accordion>
                </ion-accordion-group>

                <br>
                <section class="ion-padding">
                    <ion-button :disabled="isLoading" v-if="loan.status == EInventoryWarehouseProductItemLoanStatus.OnLoan && dataUI.isMeLoanee" color="warning" @click="actions.changeStatus(EInventoryWarehouseProductItemLoanStatus.ReturningToWarehouse)" expand="block">
                        Devolver producto al almacén
                        <ion-icon slot="start" :icon="arrowUndoOutline"></ion-icon>
                    </ion-button>

                    <ion-button :disabled="isLoading" fill="outline" v-if="loan.status == EInventoryWarehouseProductItemLoanStatus.ReturningToWarehouse && dataUI.isMeLoanee" color="danger" @click="actions.changeStatus(EInventoryWarehouseProductItemLoanStatus.OnLoan)" expand="block">
                        Deshacer devolución producto al almacén
                        <ion-icon slot="start" :icon="closeCircleOutline"></ion-icon>
                    </ion-button>



                    <ion-button :disabled="isLoading" v-if="loan.status == EInventoryWarehouseProductItemLoanStatus.ReturningToWarehouse && dataUI.isMeLoaner" color="success" @click="actions.changeStatus(EInventoryWarehouseProductItemLoanStatus.Returned)" expand="block">
                        He recibido el producto en el almacén
                        <ion-icon slot="start" :icon="checkmarkCircleOutline"></ion-icon>
                    </ion-button>

                    <ion-button :disabled="isLoading" fill="outline" v-if="loan.status == EInventoryWarehouseProductItemLoanStatus.Returned && dataUI.isMeLoaner" color="danger" @click="actions.changeStatus(EInventoryWarehouseProductItemLoanStatus.ReturningToWarehouse)" expand="block">
                        Deshacer recibimiento de producto
                        <ion-icon slot="start" :icon="closeCircleOutline"></ion-icon>
                    </ion-button>

                    <br>
                    <ion-label class="ion-text-center">
                        <p>Si deseas enviar este producto para otra persona, debes de devolver este producto al almacén y luego el otro usuario debe hacer un nuevo pedido de productos.</p>
                    </ion-label>
                </section>
            </article>
            <br><br><br><br><br><br><br><br><br><br><br><br>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import ProductItemLoanStatusChip from '@/components/ProductItemLoanStatusChip/ProductItemLoanStatusChip.vue';
import ProductItemStatusChip from '@/components/ProductItemStatusChip/ProductItemStatusChip.vue';
import AddInventoryWarehouseLoanIntercurrency from '@/dialogs/AddInventoryWarehouseLoanIntercurrency/AddInventoryWarehouseLoanIntercurrency.vue';
import AddInventoryWarehouseLoanMovement from '@/dialogs/AddInventoryWarehouseLoanMovement/AddInventoryWarehouseLoanMovement.vue';
import EditInventoryProductItem from '@/dialogs/EditInventoryProductItem/EditInventoryProductItem.vue';
import ShowInventoryWarehouseProductItemLoans from '@/dialogs/ShowInventoryWarehouseProductItemLoans/ShowInventoryWarehouseProductItemLoans.vue';
import { EInventoryWarehouseProductItemLoanStatus, IWarehouseProductItemLoan } from '@/interfaces/InventoryInterfaces';
import { IUser } from '@/interfaces/UserInterfaces';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { Dialog, DialogEventEmitter } from '@/utils/Dialog/Dialog';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { Session } from '@/utils/Session/Session';
import { Viewport } from '@/utils/Viewport/Viewport';
import { alertController, IonAccordion, IonAccordionGroup, IonInput, IonListHeader, IonAvatar, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar } from '@ionic/vue';
import { addCircleOutline, albumsOutline, arrowUndoOutline, checkmarkCircleOutline, checkmarkDoneOutline, closeCircleOutline, cogOutline, documentTextOutline, enterOutline, exitOutline, fileTrayFullOutline, peopleOutline, personOutline, removeCircleOutline, swapVerticalOutline, trashBinOutline, warningOutline } from 'ionicons/icons';
import { DateTime } from "luxon";
import { computed, onMounted, onUnmounted, PropType, ref } from 'vue';
import { useRouter } from 'vue-router';

const accordionGroupEl = ref<any>(null);
const isLoading = ref<boolean>(true);
const isReadonly = ref<boolean>(false);

const router = useRouter();

const props = defineProps({
    productItemLoan: {
        type: Object as PropType<IWarehouseProductItemLoan>,
        required: false,
        default: null
    },
    productItemLoanId: {
        type: Number,
        required: false,
        default: null
    },
    emitter: {
        type: DialogEventEmitter,
        required: true
    }
});

const loan = ref<IWarehouseProductItemLoan|null>(props.productItemLoan || null);


const dynamicData = ref<{
    movements: IWarehouseProductItemLoan['movements'],
    intercurrences: IWarehouseProductItemLoan['intercurrences'],
}>({
    movements: loan.value?.movements as unknown as IWarehouseProductItemLoan['movements'],
    intercurrences: loan.value?.intercurrences as unknown as IWarehouseProductItemLoan['intercurrences'],
});



const openProductItemView = () => {
    Dialog.show(EditInventoryProductItem, {
        props: {
            productItemId: loan.value?.product_item?.id
        },
        onLoaded($this) {
            
        }
    })
}


const movimentsUI = computed(() => {
    return dynamicData.value.movements.map((moviment: any) => {
        return {
            ...moviment,
            date: DateTime.fromISO(moviment.date).toFormat("dd/MM/yyyy HH:mm"),
        }
    }) as IWarehouseProductItemLoan['movements'];
})
const intercurrencesUI = computed(() => {
    return dynamicData.value.intercurrences.map((intercurrence: any) => {
        return {
            ...intercurrence,
            date: DateTime.fromISO(intercurrence.date).toFormat("dd/MM/yyyy HH:mm"),
        }
    }) as IWarehouseProductItemLoan['intercurrences'];
})

const dataUI = computed(() => {
    return {
        ...loan.value,
        loaned_at: loan.value?.loaned_at ? DateTime.fromJSDate(new Date(loan.value?.loaned_at)).toFormat("dd/MM/yyyy HH:mm") : null,
        received_at: loan.value?.received_at ? DateTime.fromJSDate(new Date(loan.value?.received_at)).toFormat("dd/MM/yyyy HH:mm") : null,
        returned_at: loan.value?.returned_at ? DateTime.fromJSDate(new Date(loan.value?.returned_at)).toFormat("dd/MM/yyyy HH:mm") : null,
        confirm_returned_at: loan.value?.confirm_returned_at ? DateTime.fromJSDate(new Date(loan.value?.confirm_returned_at)).toFormat("dd/MM/yyyy HH:mm") : null,
        isMeLoaner: loan.value?.loaned_by_user_id == Session.getCurrentSessionSync()?.id(),
        isMeLoanee: loan.value?.loaned_to_user_id == Session.getCurrentSessionSync()?.id(),
    }
})



const actions = {
    addNewMoviment: async () => {
        Dialog.show(AddInventoryWarehouseLoanMovement, {
            props: {
                
            },
            onLoaded($this) {
                $this.on('create', (event:any) => {
                    const movement = event.data;
                    dynamicData.value.movements.push(movement);
                    actions.saveLoan();
                })
                
            },
        })
    },
    addNewIntercurrence: async () => {
        Dialog.show(AddInventoryWarehouseLoanIntercurrency, {
            props: {
                
            },
            onLoaded($this) {
                $this.on('create', (event:any) => {
                    const intercurrence = event.data;
                    dynamicData.value.intercurrences.push(intercurrence);
                    actions.saveLoan();
                })
                
            },
        })
    },
    deleteMoviment: async (movimentId: string) => {
        const alert = alertController.create({
            header: "¿Estás seguro?",
            message: "¿Estás seguro de eliminar este movimiento?",
            buttons: [
                {
                    text: "Cancelar",
                    role: "cancel"
                },
                {
                    text: "Eliminar",
                    role: "destructive",
                    handler: () => {
                        dynamicData.value.movements = dynamicData.value.movements.filter((mov: any) => mov.id != movimentId);
                        actions.saveLoan();
                    }
                }
            ]
        });
        alert.then((alert) => {
            alert.present();
        })
    },
    deleteIntercurrence: async (intercurrenceId: string) => {
        const alert = alertController.create({
            header: "¿Estás seguro?",
            message: "¿Estás seguro de eliminar esta intercurrencia?",
            buttons: [
                {
                    text: "Cancelar",
                    role: "cancel"
                },
                {
                    text: "Eliminar",
                    role: "destructive",
                    handler: () => {
                        dynamicData.value.intercurrences = dynamicData.value.intercurrences.filter((inter: any) => inter.id != intercurrenceId);
                        actions.saveLoan();
                    }
                }
            ]
        });
        alert.then((alert) => {
            alert.present();
        })
    },
    changeStatus: async (status: EInventoryWarehouseProductItemLoanStatus) => {
        const form = {
            ...loan.value,
            status: status
        }

        if (status == EInventoryWarehouseProductItemLoanStatus.Returned){
            form.returned_at = DateTime.local().toISO();
        }else if (status == EInventoryWarehouseProductItemLoanStatus.ReturningToWarehouse){
            form.confirm_returned_at = DateTime.local().toISO();
        }

        if (status == EInventoryWarehouseProductItemLoanStatus.OnLoan){
            form.returned_at = null;
            form.confirm_returned_at = null;
        }else if (status == EInventoryWarehouseProductItemLoanStatus.ReturningToWarehouse){
            form.returned_at = null;
        }
        isLoading.value = true;
        const response = await RequestAPI.put('/inventory/warehouse-loans/' + loan.value?.id, form);
        isLoading.value = false;
        AppEvents.emit('inventory:reload');
        props.emitter.fire('close');
    },
    saveLoan: async () => {
        isLoading.value = true;
        const response = await RequestAPI.put('/inventory/warehouse-loans/' + loan.value?.id, {
            ...loan.value,
            movements: dynamicData.value.movements,
            intercurrences: dynamicData.value.intercurrences,
        });
        isLoading.value = false;
        AppEvents.emit('inventory:reload');
    }
}

const loadLoan = async () => {
    isLoading.value = true;
    const response = await RequestAPI.get('/inventory/warehouse-loans/' + props.productItemLoanId);
    loan.value = response;

    dynamicData.value.movements = loan.value?.movements as unknown as IWarehouseProductItemLoan['movements'];
    dynamicData.value.intercurrences = loan.value?.intercurrences as unknown as IWarehouseProductItemLoan['intercurrences'];

    isLoading.value = false;
}

const showLoanRegestry = async () => {
    Dialog.show(ShowInventoryWarehouseProductItemLoans, {
        props: {
            productItemId: loan.value?.product_item?.id
        },
        onLoaded($this) {
            
        },
    })
}

const seeOutcomeRequest = () => {
    props.emitter.fire('close');

    const viewModeAs = (() => {
        if (loan.value?.loaned_by_user_id == Session.getCurrentSessionSync()?.id()){
            return "Dispacher";
        }else{
            return "Requester";
        }
    })();
    router.push(`/inventory/outcome-requests/${loan.value?.inventory_warehouse_outcome_request_id}?view-mode=${viewModeAs}`);
}

onMounted(async () => {
    isLoading.value = false;
    

    if (props.productItemLoanId){
        await loadLoan();
    }
    setTimeout(async () => {
        accordionGroupEl.value.$el.value = "second";
    }, 100);


    const callbackId = AppEvents.on('inventory:reload', () => {
        loadLoan();
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