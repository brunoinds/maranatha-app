<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button :disabled="isLoading" @click="emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Ingreso de Productos</ion-title>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <article>
                <ion-accordion-group ref="accordionGroupEl">
                    <ion-accordion value="first">
                        <ion-item slot="header" color="light">
                            <ion-label>1. Agregar productos</ion-label>
                        </ion-item>
                        <section slot="content">
                            <ion-list :inset="true" v-for="product in dynamicData.productsListWithQuantity" :key="product.product.id">
                                <ion-item>
                                    <ion-label>
                                        <h2><b>{{ product.product.name }}</b></h2>
                                        <p>{{ product.product.brand }}</p>
                                    </ion-label>
                                    <ion-label slot="end" class="ion-text-right" color="primary">
                                        <h2><b>{{ Toolbox.moneyFormat(product.quantity * product.amount, warehouseIncome.currency as unknown as EMoneyType) }}</b></h2>
                                        <p>{{ product.quantity }}x {{ Toolbox.moneyFormat(product.amount, warehouseIncome.currency as unknown as EMoneyType) }}</p>
                                    </ion-label>
                                </ion-item>
                                <ion-item>
                                    <ion-input label="Precio unitário" type="number" :min="1" v-model="product.amount" class="ion-text-right"></ion-input>
                                </ion-item>
                                <ion-item>
                                    <ion-input label="Cantidad" type="number" :min="1" v-model="product.quantity" class="ion-text-right"></ion-input>
                                </ion-item>
                                <ion-item button :detail="false" @click="actions.removeProduct(product.product)">
                                    <ion-label color="danger" class="ion-text-center">Eliminar producto</ion-label>
                                </ion-item>
                            </ion-list>

                            <section class="ion-padding">
                                <ion-button @click="actions.addNewProduct" expand="block">
                                    <ion-icon slot="end" :icon="bagAddOutline"></ion-icon>
                                    Agregar Produto</ion-button>
                            </section>
                        </section>
                    </ion-accordion>
                    <ion-accordion value="second">
                        <ion-item slot="header" color="light">
                            <ion-label>2. Datos de la compra</ion-label>
                        </ion-item>
                        <section slot="content">
                            <header>
                                <ion-list v-if="dynamicData.uploadedImageBase64">
                                    <ion-item> 
                                        <ion-img slot="start" style="height: 80px;" v-if="dynamicData.uploadedImageBase64" :src="'data:image/jpeg;base64,' + dynamicData.uploadedImageBase64"></ion-img>
                                        <ion-button slot="end" fill="clear" color="danger" @click="cameraActions.deleteImageFromCamera"> 
                                                Borrar Foto
                                            <ion-icon slot="start" :icon="trashBinOutline"></ion-icon>
                                        </ion-button>
                                    </ion-item>
                                </ion-list>
                                <article class="ion-padding" v-if="!dynamicData.uploadedImageBase64" style="display: flex; align-content: center; justify-content: space-between;">
                                    <ion-button expand="block" fill="outline" @click="cameraActions.openCamera()" style="width: 100%;" v-if="!dynamicData.isLoadingImageCompression"> 
                                        <ion-icon slot="start" :icon="camera"></ion-icon>
                                        Tomar Foto de la Boleta
                                    </ion-button>
                                    <ion-button fill="outline" @click="cameraActions.openCamera(true)" v-if="!dynamicData.isLoadingImageCompression"> 
                                        <ion-icon :icon="attachOutline"></ion-icon>
                                    </ion-button>
                                    <ion-progress-bar v-if="dynamicData.isLoadingImageCompression" type="indeterminate"></ion-progress-bar>
                                </article>
                            </header>

                            <ion-list>
                                <ion-item>
                                    <ion-input label="Código QR" label-placement="stacked" placeholder="" v-model="warehouseIncome.qrcode_data"></ion-input>
                                    <ion-button slot="end" fill="clear" @click="cameraActions.openQRCodeScanner"> 
                                        Scanear QR
                                        <ion-icon slot="start" :icon="qrCodeOutline"></ion-icon>
                                    </ion-button>
                                </ion-item>
                                <ion-item>
                                    <ion-select label="Tipo de moneda:" label-placement="stacked" interface="action-sheet" v-model="warehouseIncome.currency">
                                        <ion-select-option value="PEN">Soles (S/.)</ion-select-option>
                                        <ion-select-option value="USD">Dólares ($)</ion-select-option>
                                        <ion-select-option value="BRL">Reales (R$)</ion-select-option>
                                        <ion-select-option value="PYG">Guaranies (₲)</ion-select-option>
                                    </ion-select>
                                </ion-item>
                                <ion-item>
                                    <ion-input label="Observaciones:" label-placement="stacked" placeholder="Ej.: material para construcción" v-model="warehouseIncome.description"></ion-input>
                                </ion-item>
                                <ion-accordion-group ref="datetimeAccordionGroupEl">
                                    <ion-accordion value="start" ref="datetimeAccordion" class="datetime-accordion">
                                        <ion-item lines="inset" slot="header">
                                            <ion-input label="Fecha de la compra:" label-placement="stacked" placeholder="10/10/2023" v-model="warehouseIncome.date" :readonly="true"></ion-input>
                                        </ion-item>
                                        <ion-datetime slot="content" presentation="date" v-model="dynamicData.datetimePickerDate" @ion-change="onEvents.onDatePickerChange"></ion-datetime>
                                    </ion-accordion>
                                </ion-accordion-group>
                                <ion-item>
                                    <ion-input :label="'Código de boleta/factura:'" label-placement="stacked" placeholder="AAXX-XXXXXXXX" v-model="warehouseIncome.ticket_number"></ion-input>
                                </ion-item>
                                <ion-item>
                                    <ion-input label="RUC:" label-placement="stacked" placeholder="XXXXXXXXXXX" v-model="warehouseIncome.commerce_number"  inputmode="numeric"></ion-input>
                                </ion-item>
                            </ion-list>

                            <ion-list>
                                <ion-item button @click="(e) => {actions.openJobSelector(); e.stopPropagation()}">
                                    <ion-input :readonly="true" label="Job:" label-placement="stacked" placeholder="Selecciona el Job" v-model="warehouseIncome.job_code"></ion-input>
                                </ion-item>
                                <ion-item button @click="(e) => {actions.openExpenseSelector(); e.stopPropagation()}">
                                    <ion-input :readonly="true" label="Expense:" label-placement="stacked" placeholder="Selecciona el Expense" v-model="warehouseIncome.expense_code"></ion-input>
                                </ion-item>
                            </ion-list>
                        </section>
                    </ion-accordion>
                    <ion-accordion value="third">
                        <ion-item slot="header" color="light">
                            <ion-label>3. Confirmar valores</ion-label>
                        </ion-item>
                        <section slot="content">
                            <section class="ion-padding">
                                <ion-button color="success" @click="checkoutActions.createNewIncome" expand="block">
                                    Confirmar e Ingresar Productos
                                    <ion-icon slot="end" :icon="checkmarkCircleOutline"></ion-icon>
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
import { IonAccordion, IonAccordionGroup, IonButton, IonButtons, IonContent, IonDatetime, IonHeader, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonPage, IonProgressBar, IonSelect, IonSelectOption, IonTitle, IonToolbar, alertController, toastController } from '@ionic/vue';
import { attachOutline, camera, qrCodeOutline, trashBinOutline, checkmarkCircleOutline, bagAddOutline } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import ExpenseSelector from '@/dialogs/ExpenseSelector/ExpenseSelector.vue';
import InventoryProductSelector from '@/dialogs/InventoryProductSelector/InventoryProductSelector.vue';
import JobSelector from '@/dialogs/JobSelector/JobSelector.vue';
import { QRCodeScanner } from '@/dialogs/QRCodeScanner/QRCodeScanner';
import { EMoneyType } from '@/interfaces/ReportInterfaces';
import { Dialog, DialogEventEmitter } from '@/utils/Dialog/Dialog';
import { QRCodeParser } from '@/utils/QRCodeParser/QRCodeParser';
import { DateTime } from "luxon";
import { INewWarehouseIncome, IProduct } from '@/interfaces/InventoryInterfaces';
import { ImagePicker } from '@/utils/Camera/ImagePicker';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import { RequestAPI } from '@/utils/Requests/RequestAPI';

const datetimeAccordionGroupEl = ref<any>(null);
const accordionGroupEl = ref<any>(null);
const isLoading = ref<boolean>(true);


const dynamicData = ref<{
    uploadedImageBase64: null | string,
    datetimePickerDate: string,
    isLoadingImageCompression: boolean,
    productsList: Array<IProduct>,
    productsListWithQuantity: Array<{product: IProduct, quantity: number, amount: number}>
}>({
    uploadedImageBase64: null,
    isLoadingImageCompression: false,
    datetimePickerDate: DateTime.now().toISODate() as unknown as string,
    productsList: [],
    productsListWithQuantity: []
})
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

const warehouseIncome = ref<INewWarehouseIncome>({
    inventory_warehouse_id: props.warehouseId,
    description: "",
    date: DateTime.now().toFormat("dd/MM/yyyy").toString(),
    ticket_number: "",
    commerce_number: "",
    amount: 0,
    currency: "PEN",
    qrcode_data: "",
    job_code: "",
    expense_code: "",
    image: ""
});

const validateData = async () => {
    const formErrors: Array<{field: string, message: string}> = [];

    if (!warehouseIncome.value.date){
        formErrors.push({
            field: "date",
            message: "La fecha de compra es requerida"
        })
    }else{
        const dt = DateTime.fromFormat(warehouseIncome.value.date, "dd/MM/yyyy");
        if (!dt.isValid){
            formErrors.push({
                field: "date",
                message: "La fecha de compra es inválida " + dt.invalidExplanation
            })
        }
    }
    if (dynamicData.value.productsListWithQuantity.length == 0 || dynamicData.value.productsListWithQuantity.reduce((acc, p) => acc + p.quantity, 0) == 0){
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

const onEvents = {
    onDatePickerChange: (event: CustomEvent) => {
        const date = event.detail.value.split('T')[0];
        const formatted = DateTime.fromFormat(date, "yyyy-MM-dd").toFormat("dd/MM/yyyy").toString();

        const previousDate = DateTime.fromFormat(warehouseIncome.value.date, "dd/MM/yyyy");
        const newDate = DateTime.fromFormat(formatted, "dd/MM/yyyy");

        warehouseIncome.value.date = formatted;

        //Check if the day of the month is the same:
        if (previousDate.day == newDate.day){
            return;
        }else{
            datetimeAccordionGroupEl.value.$el.value = undefined;
        }
    }
}

const cameraActions = {
    setBarcodeData: (qrCodeContent:string) => {
        const response = QRCodeParser.parseBuyCode(qrCodeContent);

        if (!response.isValid || !response.content){
            toastController.create({
                message: "❌ El código QR no es válido",
                duration: 2000
            }).then((toast) => {
                toast.present();
            })
            return;
        }

        warehouseIncome.value.qrcode_data = response.qrCode;
        warehouseIncome.value.ticket_number = response.content.docCode;
        
        warehouseIncome.value.commerce_number = response.content.ruc;
        warehouseIncome.value.amount = parseFloat(response.content.price).toFixed(2) as unknown as number;

        if (response.content.date){
            const ticketDate = DateTime.fromFormat(response.content.date, "yyyy-MM-dd");
            warehouseIncome.value.date = ticketDate.toFormat("dd/MM/yyyy");
            dynamicData.value.datetimePickerDate = ticketDate.toISODate() as unknown as string;
        }
    },
    openQRCodeScanner: async () => {
        QRCodeScanner.open().onScan().then((content) => {
            cameraActions.setBarcodeData(content);
        })
    },
    openCamera: async (forceFromGallery: boolean = false) => {
        const response = await ImagePicker.loadInvoiceDocument({
            forceFromGallery
        })

        dynamicData.value.uploadedImageBase64 = response.image;

        if (response.barcode){
            cameraActions.setBarcodeData(response.barcode);
        }
    },
    deleteImageFromCamera: () => {
        dynamicData.value.uploadedImageBase64 = null;
    }
}

const actions = {
    addNewProduct: () => {
        Dialog.show(InventoryProductSelector, {
            props: {
                contextWarehouseId: props.warehouseId,
                allowMultipleSelection: true
            },
            onLoaded($this) {
                $this.on('selected', (event:any) => {
                    const products = event.data;
                    console.log(products)
                    products.forEach((product:IProduct) => {
                        dynamicData.value.productsList.push(product);
                        dynamicData.value.productsListWithQuantity.push({
                            product,
                            quantity: 1,
                            amount: 0
                        })
                    })
                })
            },
        })
    },
    removeProduct: (product: IProduct) => {
        dynamicData.value.productsList = dynamicData.value.productsList.filter((p) => p.id !== product.id);
        dynamicData.value.productsListWithQuantity = dynamicData.value.productsListWithQuantity.filter((p) => p.product.id !== product.id);
    },
    openJobSelector: () => {
        Dialog.show(JobSelector, {
            props: {
                includeDisabledJobs: false
            },
            onLoaded($this) {
                $this.on('selected', (event:any) => {
                    const job = event.data;
                    warehouseIncome.value.job_code = job.code;
                })
                
            },
        })
    },
    openExpenseSelector: () => {
        Dialog.show(ExpenseSelector, {
            props: {
                selectedExpenseCode: warehouseIncome.value.expense_code
            },
            onLoaded($this) {
                $this.on('selected', (event:any) => {
                    const expense = event.data;
                    warehouseIncome.value.expense_code = expense.code;
                })
                
                $this.on('close', () => {
                })
            },
        })
    }
}

const checkoutActions = {
    createNewIncome: async () => {
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
        }

        isLoading.value = true;
        const form = {
            ...warehouseIncome.value,
            inventory_warehouse_id: props.warehouseId,
            image: dynamicData.value.uploadedImageBase64,
            date: DateTime.fromFormat(warehouseIncome.value.date, "dd/MM/yyyy").toISO(),
            products: dynamicData.value.productsListWithQuantity.map((p) => {
                return {
                    product_id: p.product.id,
                    quantity: p.quantity,
                    amount: p.amount
                }
            })
        }

        try {
            const response = await RequestAPI.post(`/inventory/warehouse-incomes`, form)
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

onMounted(async () => {
    isLoading.value = false;
    setTimeout(() => {
        accordionGroupEl.value.$el.value = "first";
    }, 100);
})
</script>

<style scoped lang="scss">
.image-holder{
    display: flex;
    align-items: center;
    justify-content: center;
}

.display-error-holder{
    height: 70px;
}
.display-error{
    position: absolute;
    bottom: 2px;
}
.datetime-accordion{
    &::part(content expanded){
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--ion-color-light-tint);
    }
}
</style>