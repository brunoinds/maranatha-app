<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Editar Almacén</ion-title>

                <ion-buttons slot="end">
                    <ion-button v-if="!isLoading" @click="saveWarehouse">Guardar</ion-button>
                </ion-buttons>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <section class="ion-padding">
                <article style="text-align: center;">
                    <br><br>
                    <ion-icon :icon="storefrontOutline" style="font-size: 94px;"></ion-icon>
                    <br><br>
                </article>
            </section>
            <ion-list :inset="true">
                <ion-item>
                    <ion-input label="Nombre del almacén" placeholder="Ej.: Almacén central" label-placement="stacked" v-model="dynamicData.name" :disabled="isLoading"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-select label="País" label-placement="stacked" interface="action-sheet" v-model="dynamicData.country" :disabled="isLoading">
                        <ion-select-option value="PE">Perú 🇵🇪</ion-select-option>
                        <ion-select-option value="BR">Brasil 🇧🇷</ion-select-option>
                        <ion-select-option value="PY">Paraguay 🇵🇾</ion-select-option>
                        <ion-select-option value="US">EE. UU. 🇺🇸</ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item>
                    <ion-select label="Zona:" label-placement="stacked" interface="action-sheet" v-model="dynamicData.zone" :disabled="isLoading">
                        <ion-select-option v-for="zone in  _.uniq(jobsAndExpenses.jobs.map(job => job.zone))">{{ zone }}</ion-select-option>
                    </ion-select>
                </ion-item>

                <ion-item-choose-dialog :disabled="isLoading" @click="openUserSelector" placeholder="Selecciona los usuarios" label="Administradores del Almacén:" :value="usersUI.map((item) => item).join(', ')"/>
            </ion-list>

            <datalist id="inventory-warehouses-zones-datatlist">
                <option v-for="zone in autocompletionUI.zones" :key="zone" :value="zone">{{ zone }}</option>
            </datalist>

            <section class="ion-padding">
                <ion-button expand="block" color="danger" shape="round" size="default" style="height: 50px" @click="deleteWarehouse" :disabled="isLoading">
                    <ion-icon :icon="trashOutline" slot="end"></ion-icon>
                    Borrar almacén
                </ion-button>
            </section>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IWarehouse } from '@/interfaces/InventoryInterfaces';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonList, IonPage, IonProgressBar, IonSelect, IonSelectOption, IonTitle, IonToolbar, alertController, toastController } from '@ionic/vue';
import { arrowForwardCircleOutline, storefrontOutline, trashOutline } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { Dialog, DialogEventEmitter } from "../../utils/Dialog/Dialog";
import Warehouse from '@/views/inventory/warehouses/Warehouse.vue';
import { IUser } from '@/interfaces/UserInterfaces';
import UsersSelector from '@/dialogs/UsersSelector/UsersSelector.vue';
import IonItemChooseDialog from '@/components/IonItemChooseDialog/IonItemChooseDialog.vue';
import { InventoryStore } from '@/utils/Stored/InventoryStore';
import { UsersStore } from '@/utils/Stored/UsersStore';
import _ from 'lodash';
import { IExpense, IJob } from '@/interfaces/JobsAndExpensesInterfaces';
import { JobsAndExpenses } from '@/utils/Stored/JobsAndExpenses';
import { nextTick } from 'process';

const zoneInput = ref<any | null>(null);

const listWarehouses = ref<Array<IWarehouse>>([]);

const autocompletionUI = computed(() => {
    return {
        zones: listWarehouses.value.map((worker) => worker.zone).filter((value, index, self) => self.indexOf(value) === index)
    }
});


const isLoading = ref<boolean>(false);
const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
    warehouse: {
        type: Object as () => IWarehouse,
        required: true
    }
});
const dynamicData = ref<{
    name: string,
    zone: string,
    country: string,
    owners: Array<number>
}>({
    name: props.warehouse.name,
    zone: props.warehouse.zone,
    country: props.warehouse.country,
    owners: props.warehouse.owners
});

const usersData = ref<Array<IUser>>([]);


const usersUI = computed(() => {
    return dynamicData.value.owners.map((userId) => {
        const userData = usersData.value.find((user) => user.id == userId);
        if (userData){
            return userData.name;
        }else{
            return userId;
        }
    });
});


const saveWarehouse = async () => {
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
        name: dynamicData.value.name,
        zone: dynamicData.value.zone,
        country: dynamicData.value.country,
        owners: dynamicData.value.owners
    }

    RequestAPI.put('/inventory/warehouses/' + props.warehouse.id , dataParsed).then(async (response) => {
        await InventoryStore.refreshWarehouses();
        props.emitter.fire('updated', {});
        props.emitter.fire('close');
        toastController.create({
            message: '✅ Almacén guardado exitosamente',
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
const deleteWarehouse = async () => {
    alertController.create({
        header: '¿Estás seguro?',
        message: 'Todos los productos del stock, entradas, salidas y pedidos serán borrados. Esta acción no se puede deshacer. ¿Estás seguro de que deseas borrar este almacén?',
        buttons: [
            {
                text: 'Cancelar',
                role: 'cancel'
            },
            {
                text: 'Sí, borrar',
                role: 'destructive',
                handler: async () => {
                    isLoading.value = true;
                    RequestAPI.delete('/inventory/warehouses/' + props.warehouse.id).then(async (response) => {
                        await InventoryStore.refreshWarehouses();
                        props.emitter.fire('deleted', {});
                        props.emitter.fire('close');
                        toastController.create({
                            message: '✅ Almacén borrado exitosamente',
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
        ]
    }).then(async (alert) => {
        await alert.present();
    });
}
const validateCamps = () => {
    let errors:Array<string> = [];

    if (dynamicData.value.name.trim().length == 0){
        errors.push("Por favor, ingresa el nombre del almacén");
    }
    
    if (dynamicData.value.zone.trim().length == 0){
        errors.push("Por favor, ingresa la zona");
    }


    if (dynamicData.value.country.trim().length == 0){
        errors.push("Por favor, ingresa el país del almacén");
    }


    return {
        isValid: errors.length == 0,
        errors: errors
    }
}
const openUserSelector  = () => {
    Dialog.show(UsersSelector, {
        props: {
            selectedUsersIds: dynamicData.value.owners,
            allowMultipleChoice: true
        },
        onLoaded($this) {
            $this.on('selected', (event:any) => {
                const users = event.data;
                dynamicData.value.owners = users.map((user: any) => user.id);
            })
            
            $this.on('close', () => {
            })
        },
    })
}

const jobsAndExpenses = ref<{jobs: Array<IJob>, expenses: Array<IExpense>}>({
    jobs: [],
    expenses: []
});

const loadJobsAndExpenses = async () => {
    const jobs =  await JobsAndExpenses.getJobs() as unknown as Array<IJob>;
    jobsAndExpenses.value.jobs = jobs.filter((job) => {
        return job.state == "Active"
    });

    const expenses = await JobsAndExpenses.getExpenses() as unknown as Array<IExpense>;
    jobsAndExpenses.value.expenses = expenses;

    nextTick(() => {
        dynamicData.value.zone = jobsAndExpenses.value.jobs[0].zone;
    });
}

const loadUsers = async () => {
    usersData.value = await UsersStore.getUsers();
}

onMounted(() => {
    setTimeout(() => {
        zoneInput.value.$el.nativeInput.setAttribute('list', 'inventory-warehouses-zones-datatlist');
    }, 500);
    loadUsers();
    loadJobsAndExpenses();
})
</script>

<style scoped lang="scss">
</style>