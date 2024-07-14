<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button :disabled="isLoading" @click="emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Salida de Productos</ion-title>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <article>
                <ion-accordion-group ref="accordionGroupEl">
                    <ion-accordion value="first">
                        <ion-item slot="header" color="light">
                            <ion-label>
                                <h2><b>1. Agregar productos a despachar</b></h2>
                                <p>Selecciona los productos que deseas despachar</p>
                            </ion-label>
                        </ion-item>
                        <section slot="content">
                            <section class="offwhite">
                                <ion-list :inset="true" v-for="product in dynamicData.productsListWithQuantity" :key="product.product.id">
                                    <ion-item>
                                        <ion-avatar slot="start" v-if="product.product.image">
                                            <img :src="product.product.image" />
                                        </ion-avatar>
                                        <ion-label>
                                            <h2><b>{{ product.product.name }}</b></h2>
                                            <p>{{ product.product.description }}</p>
                                            <p>{{ product.product.brand }}</p>
                                        </ion-label>

                                        <ion-chip slot="end" color="danger" v-if="product.product.stock.in_stock_count == 0">Agotado</ion-chip>

                                        <ion-label slot="end" class="ion-text-right" color="primary" v-if="product.product.stock.in_stock_count > 0">
                                            <h2><b>{{ product.quantity }} unidades</b></h2>
                                            <p>{{ product.product.stock.in_stock_count }} disponibles</p>
                                        </ion-label>
                                    </ion-item>
                                    <ion-item :color="(product.quantity.length == 0 || product.quantity > product.product.stock.in_stock_count) ? 'warning': undefined">
                                        <ion-input :disabled="product.product.stock.in_stock_count == 0" label="Cantidad" type="number" inputmode="numeric" :min="product.product.stock.in_stock_count > 0 ? 1 : 0" :max="product.product.stock.in_stock_count" v-model="product.quantity" class="ion-text-right"></ion-input>
                                        <ion-icon v-if="(product.quantity.length == 0 || product.quantity > product.product.stock.in_stock_count)" slot="start" :icon="alertCircleOutline"></ion-icon>
                                    </ion-item>



                                    <ion-item button :detail="false" @click="actions.removeProduct(product.product)">
                                        <ion-label color="danger" class="ion-text-center">Eliminar producto</ion-label>
                                    </ion-item>
                                </ion-list>

                                <section class="ion-padding">
                                    <ion-button @click="actions.addNewProduct" expand="block" fill="outline">
                                        <ion-icon slot="end" :icon="bagAddOutline"></ion-icon>
                                        Agregar Productos
                                    </ion-button>
                                </section>
                            </section>
                            
                            
                        </section>
                    </ion-accordion>
                    <ion-accordion value="second">
                        <ion-item slot="header" color="light">
                            <ion-label>
                                <h2><b>2. Datos de la venta</b></h2>
                                <p>Completa los datos de la venta</p>
                            </ion-label>
                        </ion-item>
                        <section slot="content">
                            <ion-list>
                                <ion-item>
                                    <ion-input label="Observaciones:" label-placement="stacked" placeholder="Ej.: material para construcción" v-model="warehouseOutcome.description"></ion-input>
                                </ion-item>
                                <ion-accordion-group ref="datetimeAccordionGroupEl">
                                    <ion-accordion value="start" ref="datetimeAccordion" class="datetime-accordion">
                                        <ion-item lines="inset" slot="header">
                                            <ion-input label="Fecha de despacho del stock:" label-placement="stacked" placeholder="10/10/2023" v-model="warehouseOutcome.date" :readonly="true"></ion-input>
                                        </ion-item>
                                        <ion-datetime slot="content" presentation="date" v-model="dynamicData.datetimePickerDate" @ion-change="onEvents.onDatePickerChange"></ion-datetime>
                                    </ion-accordion>
                                </ion-accordion-group>
                            </ion-list>

                            <ion-list>
                                <ion-item-choose-dialog @click="actions.openJobSelector" placeholder="Selecciona el Job" label="Job:" :value="warehouseOutcome.job_code"/>
                                <ion-item-choose-dialog @click="actions.openExpenseSelector" placeholder="Selecciona el Expense" label="Expense:" :value="warehouseOutcome.expense_code"/>
                            </ion-list>
                        </section>
                    </ion-accordion>
                    <ion-accordion value="third">
                        <ion-item slot="header" color="light">
                            <ion-label>
                                <h2><b>3. Confirmar precios</b></h2>
                                <p>Revisa los valores y confirma el despacho del stock</p>
                            </ion-label>
                        </ion-item>
                        <section slot="content">
                            <section class="offwhite">
                                <ion-list-header>Ítems</ion-list-header>
                                <br>
                                <ion-list :inset="true" v-for="product in dynamicData.productsListWithQuantity" :key="product.product.id" v-show="product.quantity > 0">
                                    <ion-item>
                                        <ion-avatar slot="start" v-if="product.product.image">
                                            <img :src="product.product.image" />
                                        </ion-avatar>
                                        <ion-label>
                                            <h2><b>{{ product.product.name }}</b></h2>
                                            <p>{{ product.product.description }}</p>
                                            <p>{{ product.product.brand }}</p>
                                        </ion-label>
                                        <ion-label slot="end" class="ion-text-right" color="primary">
                                            <h2 v-for="price in productsResume.find((i) => i.product == product.product)?.prices"><b>+{{ Toolbox.moneyFormat(price.amount, price.currency as unknown as EMoneyType) }}</b></h2>
                                            <p v-for="price in productsResume.find((i) => i.product == product.product)?.prices">{{ price.count }} unidades en {{ price.currency }}</p>
                                        </ion-label>
                                    </ion-item>

                                    <ion-item v-for="item in productsResume.find((i) => i.product == product.product)?.itemsAggregated">
                                        <ion-label>
                                            <h3>{{ item.count }} unidades</h3>
                                            <p style="font-size: 11px;">por {{Toolbox.moneyFormat(item.unitAmount, item.currency as unknown as EMoneyType)}} cada</p>
                                        </ion-label>
                                        <ion-label slot="end" class="ion-text-right" color="medium">
                                            <h2 style="font-size: 14px;"><b>{{ Toolbox.moneyFormat(item.totalAmount, item.currency as unknown as EMoneyType) }}</b></h2>
                                            <p>{{ item.count }}x {{ Toolbox.moneyFormat(item.unitAmount, item.currency as unknown as EMoneyType) }}</p>
                                        </ion-label>
                                    </ion-item>
                                </ion-list>
                            </section>

                            <ion-list-header>Costo final</ion-list-header>
                            <br><br>

                            <ion-list>
                                <ion-item v-for="(price, index) in outcomeResume.prices" :key="price.currency">
                                    <ion-label color="success" slot="end" class="ion-text-right">
                                        <h1><b v-if="index != 0">+</b><b>{{ Toolbox.moneyFormat(price.amount, price.currency as unknown as EMoneyType) }}</b></h1>
                                        <p>{{ price.count }} productos en {{ price.currency }}</p>
                                    </ion-label>
                                </ion-item>
                            </ion-list>

                            <section class="ion-padding">
                                <ion-button :disabled="outcomeResume.prices.length == 0" color="success" @click="checkoutActions.createNewOutcome" expand="block">
                                    Confirmar Salida de Productos
                                    <ion-icon slot="end" :icon="checkmarkCircleOutline"></ion-icon>
                                </ion-button>
                                <ion-label class="ion-text-center" v-if="outcomeResume.prices.length == 0">
                                    <br>
                                    <p>Por favor, agrega al menos 1 producto para despachar</p>
                                </ion-label>
                            </section>
                        </section>
                    </ion-accordion>
                </ion-accordion-group>
            </article>
            <br><br><br><br>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonAccordion, IonAccordionGroup, IonButton, IonButtons, IonAvatar, IonListHeader, IonContent, IonDatetime, IonHeader, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonPage, IonProgressBar, IonSelect, IonSelectOption, IonTitle, IonToolbar, alertController, toastController } from '@ionic/vue';
import { attachOutline, camera, qrCodeOutline, trashBinOutline, checkmarkCircleOutline, bagAddOutline, alertCircleOutline } from 'ionicons/icons';
import { PropType, computed, onMounted, ref } from 'vue';
import ExpenseSelector from '@/dialogs/ExpenseSelector/ExpenseSelector.vue';
import InventoryProductSelector from '@/dialogs/InventoryProductSelector/InventoryProductSelector.vue';
import JobSelector from '@/dialogs/JobSelector/JobSelector.vue';
import { QRCodeScanner } from '@/dialogs/QRCodeScanner/QRCodeScanner';
import { EMoneyType } from '@/interfaces/ReportInterfaces';
import { Dialog, DialogEventEmitter } from '@/utils/Dialog/Dialog';
import { QRCodeParser } from '@/utils/QRCodeParser/QRCodeParser';
import { DateTime } from "luxon";
import { EInventoryProductItemStatus, IInventoryProductItem, INewWarehouseOutcome, IProduct, IProductWithWarehouseStock } from '@/interfaces/InventoryInterfaces';
import { ImagePicker } from '@/utils/Camera/ImagePicker';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import UsersSelector from '@/dialogs/UsersSelector/UsersSelector.vue';
import IonItemChooseDialog from '@/components/IonItemChooseDialog/IonItemChooseDialog.vue';

const datetimeAccordionGroupEl = ref<any>(null);
const accordionGroupEl = ref<any>(null);
const isLoading = ref<boolean>(true);



const props = defineProps({
    warehouseId: {
        type: Number,
        required: true
    },
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
    targets: {
        type: Object as PropType<{
            jobCode: string|null,
            expenseCode: string|null,
            userId: number|null,
            products: Array<{
                product: IProductWithWarehouseStock,
                quantity: number
            }>,
            outcomeRequestId: number|null
        }>,
        required: false,
    }
});

const dynamicData = ref<{
    outcomeRequestId: number|null,
    datetimePickerDate: string,
    productsListWithQuantity: Array<{product: IProductWithWarehouseStock, quantity: number}>
}>({
    outcomeRequestId: null,
    datetimePickerDate: DateTime.now().toISODate() as unknown as string,
    productsListWithQuantity: []
})

const productsResume = computed(() => {
    return dynamicData.value.productsListWithQuantity.map((p) => {
        const itemsChoosenToSell = (() => {
            const itemsAvailableToSell = p.product.stock.items.filter((item) => {
                return item.status == EInventoryProductItemStatus.InStock
            }).sort((a, b) => {
                //Using FIFO method to sell products:
                return a.order - b.order
            })
            return itemsAvailableToSell.slice(0, p.quantity)
        })();

        const itemsChoosenToSellAggregated = (() => {
            const items = itemsChoosenToSell.reduce((acc, item) => {
                    const key = item.buy_currency + item.buy_amount;
                    if (!acc[key]){
                        acc[key] = {
                            currency: item.buy_currency,
                            unitAmount: item.buy_amount,
                            count: 1,
                            totalAmount: item.buy_amount
                        }
                    }else{
                        acc[key].count++;
                        acc[key].totalAmount += item.buy_amount;
                    }
                    return acc;
            }, {} as {[key: string]: {currency: string, unitAmount: number, count: number, totalAmount: number}})
            return Object.keys(items).map((key) => items[key]);
        })()

        const currenciesFound = itemsChoosenToSell.map((item) => item.buy_currency).filter((value, index, self) => self.indexOf(value) === index);

        return {
            product: p.product,
            quantity: p.quantity,
            items: itemsChoosenToSell,
            itemsAggregated: itemsChoosenToSellAggregated,
            prices: currenciesFound.map((currency) => {
                return {
                    currency,
                    amount: itemsChoosenToSell.filter((item) => item.buy_currency == currency).reduce((acc, item) => acc + item.buy_amount, 0),
                    count: itemsChoosenToSell.filter((item) => item.buy_currency == currency).length
                }
            })
        }
    })
})


const outcomeResume = computed(() => {
    return {
        prices: (() => {
            const items = productsResume.value.reduce((acc, product) => {
                product.items.forEach((item) => {
                    const key = item.buy_currency;
                    if (!acc[key]){
                        acc[key] = {
                            currency: item.buy_currency,
                            amount: item.buy_amount,
                            count: 1
                        }
                    }else{
                        acc[key].amount += item.buy_amount;
                        acc[key].count++;
                    }
                })
                return acc;
            }, {} as {[key: string]: {currency: string, amount: number, count: number}})
            return Object.keys(items).map((key) => items[key]);
        })(),
        items: (() => {
            return productsResume.value.reduce((acc, product) => {
                return acc.concat(product.items)
            }, [])
        })()
    }
})

const warehouseOutcome = ref<INewWarehouseOutcome>({
    inventory_warehouse_id: props.warehouseId,
    description: "",
    date: DateTime.now().toFormat("dd/MM/yyyy").toString(),
    job_code: "",
    expense_code: "",
});

const validateData = async () => {
    const formErrors: Array<{field: string, message: string}> = [];

    if (!warehouseOutcome.value.date){
        formErrors.push({
            field: "date",
            message: "La fecha de compra es requerida"
        })
    }else{
        const dt = DateTime.fromFormat(warehouseOutcome.value.date, "dd/MM/yyyy");
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

        const previousDate = DateTime.fromFormat(warehouseOutcome.value.date, "dd/MM/yyyy");
        const newDate = DateTime.fromFormat(formatted, "dd/MM/yyyy");

        warehouseOutcome.value.date = formatted;

        if (previousDate.day == newDate.day){
            return;
        }else{
            datetimeAccordionGroupEl.value.$el.value = undefined;
        }
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
                    products.forEach((product:IProductWithWarehouseStock) => {
                        if (dynamicData.value.productsListWithQuantity.find((p) => p.product.id === product.id)){
                            return;
                        }
                        dynamicData.value.productsListWithQuantity.push({
                            product,
                            quantity: 0
                        })
                    })
                })
                $this.on('selected-with-quantity', (event:any) => {
                    const products = event.data as Array<{product: IProductWithWarehouseStock, quantity: number}>;
                    products.forEach((product) => {
                        if (dynamicData.value.productsListWithQuantity.find((p) => p.product.id === product.product.id)){
                            return;
                        }
                        dynamicData.value.productsListWithQuantity.push({
                            product: product.product,
                            quantity: product.quantity
                        })
                    })
                })
            },
        })
    },
    removeProduct: (product: IProduct) => {
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
                    warehouseOutcome.value.job_code = job.code;
                })
                
            },
        })
    },
    openExpenseSelector: () => {
        Dialog.show(ExpenseSelector, {
            props: {
                selectedExpenseCode: warehouseOutcome.value.expense_code
            },
            onLoaded($this) {
                $this.on('selected', (event:any) => {
                    const expense = event.data;
                    warehouseOutcome.value.expense_code = expense.code;
                })
                
                $this.on('close', () => {
                })
            },
        })
    },
    openUserSelector: () => {
        Dialog.show(UsersSelector, {
            props: {
                selectedUserId: warehouseOutcome.value.user_id
            },
            onLoaded($this) {
                $this.on('selected', (event:any) => {
                    const user = event.data;
                    warehouseOutcome.value.user_id = user.id;
                })
                
                $this.on('close', () => {
                })
            },
        })
    }
}

const checkoutActions = {
    createNewOutcome: async () => {
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
            ...warehouseOutcome.value,
            inventory_warehouse_id: props.warehouseId,
            date: DateTime.fromFormat(warehouseOutcome.value.date, "dd/MM/yyyy").toISO(),
            products_items: outcomeResume.value.items.map((item: IInventoryProductItem) => {
                return {
                    id: item.id
                }
            }),
            outcome_request_id: dynamicData.value.outcomeRequestId
        }

        try {
            const response = await RequestAPI.post(`/inventory/warehouse-outcomes`, form)
            props.emitter.fire('created', {});
            props.emitter.fire('close');

            const toast = await toastController.create({
                message: '✅ Productos despachados exitosamente',
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


    if (props.targets){
        warehouseOutcome.value.job_code = props.targets.jobCode || "";
        warehouseOutcome.value.expense_code = props.targets.expenseCode || "";
        warehouseOutcome.value.user_id = props.targets.userId || null;
        dynamicData.value.productsListWithQuantity = props.targets.products.map((p) => {
            return {
                product: p.product,
                quantity: p.quantity
            }
        })
        dynamicData.value.outcomeRequestId = props.targets.outcomeRequestId;
    }

})
</script>

<style scoped lang="scss">
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