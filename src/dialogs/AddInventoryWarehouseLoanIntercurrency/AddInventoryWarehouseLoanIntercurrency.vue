<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Nueva Intercurrencia</ion-title>
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
                                    <ion-input label="Fecha de la intercurrencia:" label-placement="stacked" placeholder="10/10/2023" v-model="intercurrency.date" :readonly="true"></ion-input>
                                </ion-item>
                                <ion-datetime slot="content" presentation="date" v-model="dynamicData.datetimePickerDate" @ion-change="onEvents.onDatePickerChange"></ion-datetime>
                            </ion-accordion>
                        </ion-accordion-group>
                        <ion-item>
                            <ion-textarea label="Descripción:" label-placement="stacked" v-model="intercurrency.description" :auto-grow="true" :rows="1" placeholder="Descripción"></ion-textarea>
                        </ion-item>
                    </ion-list>

                    <section class="ion-padding">
                        <ion-button color="success" @click="checkoutActions.createNewIntercurrency" expand="block">
                            Registrar Intercurrencia
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

const intercurrency = ref<any>({
    id: crypto.randomUUID(),
    user_id: Session.getCurrentSessionSync()?.id(),
    description: "",
    date: DateTime.now().toFormat("dd/MM/yyyy").toString(),
});

const validateData = async () => {
    const formErrors: Array<{field: string, message: string}> = [];

    if (!intercurrency.value.date){
        formErrors.push({
            field: "date",
            message: "La fecha de compra es requerida"
        })
    }else{
        const dt = DateTime.fromFormat(intercurrency.value.date, "dd/MM/yyyy");
        if (!dt.isValid){
            formErrors.push({
                field: "date",
                message: "La fecha de compra es inválida " + dt.invalidExplanation
            })
        }
    }

    if (!(intercurrency.value.description.trim().length > 0)){
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

        const previousDate = DateTime.fromFormat(intercurrency.value.date, "dd/MM/yyyy");
        const newDate = DateTime.fromFormat(formatted, "dd/MM/yyyy");

        intercurrency.value.date = formatted;

        //Check if the day of the month is the same:
        if (previousDate.day == newDate.day){
            return;
        }else{
            datetimeAccordionGroupEl.value.$el.value = undefined;
        }
    }
}


const checkoutActions = {
    createNewIntercurrency: async () => {
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
            ...intercurrency.value,
            date: DateTime.fromFormat(intercurrency.value.date, "dd/MM/yyyy").toISO(),
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