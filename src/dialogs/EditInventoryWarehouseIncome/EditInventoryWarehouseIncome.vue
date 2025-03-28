<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button v-if="!isReadonly" @click="emitter.fire('close')">Cancelar</ion-button>
                    <ion-button v-if="isReadonly" @click="emitter.fire('close')">Cerrar</ion-button>
                </ion-buttons>
                <ion-title>Ingreso de Productos #00{{ warehouseIncome.id }}</ion-title>
                <ion-buttons slot="end">
                    <ion-button v-if="!isReadonly" :disabled="isLoading" @click="checkoutActions.save()">Guardar</ion-button>
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
                                <h2><b>1. Datos de la compra</b></h2>
                                <p>Datos referente a la compra de los productos</p>
                            </ion-label>
                        </ion-item>
                        <section slot="content">
                            <header>
                                <ion-list v-if="dynamicData.uploadedImageBase64">
                                    <ion-img v-if="dynamicData.uploadedImageBase64" :src="'data:image/jpeg;base64,' + dynamicData.uploadedImageBase64"></ion-img>

                                    <ion-item v-if="!isReadonly"> 
                                        <ion-button slot="end" fill="clear" color="danger" @click="cameraActions.deleteImageFromCamera"> 
                                                Borrar Foto
                                            <ion-icon slot="start" :icon="trashBinOutline"></ion-icon>
                                        </ion-button>
                                    </ion-item>
                                </ion-list>
                                <article class="ion-padding" v-if="!dynamicData.uploadedImageBase64 && !isReadonly" style="display: flex; align-content: center; justify-content: space-between;">
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
                                    <ion-input :disabled="isReadonly" label="Código QR" label-placement="stacked" placeholder="" v-model="warehouseIncome.qrcode_data"></ion-input>
                                    <ion-button slot="end" fill="clear" @click="cameraActions.openQRCodeScanner" v-if="!isReadonly"> 
                                        Scanear QR
                                        <ion-icon slot="start" :icon="qrCodeOutline"></ion-icon>
                                    </ion-button>
                                </ion-item>
                                <ion-item>
                                    <ion-select :disabled="true" label="Tipo de moneda:" label-placement="stacked" interface="action-sheet" v-model="warehouseIncome.currency">
                                        <ion-select-option value="PEN">Soles (S/.)</ion-select-option>
                                        <ion-select-option value="USD">Dólares ($)</ion-select-option>
                                        <ion-select-option value="BRL">Reales (R$)</ion-select-option>
                                        <ion-select-option value="PYG">Guaranies (₲)</ion-select-option>
                                    </ion-select>
                                </ion-item>
                                <ion-item>
                                    <ion-input label="Observaciones:" :disabled="isReadonly" label-placement="stacked" placeholder="Ej.: material para construcción" v-model="warehouseIncome.description"></ion-input>
                                </ion-item>
                                <ion-accordion-group ref="datetimeAccordionGroupEl">
                                    <ion-accordion value="start" ref="datetimeAccordion" class="datetime-accordion">
                                        <ion-item lines="inset" slot="header">
                                            <ion-input :disabled="isReadonly" label="Fecha de la compra:" label-placement="stacked" placeholder="10/10/2023" v-model="warehouseIncome.date" :readonly="true"></ion-input>
                                        </ion-item>
                                        <ion-datetime :disabled="isReadonly" slot="content" presentation="date" v-model="dynamicData.datetimePickerDate" @ion-change="onEvents.onDatePickerChange"></ion-datetime>
                                    </ion-accordion>
                                </ion-accordion-group>
                                <ion-item>
                                    <ion-select :disabled="isReadonly" label="Tipo de comprobante:" label-placement="stacked" placeholder="Elige el tipo de comprobante" v-model="warehouseIncome.ticket_type">
                                        <ion-select-option value="Bill">Boleta</ion-select-option>
                                        <ion-select-option value="Facture">Factura</ion-select-option>
                                    </ion-select>
                                </ion-item>
                                <ion-item>
                                    <ion-input :disabled="isReadonly" :label="'Código de boleta/factura:'" label-placement="stacked" placeholder="AAXX-XXXXXXXX" v-model="warehouseIncome.ticket_number"></ion-input>
                                </ion-item>
                                <ion-item>
                                    <ion-input :disabled="isReadonly" label="RUC:" label-placement="stacked" placeholder="XXXXXXXXXXX" v-model="warehouseIncome.commerce_number"  inputmode="numeric"></ion-input>
                                </ion-item>
                            </ion-list>

                            <ion-list>
                                <ion-item-choose-dialog :disabled="isReadonly" @click="actions.openJobSelector" placeholder="Selecciona el Job" label="Job:" :value="warehouseIncome.job_code"/>
                                <ion-item-choose-dialog :disabled="isReadonly" @click="actions.openExpenseSelector" placeholder="Selecciona el Expense" label="Expense:" :value="warehouseIncome.expense_code"/>

                            </ion-list>
                        </section>
                    </ion-accordion>
                    <ion-accordion value="second">
                        <ion-item slot="header" color="light">
                            <ion-label>
                                <h2><b>2. Productos</b></h2>
                                <p>Productos ingresados y valor final de la compra</p>
                            </ion-label>
                        </ion-item>
                        <section slot="content">
                            <section>
                                <article class="offwhite">
                                    <ion-list-header>Productos</ion-list-header>

                                    <ion-list :inset="true" v-for="product in dynamicData.productsListWithQuantity" :key="product.product.id">
                                        <ion-item v-if="!dynamicData.isEditing">
                                            <ion-avatar slot="start" v-if="product.product.image">
                                                <img :src="product.product.image" />
                                            </ion-avatar>
                                            <ion-label>
                                                <h2><b>{{ product.product.name }}</b></h2>
                                                <p>{{ product.product.brand }}</p>
                                            </ion-label>
                                            <ion-label slot="end" class="ion-text-right" color="primary" v-if="getUnitNature(product.product.unit) == 'Integer'">
                                                <h2><b>{{ Toolbox.moneyFormat(product.quantity * product.amount, warehouseIncome.currency as unknown as EMoneyType) }}</b></h2>
                                                <p>{{ product.quantity }}x {{ Toolbox.moneyFormat(product.amount, warehouseIncome.currency as unknown as EMoneyType) }}</p>
                                            </ion-label>
                                            <ion-label slot="end" class="ion-text-right" color="primary" v-if="getUnitNature(product.product.unit) == 'Float'">
                                                <h2><b>{{ Toolbox.moneyFormat(product.amount, warehouseIncome.currency as unknown as EMoneyType) }}</b></h2>
                                                <p>{{ product.quantity }} {{ Toolbox.inventoryProductUnitName(product.product.unit).toLowerCase() }}</p>
                                            </ion-label>
                                        </ion-item>



                                        <article  v-if="dynamicData.isEditing">
                                            <ion-item>
                                                <ion-avatar slot="start" v-if="product.product.image">
                                                    <img :src="product.product.image" />
                                                </ion-avatar>
                                                <ion-label>
                                                    <h2><b>{{ product.product.name }}</b></h2>
                                                    <p>{{ product.product.brand }}</p>
                                                </ion-label>
                                                
                                                <ion-label slot="end" class="ion-text-right" color="primary" v-if="getUnitNature(product.product.unit) == 'Integer'">
                                                    <h2><b>{{ Toolbox.moneyFormat(product.quantity * product.amount, warehouseIncome.currency as unknown as EMoneyType) }}</b></h2>
                                                    <p>{{ product.quantity }}x {{ Toolbox.moneyFormat(product.amount, warehouseIncome.currency as unknown as EMoneyType) }}</p>
                                                </ion-label>

                                                <ion-label slot="end" class="ion-text-right" color="primary" v-if="getUnitNature(product.product.unit) == 'Float'">
                                                    <h2><b>{{ Toolbox.moneyFormat(product.amount, warehouseIncome.currency as unknown as EMoneyType) }}</b></h2>
                                                    <p>{{ product.quantity }} {{ Toolbox.inventoryProductUnitName(product.product.unit).toLowerCase()}}</p>
                                                </ion-label>
                                            </ion-item>
                                            <ion-item>
                                                <ion-input  v-if="getUnitNature(product.product.unit) == 'Integer'" label="Precio unitário" type="number" inputmode="decimal" :min="1" v-model="product.amount" class="ion-text-right"></ion-input>
                                                <ion-input  v-if="getUnitNature(product.product.unit) == 'Float'" :label="'Precio total por los ' + product.quantity + ' ' + Toolbox.inventoryProductUnitName(product.product.unit).toLowerCase() " type="number" inputmode="decimal" :min="1" v-model="product.amount" class="ion-text-right"></ion-input>

                                            </ion-item>
                                            <ion-item>
                                                <ion-input label="Cantidad" type="number" inputmode="decimal" :min="1" v-model="product.quantity" class="ion-text-right"></ion-input>
                                            </ion-item>
                                            
                                            <ion-item>
                                                <ion-input label="Producto"   class="ion-text-right" :readonly="true"></ion-input>
                                                <ion-button slot="end" @click="actions.replaceProduct(product.product)">
                                                    <ion-label>Cambiar producto</ion-label>
                                                </ion-button>
                                            </ion-item>
                                            <ion-item button :detail="false" @click="actions.removeProduct(product.product)">
                                                <ion-label color="danger" class="ion-text-center">Eliminar producto</ion-label>
                                            </ion-item>
                                        </article>  
                                        





                                        
                                        <ion-item v-for="selling in product.sellings.sold.details" :key="selling.outcome_id">
                                            <ion-label>
                                                <p>Salida de stock #00{{ selling.outcome_id }}</p>
                                            </ion-label>
                                            <ion-label slot="end" color="danger" v-if="getUnitNature(product.product.unit) == 'Integer'">
                                                <p>Salieron {{ selling.count }} items</p>
                                            </ion-label>

                                            <ion-label slot="end" color="danger" v-if="getUnitNature(product.product.unit) == 'Float'">
                                                <p>Salieron {{ selling.count }} {{ Toolbox.inventoryProductUnitName(product.product.unit).toLowerCase() }}</p>
                                            </ion-label>
                                        </ion-item>
                                    </ion-list>


                                    <article class="ion-padding" v-if="!dynamicData.isEditing">
                                        <ion-button expand="block" color="warning" @click="dynamicData.isEditing = true">
                                            <ion-label>Editar productos</ion-label>
                                            <ion-icon :icon="pencilOutline" slot="end"></ion-icon>
                                        </ion-button> 
                                    </article>
                                </article>

                                <ion-list-header>Costo final</ion-list-header>
                                <br>

                                <ion-list>
                                    <ion-item>
                                        <ion-label color="success" slot="end" class="ion-text-right">
                                            <h1><b>{{ Toolbox.moneyFormat(incomeResume.price, incomeResume.currency as unknown as EMoneyType) }}</b></h1>
                                            <p>{{ incomeResume.count }} productos</p>
                                        </ion-label>
                                    </ion-item>
                                </ion-list>
                            </section>
                        </section>
                    </ion-accordion>
                </ion-accordion-group>

                <br>
                <section class="ion-padding" v-if="!isReadonly">
                    <ion-button :disabled="isLoading" color="danger" @click="checkoutActions.deleteIncome" expand="block">
                        Borrar Ingresso de Productos
                        <ion-icon slot="end" :icon="trashBinOutline"></ion-icon>
                    </ion-button>

                    <br>
                </section>
            </article>
            <br><br><br><br><br><br><br><br><br><br><br><br>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import ExpenseSelector from '@/dialogs/ExpenseSelector/ExpenseSelector.vue';
import JobSelector from '@/dialogs/JobSelector/JobSelector.vue';
import { QRCodeScanner } from '@/dialogs/QRCodeScanner/QRCodeScanner';
import { getUnitNature, IInventoryProductItem, IProduct, IProductWithWarehouseStock, IWarehouse, IWarehouseIncome } from '@/interfaces/InventoryInterfaces';
import { EMoneyType } from '@/interfaces/ReportInterfaces';
import { ImagePicker } from '@/utils/Camera/ImagePicker';
import { Dialog, DialogEventEmitter } from '@/utils/Dialog/Dialog';
import { QRCodeParser } from '@/utils/QRCodeParser/QRCodeParser';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import { alertController, IonAccordion, IonAccordionGroup, IonAvatar, IonButton, IonButtons, IonContent, IonDatetime, IonHeader, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonProgressBar, IonSelect, IonSelectOption, IonTitle, IonToolbar, toastController } from '@ionic/vue';
import { attachOutline, camera, pencilOutline, qrCodeOutline, trashBinOutline } from 'ionicons/icons';
import { DateTime } from "luxon";
import { computed, onMounted, PropType, ref } from 'vue';
import IonItemChooseDialog from '@/components/IonItemChooseDialog/IonItemChooseDialog.vue';
import { IExpense, EExpenseUses, IJob } from '@/interfaces/JobsAndExpensesInterfaces';
import _, { replace } from 'lodash';
import InventoryProductSelector from '@/dialogs/InventoryProductSelector/InventoryProductSelector.vue';
import { InventoryStore } from '@/utils/Stored/InventoryStore';

const datetimeAccordionGroupEl = ref<any>(null);
const accordionGroupEl = ref<any>(null);
const isLoading = ref<boolean>(true);


const dynamicData = ref<{
    uploadedImageBase64: null | string,
    originalImageBase64: null | string,
    datetimePickerDate: string,
    isLoadingImageCompression: boolean,
    isEditing: boolean,
    productsListWithQuantity: Array<{
        product: IProduct,
        quantity: number,
        amount: number,
        sellings: {
            in_stock: {
                count: number
            },
            sold: {
                count: number,
                details: Array<{outcome_id: number, count: number}>
            }
        }
    }>,
    originalProductsListWithQuantity:  Array<{
        product: IProduct,
        quantity: number,
        amount: number,
        sellings: {
            in_stock: {
                count: number
            },
            sold: {
                count: number,
                details: Array<{outcome_id: number, count: number}>
            }
        }
    }>,
    listReplacedProductsIds: Array<{
        originalId: number,
        newId: number
    }>
}>({
    uploadedImageBase64: null,
    originalImageBase64: null,
    isLoadingImageCompression: false,
    isEditing: false,
    datetimePickerDate: DateTime.now().toISODate() as unknown as string,
    productsListWithQuantity: [],
    originalProductsListWithQuantity: [],
    listReplacedProductsIds: []
})
const props = defineProps({
    warehouseIncome: {
        type: Object as PropType<IWarehouseIncome>,
        required: true
    },
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
    isReadonly: {
        type: Boolean,
        default: false
    },
});

const warehouseIncome = ref<IWarehouseIncome>({
    ...props.warehouseIncome,
    date: DateTime.fromJSDate(new Date(props.warehouseIncome.date)).toFormat("dd/MM/yyyy").toString(),
});

const incomeResume = computed(() => {
    let price = 0
    dynamicData.value.productsListWithQuantity.forEach((p) => {
        if (getUnitNature(p.product.unit) == 'Integer'){
            price  += (p.quantity * p.amount)
        }else{
            price += (p.amount)
        }
    }, 0);
    const currency = warehouseIncome.value.currency;
    const quantity = (() => {
        let countProducts = 0;
        dynamicData.value.productsListWithQuantity.forEach((p) => {
            if (getUnitNature(p.product.unit) == 'Integer'){
                countProducts += parseInt(p.quantity);
            }else{
                countProducts += 1;
            }
        })
        return countProducts;
    })();


    return {
        price,
        currency,
        count: quantity
    }
})

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
            forceFromGallery,
            onLoadingCompression: (isLoading) => {
                dynamicData.value.isLoadingImageCompression = isLoading;
            }
        })

        dynamicData.value.uploadedImageBase64 = response.image;

        if (response.barcode){
            cameraActions.setBarcodeData(response.barcode);
        }
        dynamicData.value.isLoadingImageCompression = false;
    },
    deleteImageFromCamera: () => {
        dynamicData.value.uploadedImageBase64 = null;
    }
}

const actions = {
    openJobSelector: () => {
        Dialog.show(JobSelector, {
            props: {
                includeDisabledJobs: false,
                jobsFilterCallback(job: IJob){
                    const warehouse = warehousesData.value.find((w) => w.id === warehouseIncome.value.inventory_warehouse_id);

                    if (!warehouse){
                        return true;
                    }

                    if (warehouse.zone){
                        if (warehouse.country){
                            return job.zone.toLowerCase() == warehouse.zone.toLowerCase() && job.country.toLowerCase() == warehouse.country.toLowerCase();
                        }else{
                            return job.zone.toLowerCase() == warehouse.zone.toLowerCase();
                        }
                    }else{
                        if (warehouse.country){
                            return job.country.toLowerCase() == warehouse.country.toLowerCase();
                        }
                    }

                    return true;
                }
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
                expensesFilterCallback(expense: IExpense){
                    if (!expense.uses.includes(EExpenseUses.Inventory)){
                        return false;
                    }
                    return true;
                },
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
    },
    removeProduct: (product: IProduct) => {
        dynamicData.value.productsListWithQuantity = dynamicData.value.productsListWithQuantity.filter((p) => p.product.id !== product.id);
        dynamicData.value.listReplacedProductsIds = dynamicData.value.listReplacedProductsIds.filter((p) => p.originalId !== product.id).filter((p) => p.newId !== product.id);
    },
    replaceProduct: (product: IProduct) => {
        Dialog.show(InventoryProductSelector, {
            props: {
                allowMultipleSelection: false,
                filterProductsCallback: (productItem) => {
                    return getUnitNature(product.unit) == getUnitNature(productItem.unit)
                }
            },
            onLoaded($this) {
                $this.on('selected', (event:any) => {
                    const productSel = event.data;

                    //Check and block if the product was already added:
                    if (dynamicData.value.productsListWithQuantity.find((p) => p.product.id == productSel.id)){
                        alertController.create({
                            header: "Oops...",
                            message: "El producto ya fue agregado",
                            buttons: ["OK"]
                        }).then((alert) => {
                            alert.present();
                        })
                        return;
                    }


                    const index = dynamicData.value.productsListWithQuantity.findIndex((p) => p.product.id == product.id);
                    dynamicData.value.productsListWithQuantity[index].product = productSel;

                    dynamicData.value.listReplacedProductsIds.push({
                        originalId: product.id,
                        newId: productSel.id
                    });
                })
            },
        })
    }

}

const checkoutActions = {
    deleteIncome: async () => {
        const deleteIncome = async () => {
            isLoading.value = true;
            try {
                await RequestAPI.delete(`/inventory/warehouse-incomes/${props.warehouseIncome.id}`);
                props.emitter.fire('deleted', {});
                props.emitter.fire('close');
                isLoading.value = false;

                const toast = await toastController.create({
                    message: '✅ Productos borrados exitosamente',
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
        }

        //Check if there is any product that has been sold:
        const productsSold = dynamicData.value.productsListWithQuantity.filter((p) => p.sellings.sold.count > 0);
        if (productsSold.length > 0){
            const alert = alertController.create({
                header: "Advertencia",
                message: "Algunos productos de este ingreso ya hacen parte de salidas y pedidos existentes. Borrarlos modificará las salidas y pedidos ya finalizados. ¿Seguro que deseas continuar?",
                buttons: [
                    {
                        text: "Cancelar",
                        role: "cancel"
                    },
                    {
                        text: "Borrar aún así",
                        role: "destructive",
                        handler: async () => {
                            deleteIncome();
                        }
                    }
                ]
            })
            await alert.then((a) => a.present());
        }else{
            const alert = alertController.create({
                header: "¿Borrar productos?",
                message: "Al borrar los productos, no podrás recuperarlos. ¿Seguro que deseas continuar?",
                buttons: [
                    {
                        text: "Cancelar",
                        role: "cancel"
                    },
                    {
                        text: "Sí, borrar",
                        role: "destructive",
                        handler: async () => {
                            deleteIncome();
                        }
                    }
                ]
            })
            await alert.then((a) => a.present());
        }
    },
    save: async () => {
        const validationResponse = validateData();


        const productsChanges = (() => {
            const changes:any = [];
            dynamicData.value.originalProductsListWithQuantity.forEach((originalProduct) => {
                //First check if the product is in the new list:
                const newProduct = dynamicData.value.productsListWithQuantity.find((p) => p.product.id == originalProduct.product.id);

                if (!newProduct){
                    //Check if is an replacement:
                    const replacer = dynamicData.value.listReplacedProductsIds.find((p) => {
                        return p.originalId == originalProduct.product.id;
                    });


                    if (replacer){
                        const item:any = {
                            product_id: originalProduct.product.id,
                            replaces_by_product_id: replacer.newId
                        }

                        const newProductItem = dynamicData.value.productsListWithQuantity.find((p) => p.product.id == replacer.newId) as any;

                        if (newProductItem.amount != originalProduct.amount || newProductItem.quantity != originalProduct.quantity || newProductItem.product.id != originalProduct.product.id){
                            if (newProductItem.amount != originalProduct.amount){
                                item.amount = parseFloat(newProductItem.amount);
                            }

                            if (newProductItem.quantity != originalProduct.quantity){
                                item.quantity = parseInt(newProductItem.quantity);
                            }
                        }

                        changes.push(item)
                        return;
                    }else{
                        changes.push({
                            product_id: originalProduct.product.id,
                            quantity: 0
                        })
                    }


                    
                    return;
                }

                if (newProduct.amount != originalProduct.amount || newProduct.quantity != originalProduct.quantity || newProduct.product.id != originalProduct.product.id){
                    const item:any = {
                        product_id: originalProduct.product.id,
                    }

                    if (newProduct.amount != originalProduct.amount){
                        item.amount = parseFloat(newProduct.amount);
                    }

                    if (newProduct.quantity != originalProduct.quantity){
                        item.quantity = parseInt(newProduct.quantity);
                    }
                    changes.push(item)
                }
            })
            return changes;
        })();


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
        const form:any = {
            ...warehouseIncome.value,
            image: dynamicData.value.uploadedImageBase64,
            date: DateTime.fromFormat(warehouseIncome.value.date, "dd/MM/yyyy").toISO(),
        }

        if (productsChanges.length > 0){
            form.products_changes = productsChanges;
        }

        if (dynamicData.value.uploadedImageBase64 == dynamicData.value.originalImageBase64){
            form.image = undefined;
        }

        try {
            const response = await RequestAPI.put(`/inventory/warehouse-incomes/${props.warehouseIncome.id}`, form)
            props.emitter.fire('updated', {});
            props.emitter.fire('close');

            const toast = await toastController.create({
                message: '✅ Ingreso guardado exitosamente',
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

const loadImage = async () => {
    if (!props.warehouseIncome.image){
        return;
    }


    dynamicData.value.isLoadingImageCompression = true;
    const response = await RequestAPI.get(`/inventory/warehouse-incomes/${props.warehouseIncome.id}/image`);

    if (response.image){
        dynamicData.value.uploadedImageBase64 = response.image;
        dynamicData.value.originalImageBase64 = response.image;
    }
    dynamicData.value.isLoadingImageCompression = false;
}

const loadIncomeProducts = async () => {
    isLoading.value = true;
    dynamicData.value.productsListWithQuantity = (await RequestAPI.get(`/inventory/warehouse-incomes/${props.warehouseIncome.id}/products-state`) as unknown as any);
    dynamicData.value.originalProductsListWithQuantity = _.cloneDeep(dynamicData.value.productsListWithQuantity);
    dynamicData.value.datetimePickerDate = DateTime.fromISO(props.warehouseIncome.date).toISODate() as unknown as string;
    isLoading.value = false;

    loadImage();
}

const warehousesData = ref<IWarehouse[]>([]);
const loadWarehouses = async () => {
    isLoading.value = true;
    const response = await InventoryStore.getWarehouses();
    warehousesData.value = response;
    isLoading.value = false;
}

onMounted(async () => {
    isLoading.value = false;
    setTimeout(async () => {
        await loadIncomeProducts();
        accordionGroupEl.value.$el.value = "second";
    }, 100);

    loadWarehouses();
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
.offwhite{
    background-color: var(--ion-color-light-tint);
    padding-top: 10px;
    padding-bottom: 10px;
}
</style>