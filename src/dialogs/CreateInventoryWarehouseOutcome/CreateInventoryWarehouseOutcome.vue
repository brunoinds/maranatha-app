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
                                            <h2><b>{{ product.quantity }} {{Toolbox.inventoryProductUnitName(product.product.unit).toLowerCase()}}</b></h2>
                                            <p>{{ product.product.stock.in_stock_count }} disponibles</p>
                                        </ion-label>
                                    </ion-item>
                                    <ion-item :color="(product.quantity.length == 0 || product.quantity > product.product.stock.in_stock_count) ? 'warning': undefined">
                                        <ion-input :disabled="product.product.stock.in_stock_count == 0" label="Cantidad" type="number" inputmode="numeric" :min="product.product.stock.in_stock_count > 0 ? 1 : 0" :max="product.product.stock.in_stock_count" v-model="product.quantity" class="ion-text-right"></ion-input>
                                        <ion-icon v-if="(product.quantity.length == 0 || product.quantity > product.product.stock.in_stock_count)" slot="start" :icon="alertCircleOutline"></ion-icon>
                                    </ion-item>

                                    <ion-item v-if="product.product.is_loanable">
                                        <ion-toggle v-model="product.doLoan" :enable-on-off-labels="true">Modo préstamo</ion-toggle>
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
                                        <ion-label slot="end" class="ion-text-right" color="primary"  v-if="!product.doLoan">
                                            <h2 v-for="price in productsResume.find((i) => i.product == product.product)?.prices"><b>+{{ Toolbox.moneyFormat(price.amount, price.currency as unknown as EMoneyType) }}</b></h2>
                                            <p v-for="price in productsResume.find((i) => i.product == product.product)?.prices">{{ price.count }} {{Toolbox.inventoryProductUnitName(product.product.unit).toLowerCase()}} en {{ price.currency }}</p>
                                        </ion-label>

                                        <ion-label slot="end" class="ion-text-right" color="primary"  v-if="product.doLoan">
                                            <h2><b>Préstamo</b></h2>
                                            <p v-for="price in productsResume.find((i) => i.product == product.product)?.prices">{{ price.count }} unidades</p>
                                        </ion-label>
                                    </ion-item>

                                    <ion-item v-for="item in productsResume.find((i) => i.product == product.product)?.items_aggregated" v-if="!product.doLoan">
                                        <ion-label>
                                            <h3>{{ item.count }} {{Toolbox.inventoryProductUnitName(product.product.unit).toLowerCase()}}</h3>
                                            <p style="font-size: 11px;">por {{Toolbox.moneyFormat(item.unit_amount, item.currency as unknown as EMoneyType)}} cada {{Toolbox.inventoryProductUnitName(product.product.unit).toLowerCase()}}</p>
                                        </ion-label>
                                        <ion-label slot="end" class="ion-text-right" color="medium">
                                            <h2 style="font-size: 14px;"><b>{{ Toolbox.moneyFormat(item.total_amount, item.currency as unknown as EMoneyType) }}</b></h2>
                                            <p>{{ item.count }}x {{ Toolbox.moneyFormat(item.unit_amount, item.currency as unknown as EMoneyType) }}</p>
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
                                <ion-button :disabled="(outcomeResume.itemsToLoan.length + outcomeResume.itemsToSell.length + outcomeResume.itemsUncountableToSell.length) == 0 || isLoading" color="success" @click="checkoutActions.createNewOutcome" expand="block">
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
            <br><br><br><br><br><br><br><br><br><br><br><br>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonAccordion, IonAccordionGroup, IonButton, IonButtons, IonToggle, IonAvatar, IonListHeader, IonContent, IonDatetime, IonHeader, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonPage, IonProgressBar, IonSelect, IonSelectOption, IonTitle, IonToolbar, alertController, toastController } from '@ionic/vue';
import { attachOutline, camera, qrCodeOutline, trashBinOutline, checkmarkCircleOutline, bagAddOutline, alertCircleOutline } from 'ionicons/icons';
import { PropType, computed, onMounted, ref, watch } from 'vue';
import ExpenseSelector from '@/dialogs/ExpenseSelector/ExpenseSelector.vue';
import InventoryProductSelector from '@/dialogs/InventoryProductSelector/InventoryProductSelector.vue';
import JobSelector from '@/dialogs/JobSelector/JobSelector.vue';
import { QRCodeScanner } from '@/dialogs/QRCodeScanner/QRCodeScanner';
import { EMoneyType } from '@/interfaces/ReportInterfaces';
import { Dialog, DialogEventEmitter } from '@/utils/Dialog/Dialog';
import { QRCodeParser } from '@/utils/QRCodeParser/QRCodeParser';
import { DateTime } from "luxon";
import { EInventoryProductItemStatus, IInventoryProductItem, INewWarehouseOutcome, IOutcomeResumeAnalisys, IProduct, IProductWithWarehouseStock } from '@/interfaces/InventoryInterfaces';
import { ImagePicker } from '@/utils/Camera/ImagePicker';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import UsersSelector from '@/dialogs/UsersSelector/UsersSelector.vue';
import IonItemChooseDialog from '@/components/IonItemChooseDialog/IonItemChooseDialog.vue';
import { IExpense, EExpenseUses } from '@/interfaces/JobsAndExpensesInterfaces';

const datetimeAccordionGroupEl = ref<any>(null);
const accordionGroupEl = ref<any>(null);
const isLoading = ref<boolean>(true);

const outcomeResumeAnalisys = ref<{
    lastRequestId: string|null,
    analisys: null|IOutcomeResumeAnalisys
}>({
    lastRequestId: null,
    analisys: null
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
    targets: {
        type: Object as PropType<{
            jobCode: string|null,
            expenseCode: string|null,
            userId: number|null,
            products: Array<{
                product: IProductWithWarehouseStock,
                quantity: number,
                doLoan: boolean
            }>,
            outcomeRequestId: number|null
        }>,
        required: false,
    }
});

const dynamicData = ref<{
    outcomeRequestId: number|null,
    datetimePickerDate: string,
    productsListWithQuantity: Array<{product: IProductWithWarehouseStock, quantity: number, doLoan: boolean}>
}>({
    outcomeRequestId: null,
    datetimePickerDate: DateTime.now().toISODate() as unknown as string,
    productsListWithQuantity: []
})

const productsResume = computed(() => {
    return outcomeResumeAnalisys.value.analisys?.products.map((item) => {
        return {
            ...item,
            product: dynamicData.value.productsListWithQuantity.find((p) => p.product.id == item.product_id)?.product
        }
    })  || []
})


const outcomeResume = computed(() => {
    return {
        prices: (() => {
            return outcomeResumeAnalisys.value.analisys?.summary.prices || []
        })(),
        itemsToLoan: (() => {
            return outcomeResumeAnalisys.value.analisys?.summary.items_to_loan || []
        })(),
        itemsToSell: (() => {
            return outcomeResumeAnalisys.value.analisys?.summary.items_to_sell || []
        })(),
        itemsUncountableToSell: (() => {
            return outcomeResumeAnalisys.value.analisys?.summary.items_uncountable_to_sell || []
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
                            quantity: product.stock.in_stock_count > 0 ? 1 : 0,
                            doLoan: product.is_loanable ? true : false
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
                            quantity: product.quantity,
                            doLoan: product.product.is_loanable ? true : false
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
                expensesFilterCallback(expense: IExpense){
                    if (!expense.uses.includes(EExpenseUses.Inventory)){
                        return false;
                    }
                    return true;
                },
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


        const createOutomeRequest = async() => {
            if (outcomeResume.value.itemsToSell.length + outcomeResume.value.itemsUncountableToSell.length == 0){
                return;
            }

            const form = {
                ...warehouseOutcome.value,
                inventory_warehouse_id: props.warehouseId,
                date: DateTime.fromFormat(warehouseOutcome.value.date, "dd/MM/yyyy").toISO(),
                products_items: outcomeResume.value.itemsToSell.map((id: number) => {
                    return {
                        id: id
                    }
                }),
                products_items_uncountable: outcomeResume.value.itemsUncountableToSell.map((item) => {
                    return {
                        id: item.id,
                        quantity: item.quantity
                    }
                }),
                outcome_request_id: dynamicData.value.outcomeRequestId
            }
            const response = await RequestAPI.post(`/inventory/warehouse-outcomes`, form)
        }
        const createWarehouseLoans = async () => {
            if (outcomeResume.value.itemsToLoan.length == 0){
                return;
            }

            const form = {
                ...warehouseOutcome.value,
                inventory_warehouse_id: props.warehouseId,
                loaned_at: DateTime.fromFormat(warehouseOutcome.value.date, "dd/MM/yyyy").toISO(),
                products_items_ids: outcomeResume.value.itemsToLoan.map((id: number) => {
                    return id
                }),
                loaned_to_user_id: props.targets?.userId,
                inventory_warehouse_outcome_request_id: parseInt(dynamicData.value.outcomeRequestId as any)
            }
            const response = await RequestAPI.post(`/inventory/warehouse-loans`, form)
            return response;
        }
        
        try {
            const createWarehouseLoansResponse = await createWarehouseLoans();
            const createOutomeResponse = await createOutomeRequest();

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


watch(() => dynamicData.value.productsListWithQuantity, async (newValue) => {
    isLoading.value = true;
    const requestAnalisysId = crypto.randomUUID();
    outcomeResumeAnalisys.value.lastRequestId = requestAnalisysId;

    const response = await RequestAPI.post(`/inventory/warehouses/${props.warehouseId}/outcome-resume-analisys`, {
        products: newValue.map((p) => {
            return {
                product_id: p.product.id,
                quantity: parseFloat(p.quantity),
                do_loan: p.doLoan
            }
        })
    })

    if (outcomeResumeAnalisys.value.lastRequestId != requestAnalisysId){
        return;
    }

    outcomeResumeAnalisys.value.analisys = response;
    isLoading.value = false;
}, {deep: true})

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
                quantity: p.quantity,
                doLoan: p.doLoan
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