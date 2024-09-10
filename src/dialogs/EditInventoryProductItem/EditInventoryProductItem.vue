<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cerrar</ion-button>
                </ion-buttons>
                <ion-title>Producto</ion-title>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>

            <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'"  v-if="productItemData">
                <ion-item>
                    <ion-avatar slot="start" v-if="productItemData?.product">
                        <img :src="productItemData?.product?.image" />
                    </ion-avatar>
                    <ion-label>
                        <h2><b>{{ productItemData?.product?.name }}</b></h2>
                        <p>{{ productItemData?.product?.description }}</p>
                        <p>{{ productItemData?.product?.brand }}</p>
                    </ion-label>
                    <ProductItemStatusChip v-if="productItemData" slot="end" :request="productItemData" />
                </ion-item>
                <ion-item>
                    <ion-input @ionBlur="onChangeBatch" label="Número de série" placeholder="Ej.: 000-XXXX-000000" label-placement="stacked" v-model="dynamicData.batch" :disabled="isLoading" :readonly="!allowEdits"></ion-input>
                </ion-item>
            </ion-list>

            <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'" v-if="productItemData">
                <ion-item button @click="showIncome">
                    <ion-icon color="primary" :icon="enterOutline" slot="start"></ion-icon>
                    <ion-label color="primary">
                        <h2>Ver ingreso</h2>
                        <p>Visualizar entrada del producto al stock</p>
                    </ion-label>
                </ion-item>
                <ion-item v-if="productItemData?.inventory_warehouse_outcome_id" button @click="showOutcome">
                    <ion-icon color="primary" :icon="exitOutline" slot="start"></ion-icon>
                    <ion-label color="primary">
                        <h2>Ver salida</h2>
                        <p>Visualizar venta del producto</p>
                    </ion-label>
                </ion-item>
            </ion-list>


            <ion-list-header v-if="productItemData?.loans && productItemData.loans.length > 0" :style="Viewport.data.value.deviceSetting != 'DesktopLandscape' ? 'margin-bottom: 10px;' : undefined">Historial de Préstamos</ion-list-header>
            <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'" v-if="productItemData">
                <ion-item v-for="loan in productItemData.loans" :key="loan.id" button @click="showLoan(loan)">
                    <ion-label>
                        <h2><b>{{ DateTime.fromJSDate(new Date(loan.loaned_at as any)).toFormat('dd/MM/yyyy') }}</b></h2>
                        <p><b>Prestado para:</b> {{ loan.loaned_to?.name }}</p>

                    </ion-label>
                    <ProductItemLoanStatusChip slot="end" :request="loan" />
                </ion-item>
            </ion-list>

            <ion-list-header v-if="productItemData?.loans && productItemData.loans.length > 0 && intercurrencesUI.length > 0"  :style="Viewport.data.value.deviceSetting != 'DesktopLandscape' ? 'margin-bottom: 10px;' : undefined">Historial de Intercurrencias</ion-list-header>
            <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'" v-if="productItemData && intercurrencesUI.length > 0">
                <ion-item v-for="intercurrency in intercurrencesUI" :key="intercurrency.id" button @click="showLoan(intercurrency.loan)">
                    <ion-icon color="warning" slot="start" :icon="warningOutline"></ion-icon>
                    <ion-label>
                        <h2><b>{{ intercurrency.user.name }}</b></h2>
                        <h3>{{ intercurrency.date }}</h3>
                        <p>{{ intercurrency.description }}</p>
                    </ion-label>
                </ion-item>
            </ion-list>

            <ion-list-header v-if="productItemData?.loans && productItemData.loans.length > 0 && movementsUI.length > 0"  :style="Viewport.data.value.deviceSetting != 'DesktopLandscape' ? 'margin-bottom: 10px;' : undefined">Historial de Movimientos</ion-list-header>
            <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'" v-if="productItemData && movementsUI.length > 0">
                <ion-item v-for="movement in movementsUI" :key="movement.id" button @click="showLoan(movement.loan)">
                    <ion-icon color="primary" slot="start" :icon="swapVerticalOutline"></ion-icon>
                    <ion-label>
                        <h2><b>{{ movement.user.name }}</b></h2>
                        <h3>{{ movement.date }}</h3>
                        <h3><b>Job: </b> {{ movement.job_code }} <b>Expense: </b> {{ movement.expense_code }}</h3>
                        <p>{{ movement.description }}</p>
                    </ion-label>
                </ion-item>
            </ion-list>


            <ion-list-header v-if="productItemData?.loans && productItemData.loans.length > 0"  :style="Viewport.data.value.deviceSetting != 'DesktopLandscape' ? 'margin-bottom: 10px;' : undefined">Opciones</ion-list-header>
            <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'" v-if="productItemData && allowEdits && productItemData.product?.is_loanable">
                <ion-item  button v-if="productItemData.status == EInventoryProductItemStatus.InStock" @click="setInRepair()">
                    <ion-icon color="warning" :icon="buildOutline" slot="start"></ion-icon>
                    <ion-label color="warning">Hacer mantenimiento</ion-label>
                </ion-item>
                <ion-item  button v-if="productItemData.status == EInventoryProductItemStatus.WriteOff || productItemData.status == EInventoryProductItemStatus.InRepair" @click="setInStock">
                    <ion-icon color="success" :icon="arrowUndoOutline" slot="start"></ion-icon>
                    <ion-label color="success">Devolver al stock</ion-label>
                </ion-item>
                <ion-item button v-if="productItemData.status == EInventoryProductItemStatus.InStock || productItemData.status == EInventoryProductItemStatus.InRepair" @click="setWriteOff">
                    <ion-icon  color="danger" :icon="removeCircleOutline" slot="start"></ion-icon>
                    <ion-label  color="danger">Dar de baja</ion-label>
                </ion-item>
            </ion-list>

        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import ProductItemLoanStatusChip from '@/components/ProductItemLoanStatusChip/ProductItemLoanStatusChip.vue';
import ProductItemStatusChip from '@/components/ProductItemStatusChip/ProductItemStatusChip.vue';
import EditInventoryWarehouseIncome from '@/dialogs/EditInventoryWarehouseIncome/EditInventoryWarehouseIncome.vue';
import EditInventoryWarehouseLoan from '@/dialogs/EditInventoryWarehouseLoan/EditInventoryWarehouseLoan.vue';
import EditInventoryWarehouseOutcome from '@/dialogs/EditInventoryWarehouseOutcome/EditInventoryWarehouseOutcome.vue';
import { EInventoryProductItemStatus, IInventoryProductItem, IWarehouseProductItemLoan } from '@/interfaces/InventoryInterfaces';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { Session } from '@/utils/Session/Session';
import { InventoryStore } from '@/utils/Stored/InventoryStore';
import { Viewport } from '@/utils/Viewport/Viewport';
import { IonAvatar, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonProgressBar, IonTitle, IonToolbar, alertController, toastController } from '@ionic/vue';
import { arrowUndoOutline, buildOutline, enterOutline, exitOutline, removeCircleOutline, swapVerticalOutline, warningOutline } from 'ionicons/icons';
import { DateTime } from 'luxon';
import { computed, onMounted, ref } from 'vue';
import { Dialog, DialogEventEmitter } from "../../utils/Dialog/Dialog";


const page = ref<HTMLElement|null>(null);
const productItemData = ref<IInventoryProductItem|null>(null);


const isLoading = ref<boolean>(false);
const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
    productItemId: {
        type: String,
        required: true
    }
});

const dynamicData = ref({
    batch: '',
    status: EInventoryProductItemStatus.InStock,
});

const allowEdits = computed(() => {
    return productItemData.value?.warehouse?.owners.includes(Session.getCurrentSessionSync()?.id());
})

const intercurrencesUI = computed(() => {
    const intercurrencies: Array<any> = [];
    productItemData.value?.loans?.forEach((loan) => {
        loan.intercurrences.forEach((intercurrency) => {
            intercurrencies.push({
                id: intercurrency.id,
                date: DateTime.fromJSDate(new Date(intercurrency.date as any)).toFormat('dd/MM/yyyy HH:mm'),
                description: intercurrency.description,
                loan: loan,
                user: intercurrency.user
            });
        });
    });

    return intercurrencies;
})

const movementsUI = computed(() => {
    const movements: Array<any> = [];
    productItemData.value?.loans?.forEach((loan) => {
        loan.movements.forEach((movement) => {
            movements.push({
                id: movement.id,
                date: DateTime.fromJSDate(new Date(movement.date as any)).toFormat('dd/MM/yyyy HH:mm'),
                description: movement.description,
                job_code: movement.job_code,
                expense_code: movement.expense_code,
                loan: loan,
                user: movement.user
            });
        });
    });

    return movements;
})

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


    isLoading.value = true;


    const dataParsed = {
        status: dynamicData.value.status,
        batch: dynamicData.value.batch || null,
    }

    RequestAPI.put('/inventory/products/items/' + props.productItemId, dataParsed).then(async (response) => {
        await InventoryStore.refreshProducts();
        AppEvents.emit('inventory:reload');
        toastController.create({
            message: '✅ Producto actualizado exitosamente',
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

const loadProductItem = async () => {
    isLoading.value = true;
    productItemData.value = await RequestAPI.get('/inventory/products/items/' + props.productItemId);
    isLoading.value = false;

    dynamicData.value.batch = productItemData.value?.batch ? productItemData.value.batch : '';
    dynamicData.value.status = productItemData.value?.status ? productItemData.value.status : EInventoryProductItemStatus.InStock;
}

const validateCamps = () => {
    let errors:Array<string> = [];



    return {
        isValid: errors.length == 0,
        errors: errors
    }
}

const showLoan = (loan: IWarehouseProductItemLoan) => {
    Dialog.show(EditInventoryWarehouseLoan, {
        props: {
            productItemLoanId: loan.id
        },
        onLoaded($this) {
            
        }
    })
}
const showIncome = () => {
    Dialog.show(EditInventoryWarehouseIncome, {
        props: {
            warehouseIncome: productItemData.value?.income,
            isReadonly: true
        },
        onLoaded($this) {
            
        }
    })
}
const showOutcome = () => {
    Dialog.show(EditInventoryWarehouseOutcome, {
        props: {
            warehouseOutcome: productItemData.value?.outcome,
            isReadonly: true
        },
        onLoaded($this) {
            
        }
    })
}

const setInStock = async () => {
    isLoading.value = true;
    dynamicData.value.status = EInventoryProductItemStatus.InStock;
    productItemData.value.status = EInventoryProductItemStatus.InStock;
    await save();
    isLoading.value = false;
}
const setInRepair = async () => {
    isLoading.value = true;
    dynamicData.value.status = EInventoryProductItemStatus.InRepair;
    productItemData.value.status = EInventoryProductItemStatus.InRepair;
    await save();
    isLoading.value = false;
}

const setWriteOff = async () => {
    isLoading.value = true;
    dynamicData.value.status = EInventoryProductItemStatus.WriteOff;
    productItemData.value.status = EInventoryProductItemStatus.WriteOff;
    await save();
    isLoading.value = false;
}

const onChangeBatch = async () => {
    if (!allowEdits.value){
        return;
    }
    isLoading.value = true;
    await save();
    isLoading.value = false;
}

onMounted(() => {
    loadProductItem();
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