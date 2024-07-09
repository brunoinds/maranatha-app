<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Nuevo Almacén</ion-title>
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
                    <ion-input ref="zoneInput" label="Zona" placeholder="Ej.: Zona I" label-placement="stacked" v-model="dynamicData.zone" :disabled="isLoading"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-select label="País" label-placement="stacked" interface="action-sheet" v-model="dynamicData.country" :disabled="isLoading">
                        <ion-select-option value="PE">Perú 🇵🇪</ion-select-option>
                        <ion-select-option value="BR">Brasil 🇧🇷</ion-select-option>
                        <ion-select-option value="PY">Paraguay 🇵🇾</ion-select-option>
                        <ion-select-option value="US">EE. UU. 🇺🇸</ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item-choose-dialog @click="openUserSelector" placeholder="Selecciona los usuarios" label="Administradores del Almacén:" :value="ownersSelectedData.map((item) => item.name).join(', ')"/>
            </ion-list>

            <datalist id="inventory-warehouses-zones-datatlist">
                <option v-for="zone in autocompletionUI.zones" :key="zone" :value="zone">{{ zone }}</option>
            </datalist>

            <section class="ion-padding">
                <ion-button expand="block" shape="round" size="default" style="height: 50px" @click="createWarehouse" :disabled="isLoading">
                    <ion-icon :icon="arrowForwardCircleOutline" slot="end"></ion-icon>
                    Crear Almacén
                </ion-button>
            </section>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { IonButton, IonButtons, IonContent, IonHeader, IonInput,IonIcon, IonSelect, IonSelectOption, IonItem, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar, alertController, toastController } from '@ionic/vue';
import { computed, onMounted, ref } from 'vue';
import { Dialog, DialogEventEmitter } from "../../utils/Dialog/Dialog";
import { arrowForwardCircleOutline, cubeOutline, storefrontOutline } from 'ionicons/icons';
import { IWorker } from '@/interfaces/WorkerInterfaces';
import { IWarehouse } from '@/interfaces/InventoryInterfaces';
import UsersSelector from '@/dialogs/UsersSelector/UsersSelector.vue';
import { IUser } from '@/interfaces/UserInterfaces';
import IonItemChooseDialog from '@/components/IonItemChooseDialog/IonItemChooseDialog.vue';
import { InventoryStore } from '@/utils/Stored/InventoryStore';

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
    }
});
const dynamicData = ref<{
    name: string,
    zone: string,
    country: string,
    owners: Array<number>
}>({
    name: '',
    zone: '',
    country: 'PE',
    owners: []
});


const ownersSelectedData = ref<Array<IUser>>([]);


const createWarehouse = async () => {
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

    RequestAPI.post('/inventory/warehouses', dataParsed).then(async (response) => {
        await InventoryStore.refreshWarehouses();
        props.emitter.fire('created', {});
        props.emitter.fire('close');

        toastController.create({
            message: '✅ Almacén creado exitosamente',
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
const loadWarehouses = async () => {
    listWarehouses.value = await InventoryStore.getWarehouses();
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
                ownersSelectedData.value = users;
            })
            
            $this.on('close', () => {
            })
        },
    })
}

onMounted(() => {
    setTimeout(() => {
        zoneInput.value.$el.nativeInput.setAttribute('list', 'inventory-warehouses-zones-datatlist');
    }, 500);

    loadWarehouses();
})
</script>

<style scoped lang="scss">
</style>