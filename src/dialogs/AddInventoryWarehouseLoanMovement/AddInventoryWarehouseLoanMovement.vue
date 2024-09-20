<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Nuevo Movimiento</ion-title>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <article>
                <section>
                    <ion-list>
                        
                        <ion-accordion-group ref="datetimeAccordionGroupEl">
                            <ion-accordion value="start" ref="datetimeAccordion" class="datetime-accordion">
                                <ion-item lines="inset" slot="header">
                                    <ion-input label="Fecha del movimiento:" label-placement="stacked" placeholder="10/10/2023" v-model="movement.date" :readonly="true"></ion-input>
                                </ion-item>
                                <ion-datetime slot="content" presentation="date" v-model="dynamicData.datetimePickerDate" @ion-change="onEvents.onDatePickerChange"></ion-datetime>
                            </ion-accordion>
                        </ion-accordion-group>
                        <ion-item-choose-dialog @click="actions.openJobSelector" placeholder="Selecciona el Job" label="Job:" :value="movement.job_code"/>
                        <ion-item-choose-dialog @click="actions.openExpenseSelector" placeholder="Selecciona el Expense" label="Expense:" :value="movement.expense_code"/>

                        <ion-item>
                            <ion-textarea label="Descripción:" label-placement="stacked"  v-model="movement.description" :auto-grow="true" :rows="1" placeholder="Descripción"></ion-textarea>
                        </ion-item>
                    </ion-list>

                    <section class="ion-padding">
                        <ion-button color="success" @click="checkoutActions.createNewMovement" expand="block">
                            Registrar Movimiento
                            <ion-icon slot="end" :icon="checkmarkCircleOutline"></ion-icon>
                        </ion-button>
                    </section>
                </section>
            </article>
            <br><br><br><br>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import IonItemChooseDialog from '@/components/IonItemChooseDialog/IonItemChooseDialog.vue';
import ExpenseSelector from '@/dialogs/ExpenseSelector/ExpenseSelector.vue';
import JobSelector from '@/dialogs/JobSelector/JobSelector.vue';
import { IExpense, EExpenseUses } from '@/interfaces/JobsAndExpensesInterfaces';
import { Dialog, DialogEventEmitter } from '@/utils/Dialog/Dialog';
import { Session } from '@/utils/Session/Session';
import { IonAccordion, IonAccordionGroup, IonButton, IonTextarea, IonButtons, IonContent, IonDatetime, IonHeader, IonIcon, IonInput, IonItem, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar, alertController } from '@ionic/vue';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { DateTime } from "luxon";
import { onMounted, ref } from 'vue';

const datetimeAccordionGroupEl = ref<any>(null);
const accordionGroupEl = ref<any>(null);
const isLoading = ref<boolean>(true);


const dynamicData = ref<{
    datetimePickerDate: string,
}>({

    datetimePickerDate: DateTime.now().toISODate() as unknown as string,
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

const movement = ref<any>({
    id: crypto.randomUUID(),
    user_id: Session.getCurrentSessionSync()?.id(),
    description: "",
    date: DateTime.now().toFormat("dd/MM/yyyy").toString(),
    job_code: "",
    expense_code: "",
});

const validateData = async () => {
    const formErrors: Array<{field: string, message: string}> = [];

    if (!movement.value.date){
        formErrors.push({
            field: "date",
            message: "La fecha de compra es requerida"
        })
    }else{
        const dt = DateTime.fromFormat(movement.value.date, "dd/MM/yyyy");
        if (!dt.isValid){
            formErrors.push({
                field: "date",
                message: "La fecha de compra es inválida " + dt.invalidExplanation
            })
        }
    }

    if (!movement.value.job_code){
        formErrors.push({
            field: "job_code",
            message: "El Job es requerido"
        })
    }

    if (!movement.value.expense_code){
        formErrors.push({
            field: "expense_code",
            message: "El Expense es requerido"
        })
    }

    if (!(movement.value.description.trim().length > 0)){
        formErrors.push({
            field: "description",
            message: "La descripción es requerida. Debes de incluir detalles como la ubicación del proyecto, etc."
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

        const previousDate = DateTime.fromFormat(movement.value.date, "dd/MM/yyyy");
        const newDate = DateTime.fromFormat(formatted, "dd/MM/yyyy");

        movement.value.date = formatted;

        //Check if the day of the month is the same:
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
                    movement.value.job_code = job.code;
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
                selectedExpenseCode: movement.value.expense_code
            },
            onLoaded($this) {
                $this.on('selected', (event:any) => {
                    const expense = event.data;
                    movement.value.expense_code = expense.code;
                })
                
                $this.on('close', () => {
                })
            },
        })
    }
}

const checkoutActions = {
    createNewMovement: async () => {
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
            ...movement.value,
            date: DateTime.fromFormat(movement.value.date, "dd/MM/yyyy").toISO(),
        }
        props.emitter.fire('create', form);
        props.emitter.fire('close');
        isLoading.value = false;
    }
}

onMounted(async () => {
    isLoading.value = false;
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