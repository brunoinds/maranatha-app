<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Registrar pago a trabajadores</ion-title>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>

            <section class="ion-padding">
                <article style="text-align: center;">
                    <br><br>
                    <ion-icon :icon="receiptOutline" style="font-size: 94px;"></ion-icon>
                    <br><br>
                </article>
            </section>

            <ion-list :inset="true">
                <ion-item-choose-dialog :disabled="isLoading" @click="openWorkersSelector" placeholder="Selecciona los trabajadores" label="Trabajadores" :value="selectedWorkersNames"/>
                <ion-item>
                    <ion-select label="Mes" label-placement="stacked" interface="action-sheet"  v-model="dynamicData.month">
                        <ion-select-option v-for="month in monthNamesAndValues" :value="month.value">{{ month.name }}</ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item>
                    <ion-select label="Año" label-placement="stacked" interface="action-sheet" v-model="dynamicData.year">
                        <ion-select-option v-for="year in Array.from({length: 3}, (v, k) => k + (new Date().getFullYear() - 1))" :value="year">{{ year }}</ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item>
                    <ion-select label="Tipo de moneda" label-placement="stacked" interface="action-sheet" v-model="dynamicData.currency" :disabled="isLoading" @ion-change="onCurrencyChange">
                        <ion-select-option value="PEN">Soles (S/.)</ion-select-option>
                        <ion-select-option value="USD">Dólares ($)</ion-select-option>
                        <ion-select-option value="BRL">Reales (R$)</ion-select-option>
                        <ion-select-option value="PYG">Guaranies (₲)</ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item>
                    <ion-input label="Observaciones" placeholder="Ej.: Pago hecho día XX/XX, código de depósito: XXX-1-XX" label-placement="stacked" v-model="dynamicData.description" :disabled="isLoading"></ion-input>
                </ion-item>
            </ion-list>

            <ion-list-header>Valores pagados</ion-list-header>
            <section class="ion-padding">
                <section class="ion-padding deposit-camp" v-if="dynamicData.divisions.length == 0">
                    <CurrencyInput ref="currencyInput" class="native-input sc-ion-input-ios" style="text-align: center; font-size: 48px;" v-if="currencyInputLifeCycleExists" v-model="dynamicData.amount" :options="{ currency: dynamicData.currency, autoDecimalDigits: false, currencyDisplay: 'narrowSymbol', locale: 'es-PE', hideCurrencySymbolOnFocus: false }"></CurrencyInput>
                </section>

                <section class="ion-padding deposit-camp" v-if="dynamicData.divisions.length > 0">
                    <p :data="divisionsValues" :readonly="true">{{Toolbox.moneyPrefix(dynamicData.currency as any)}} {{Toolbox.moneyFormat(dynamicData.amount)}}</p>
                </section>
            </section>
            
            <section class="ion-padding" style="display: flex;align-items: center;justify-content: center;margin-top: -29px;margin-bottom: -29px;">
                <ion-button expand="block" size="default" fill="clear" style="width: 50%;" @click="addDivision" :disabled="isLoading" v-if="!workerPayment">
                    <ion-icon :icon="addOutline" slot="end"></ion-icon>
                    Agregar monto
                </ion-button>
            </section>
            <ion-list :inset="true">
                <ion-item v-for="(division, index) in dynamicData.divisions" :key="division.id">
                    <div slot="start"></div>
                    <ion-input style="flex: 1 1 80%;max-width: 75%;min-width: 75%;" label="Descripción" label-placement="stacked" placeholder="Descripción" v-model="division.name"></ion-input>

                    <section style="display: flex; align-items: center;">
                        <label style="align-self: flex-end; padding-bottom: 9px; padding-right: 3px;">{{ Toolbox.moneyPrefix(dynamicData.currency as any) }}</label>
                        <ion-input min="0" max="100" style="flex: 30%; min-width: 85px; max-width: 85px;"  label="Monto" label-placement="stacked" type="number" :placeholder="'0.00'" v-model="division.amount" inputmode="decimal"></ion-input>
                    </section>
                    
                    <ion-button fill="clear" slot="end" color="danger" @click="dynamicData.divisions = dynamicData.divisions.filter(e => e.id != division.id);">
                        <ion-icon :icon="removeCircleOutline"></ion-icon>
                    </ion-button>
                </ion-item>
            </ion-list>
            

            <section class="ion-padding">
                <ion-button color="success" expand="block" size="default" style="height: 50px" @click="createPayment" :disabled="isLoading" v-if="!workerPayment">
                    <ion-icon :icon="checkmarkCircleOutline" slot="end"></ion-icon>
                    Pagar trabajadores
                </ion-button>
            </section>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { IonButton, IonButtons, IonContent, IonHeader, IonLabel, IonListHeader, IonInput,IonIcon, IonSelect, IonSelectOption, IonItem, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar, alertController, toastController } from '@ionic/vue';
import { computed, onMounted, ref, watch } from 'vue';
import { Dialog, DialogEventEmitter } from "../../utils/Dialog/Dialog";
import { arrowForwardCircleOutline, trashOutline, receiptOutline, addOutline, removeCircleOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { IWorker, IWorkerPayment, generateWorkersPaymentDefaultDivisions } from '@/interfaces/WorkerInterfaces';
import CurrencyInput from '@/components/CurrencyInput/CurrencyInput.vue';
import WorkersSelector from '@/dialogs/WorkersSelector/WorkersSelector.vue';
import { DateTime } from 'luxon';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import IonItemChooseDialog from '@/components/IonItemChooseDialog/IonItemChooseDialog.vue';


const isLoading = ref<boolean>(false);
const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
    workerPayment: {
        type: Object as () => IWorkerPayment,
        required: false
    },
    worker: {
        type: Object as () => IWorker,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    month: {
        type: Number,
        required: true
    }
});

const currencyInputLifeCycleExists = ref<boolean>(true);



const dynamicData = ref<{
    workers: Array<IWorker>;
    month: number;
    year: number;
    amount: number;
    currency: string;
    description?: string;
    divisions: Array<{id: string, name: string, amount: number}>;
}>({
    workers: [],
    month: DateTime.now().minus({ months: 1 }).month,
    year: DateTime.now().year,
    amount: props.workerPayment ? props.workerPayment.amount : 0,
    currency: props.workerPayment ? props.workerPayment.currency : 'PEN',
    description: props.workerPayment ? props.workerPayment.description : '',
    divisions: []
});

const monthNamesAndValues = [
    { name: 'Enero', value: 1 },
    { name: 'Febrero', value: 2 },
    { name: 'Marzo', value: 3 },
    { name: 'Abril', value: 4 },
    { name: 'Mayo', value: 5 },
    { name: 'Junio', value: 6 },
    { name: 'Julio', value: 7 },
    { name: 'Agosto', value: 8 },
    { name: 'Septiembre', value: 9 },
    { name: 'Octubre', value: 10 },
    { name: 'Noviembre', value: 11 },
    { name: 'Diciembre', value: 12 }
];

const selectedWorkersNames = computed(() => {
    if (dynamicData.value.workers.length == 0){
        return '';
    }
    return `${dynamicData.value.workers.map((worker) => worker.name).join('; ')}`;
});

const divisionsValues = computed(() => {
    let sumValue = 0;
    dynamicData.value.divisions.forEach((division) => {
        if (isNaN(parseFloat(division.amount as any))){
            sumValue += 0;
        }else{
            sumValue += parseFloat(division.amount as any);
        }
    });
    if (dynamicData.value.divisions.length > 0){
        dynamicData.value.amount = sumValue;
    }

    return sumValue;
});

const onCurrencyChange = () => {
    currencyInputLifeCycleExists.value = false;
    setTimeout(() => {
        currencyInputLifeCycleExists.value = true;
    }, 100);
}
const createPayment = async () => {
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

    const alert = await alertController.create({
        header: 'Confirmar pago',
        message: `¿Está seguro de registrar el pago de S/. ${dynamicData.value.amount} a los ${dynamicData.value.workers.length} trabajadores seleccionados para el mes ${monthNamesAndValues.find((item) => {return item.value == dynamicData.value.month as any})?.name.toUpperCase()} del año ${dynamicData.value.year}? Si el trabajador ya ha recibido en el mes, se cambiará el monto.`,
        buttons: [
            {
                text: 'Cancelar',
                role: 'cancel',
                cssClass: 'secondary'
            },
            {
                text: 'Aceptar',
                handler: () => {
                    createWorkersPayment();
                }
            }
        ]
    });
    await alert.present();


    function createWorkersPayment(){
        isLoading.value = true;
        const dataParsed = {
            workers_dni: dynamicData.value.workers.map((worker) => worker.dni),
            month: dynamicData.value.month,
            year: dynamicData.value.year,
            amount: dynamicData.value.amount,
            currency: dynamicData.value.currency,
            description: dynamicData.value.description,
            divisions: dynamicData.value.divisions.map((division) => {
                return {
                    id: division.id,
                    name: division.name,
                    amount: parseFloat(division.amount as any)
                }
            })
        }

        RequestAPI.post('/workers-payments', dataParsed).then((response) => {
            props.emitter.fire('created', {});
            props.emitter.fire('close');

            toastController.create({
                message: '✅ Pago registrado exitosamente',
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
}

const validateCamps = () => {
    let errors:Array<string> = [];

    if (dynamicData.value.amount == 0){
        errors.push("Por favor, ingrese un monto válido");
    }


    return {
        isValid: errors.length == 0,
        errors: errors
    }
}

const openWorkersSelector = () => {
    Dialog.show(WorkersSelector, {
        props: {
            allowMultipleChoice: true,
            selectedWorkersDNI: dynamicData.value.workers.map((worker) => worker.dni)
        },
        onLoaded($this) {
            $this.on('selected', (event:any) => {
                const workers = event.data;
                dynamicData.value.workers = workers;
            })
        },
    })
}

const addDivision = () => {
    dynamicData.value.divisions.push({
        id: Math.random().toString(36).substring(7),
        name: 'Monto sin nombre',
        amount: (dynamicData.value.divisions.length == 0) ? dynamicData.value.amount : 0
    });
}

onMounted(() => {
    generateWorkersPaymentDefaultDivisions().map((division) => {
        dynamicData.value.divisions.push(division);
    });
})
</script>

<style scoped lang="scss">
.deposit-camp{
    background-color: var(--ion-color-light-tint);
    border-radius: 19px;
    &:focus-within{
        background-color: var(--ion-color-light-shade);
    }
    > p{
        text-align: center;
        font-size: 48px;
        margin: 0;
    }
}
</style>