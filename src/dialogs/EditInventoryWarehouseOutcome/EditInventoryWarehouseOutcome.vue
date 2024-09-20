<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button v-if="!isReadonly" @click="emitter.fire('close')">Cancelar</ion-button>
                    <ion-button v-if="isReadonly" @click="emitter.fire('close')">Cerrar</ion-button>
                </ion-buttons>
                <ion-title>Salida de Productos #00{{ warehouseOutcome.id }}</ion-title>
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
                                <h2><b>1. Datos de la venta</b></h2>
                                <p>Datos referente a la venta de los productos</p>
                            </ion-label>
                        </ion-item>
                        <section slot="content">
                            <ion-list>
                                <ion-item>
                                    <ion-input :disabled="isReadonly" label="Observaciones:" label-placement="stacked" placeholder="Ej.: material para construcción" v-model="warehouseOutcome.description"></ion-input>
                                </ion-item>
                                <ion-accordion-group ref="datetimeAccordionGroupEl">
                                    <ion-accordion value="start" ref="datetimeAccordion" class="datetime-accordion">
                                        <ion-item lines="inset" slot="header">
                                            <ion-input :disabled="isReadonly" label="Fecha de despacho del stock:" label-placement="stacked" placeholder="10/10/2023" v-model="warehouseOutcome.date" :readonly="true"></ion-input>
                                        </ion-item>
                                        <ion-datetime :disabled="isReadonly" slot="content" presentation="date" v-model="dynamicData.datetimePickerDate" @ion-change="onEvents.onDatePickerChange"></ion-datetime>
                                    </ion-accordion>
                                </ion-accordion-group>
                            </ion-list>

                            <ion-list>
                                <ion-item-choose-dialog :disabled="isReadonly" @click="actions.openJobSelector" placeholder="Selecciona el Job" label="Job:" :value="warehouseOutcome.job_code"/>
                                <ion-item-choose-dialog :disabled="isReadonly" @click="actions.openExpenseSelector" placeholder="Selecciona el Expense" label="Expense:" :value="warehouseOutcome.expense_code"/>
                            </ion-list>
                        </section>
                    </ion-accordion>
                    <ion-accordion value="second">
                        <ion-item slot="header" color="light">
                            <ion-label>
                                <h2><b>2. Productos</b></h2>
                                <p>Productos despachados y valor final de la venta</p>
                            </ion-label>
                        </ion-item>
                        <section slot="content">
                            <article v-if="productsResume.length > 0">
                                <section class="offwhite">
                                    <ion-list-header>Ítems</ion-list-header>
                                    <ion-list :inset="true" v-for="product in productsResume" :key="product.product.id">
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

                                        <ion-item v-for="item in product.itemsAggregated">
                                            <ion-label>
                                                <h3>{{ item.count }} unidades</h3>
                                                <p style="font-size: 11px;">por {{Toolbox.moneyFormat(item.amount, item.currency as unknown as EMoneyType)}} cada</p>
                                            </ion-label>
                                            <ion-label slot="end" class="ion-text-right" color="medium">
                                                <h2 style="font-size: 14px;"><b>{{ Toolbox.moneyFormat((item.amount * item.count), item.currency as unknown as EMoneyType) }}</b></h2>
                                                <p>{{ item.count }}x {{ Toolbox.moneyFormat(item.amount, item.currency as unknown as EMoneyType) }}</p>
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
                            </article>
                            
                            <section v-else class="offwhite">
                                <br>
                                <ion-label class="ion-text-center">
                                    <p><b>Los productos de este despacho han sido removidos porqué el administrador <br> borró sus ingresos al stock.</b></p>
                                </ion-label>
                                <br>
                            </section>
                            
                        </section>
                    </ion-accordion>
                </ion-accordion-group>

                <br>

                <section class="ion-padding">
                    <ion-button :disabled="isLoading" fill="outline" color="primary" @click="actions.downloadPDF" expand="block">
                        Imprimir comprobante
                        <ion-icon slot="end" :icon="printOutline"></ion-icon>
                    </ion-button>
                </section>

                <section class="ion-padding" v-if="!isReadonly">
                    <ion-button :disabled="isLoading" color="danger" @click="checkoutActions.delete" expand="block">
                        Borrar Despacho de Productos
                        <ion-icon slot="end" :icon="trashBinOutline"></ion-icon>
                    </ion-button>

                    <br>
                    <ion-label class="ion-text-center">
                        <p>Una vez despachado los productos, no se puede modificar sus cantidades y precios. Si deseas modificarlos, debes de borrar todo el despacho.</p>
                    </ion-label>
                </section>
            </article>
            <br><br><br><br><br><br><br><br><br><br><br><br>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import ExpenseSelector from '@/dialogs/ExpenseSelector/ExpenseSelector.vue';
import JobSelector from '@/dialogs/JobSelector/JobSelector.vue';
import UsersSelector from '@/dialogs/UsersSelector/UsersSelector.vue';
import { IInventoryProductItem, IProduct, IProductWithWarehouseStock, IWarehouseOutcome } from '@/interfaces/InventoryInterfaces';
import { EMoneyType } from '@/interfaces/ReportInterfaces';
import { Dialog, DialogEventEmitter } from '@/utils/Dialog/Dialog';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import { Capacitor } from '@capacitor/core';
import { IonAccordion, IonAccordionGroup, IonAvatar, IonButton, IonButtons, IonContent, IonDatetime, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonProgressBar, IonTitle, IonToolbar, alertController, toastController } from '@ionic/vue';
import { cloudDownloadOutline, printOutline, trashBinOutline } from 'ionicons/icons';
import { DateTime } from "luxon";
import { PropType, computed, onMounted, ref } from 'vue';
import IonItemChooseDialog from '@/components/IonItemChooseDialog/IonItemChooseDialog.vue';
import { InventoryStore } from '@/utils/Stored/InventoryStore';
import { IExpense, EExpenseUses } from '@/interfaces/JobsAndExpensesInterfaces';

const datetimeAccordionGroupEl = ref<any>(null);
const accordionGroupEl = ref<any>(null);
const isLoading = ref<boolean>(true);



const props = defineProps({
    warehouseOutcome: {
        type: Object as PropType<IWarehouseOutcome>,
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

const dynamicData = ref<{
    datetimePickerDate: string,
    productsListWithQuantity: Array<{product: IProductWithWarehouseStock, quantity: number}>
}>({
    datetimePickerDate: DateTime.now().toISODate() as unknown as string,
    productsListWithQuantity: []
})

const productsResume = ref<Array<any>>([])

const outcomeResume = computed(() => {
    return {
        prices: (() => {
            const items = productsResume.value.reduce((acc, product) => {
                product.items.forEach((item) => {
                    const key = item.sell_currency;
                    if (!acc[key]){
                        acc[key] = {
                            currency: item.sell_currency,
                            amount: item.sell_amount,
                            count: 1
                        }
                    }else{
                        acc[key].amount += item.sell_amount;
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

const warehouseOutcome = ref<IWarehouseOutcome>({
    ...props.warehouseOutcome,
    date: DateTime.fromJSDate(new Date(props.warehouseOutcome.date)).toFormat("dd/MM/yyyy").toString(),
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
    },
    downloadPDF: async () => {
        const generatePDFDocument = async () => {
            return new Promise(async (resolve, reject) => {
                const pdfDownloadUrl = `${RequestAPI.variables.rootUrl}/inventory/warehouse-outcomes/${props.warehouseOutcome.id}/download-pdf`;

                const pdfDocument = await Toolbox.fetchWithProgress(pdfDownloadUrl,  {
                    method: 'GET',
                    headers: {
                        'Authorization': await RequestAPI.authHeader()
                    }
                }, (progress) => {
                }).then((blob) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        resolve({
                            blobUrl: URL.createObjectURL(blob),
                            base64: reader.result?.split(';base64,')[1] as unknown as string
                        })
                    }
                    reader.onerror = () => {                
                        
                    }
                    reader.readAsDataURL(blob);
                }).catch((error) => {
                }).finally(() => {
                })
            });
        }
        const shareDocument = (file:any, extention:string = ".zip") => {
            toastController.create({
                message: '✅ Documento generado con éxito!',
                duration: 1500
            }).then((toast) => {
                toast.present();
            })
            if (Capacitor.isNativePlatform()){
                Toolbox.openNative('Comprobante Salida Almacén N00' + warehouseOutcome.value.id + extention, file.base64);
            }else{
                let link = document.createElement('a');
                link.href = file.blobUrl;
                link.download = 'Comprobante Salida Almacén N00' + warehouseOutcome.value.id + extention;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }

        isLoading.value = true;
        const pdfDocument = await generatePDFDocument();
        shareDocument(pdfDocument, '.pdf');
        isLoading.value = false;
    }   
}

const checkoutActions = {
    delete: async () => {
        const deleteOutcome = async () => {
            isLoading.value = true;
            try {
                await RequestAPI.delete(`/inventory/warehouse-outcomes/${props.warehouseOutcome.id}`);
                props.emitter.fire('deleted', {});
                props.emitter.fire('close');
                isLoading.value = false;

                const toast = await toastController.create({
                    message: '✅ Los productos han regresado al stock',
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

        const alert = alertController.create({
            header: "¿Borrar despacho de productos?",
            message: "Los productos regresarán al stock, ¿estás seguro que deseas borrar este despacho?",
            buttons: [
                {
                    text: "Cancelar",
                    role: "cancel"
                },
                {
                    text: "Sí, borrar",
                    role: "destructive",
                    handler: async () => {
                        deleteOutcome();
                    }
                }
            ]
        })
        await alert.then((a) => a.present());
    },
    save: async () => {
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
        const form:any = {
            ...warehouseOutcome.value,
            date: DateTime.fromFormat(warehouseOutcome.value.date, "dd/MM/yyyy").toISO()
        }


        try {
            const response = await RequestAPI.put(`/inventory/warehouse-outcomes/${props.warehouseOutcome.id}`, form)
            props.emitter.fire('updated', {});
            props.emitter.fire('close');

            const toast = await toastController.create({
                message: '✅ Despacho guardado exitosamente',
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

const loadOutcomeProducts = async () => {
    isLoading.value = true;
    const responseProductsItems = (await RequestAPI.get(`/inventory/warehouse-outcomes/${props.warehouseOutcome.id}/products`) as unknown as Array<IInventoryProductItem>);
    const responseProducts = (await InventoryStore.getProducts() as unknown as Array<IProduct>);

    productsResume.value = responseProducts.map((product) => {
        const productItems = responseProductsItems.filter((item) => item.inventory_product_id == product.id);

        if (productItems.length == 0){
            return null;
        }

        return {
            product,
            items: productItems,
            itemsAggregated: (() => {
                //Group productItems by item.sell_currency + item.sell_amount:
                const itemsGrouped = productItems.reduce((acc, item) => {
                    const key = item.sell_currency + item.sell_amount;
                    if (!acc[key]){
                        acc[key] = {
                            currency: item.sell_currency,
                            amount: item.sell_amount,
                            count: 1
                        }
                    }else{
                        acc[key].count++;
                    }
                    return acc;
                }, {} as {[key: string]: {currency: string, amount: number, count: number}})
                return Object.keys(itemsGrouped).map((key) => itemsGrouped[key]);
            })(),
            quantity: productItems.length,
            prices: (() => {
                const currenciesFound = productItems.map((item) => item.sell_currency).filter((value, index, self) => self.indexOf(value) === index);
                return currenciesFound.map((currency) => {
                    return {
                        currency,
                        amount: productItems.filter((item) => item.sell_currency == currency).reduce((acc, item) => acc + item.sell_amount, 0),
                        count: productItems.filter((item) => item.sell_currency == currency).length
                    }
                })
            })()
        }
    }).filter((product) => product != null);

    dynamicData.value.datetimePickerDate = DateTime.fromISO(props.warehouseOutcome.date).toISODate() as unknown as string;
    isLoading.value = false;
}


onMounted(async () => {
    isLoading.value = false;
    setTimeout(async () => {
        await loadOutcomeProducts();
        accordionGroupEl.value.$el.value = "second";
    }, 100);
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