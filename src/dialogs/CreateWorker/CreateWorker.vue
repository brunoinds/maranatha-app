<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Nuevo Trabajador</ion-title>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <ion-list>
                <ion-item>
                    <ion-input label="Nombres y apellidos" placeholder="Ej.: Luis Vasquez Quispe" label-placement="stacked" v-model="dynamicData.name" :disabled="isLoading"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input label="DNI" placeholder="Ej.: 00000-X" label-placement="stacked" v-model="dynamicData.dni" :disabled="isLoading"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input ref="teamInput" label="Equipo" placeholder="Ej.: Equipo I" label-placement="stacked" v-model="dynamicData.team" :disabled="isLoading"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input ref="roleInput" label="Función" placeholder="Ej.: Albañil/Constructor" label-placement="stacked" v-model="dynamicData.role" :disabled="isLoading"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input ref="supervisorInput" label="Supervisor" placeholder="Ej.: Rómulo Chavez" label-placement="stacked" v-model="dynamicData.supervisor" :disabled="isLoading"></ion-input>
                </ion-item>

                <ion-item>
                    <ion-select label="País" label-placement="stacked" interface="action-sheet" v-model="dynamicData.country" :disabled="isLoading">
                        <ion-select-option value="PE">Perú 🇵🇪</ion-select-option>
                        <ion-select-option value="BR">Brasil 🇧🇷</ion-select-option>
                        <ion-select-option value="PY">Paraguay 🇵🇾</ion-select-option>
                        <ion-select-option value="US">EE. UU. 🇺🇸</ion-select-option>
                    </ion-select>
                </ion-item>
            </ion-list>

            <datalist id="workers-teams-datalist">
                <option v-for="team in autocompletionUI.teams" :key="team" :value="team">{{ team }}</option>
            </datalist>
            <datalist id="workers-roles-datalist">
                <option v-for="role in autocompletionUI.roles" :key="role" :value="role">{{ role }}</option>
            </datalist>
            <datalist id="workers-supervisors-datalist">
                <option v-for="supervisor in autocompletionUI.supervisors" :key="supervisor" :value="supervisor">{{ supervisor }}</option>
            </datalist>

            <section class="ion-padding">
                <ion-button expand="block" shape="round" size="default" style="height: 50px" @click="createWorker" :disabled="isLoading">
                    <ion-icon :icon="arrowForwardCircleOutline" slot="end"></ion-icon>
                    Crear Trabajador
                </ion-button>
            </section>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { IonButton, IonButtons, IonContent, IonHeader, IonInput,IonIcon, IonSelect, IonSelectOption, IonItem, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar, alertController, toastController } from '@ionic/vue';
import { computed, onMounted, ref } from 'vue';
import { DialogEventEmitter } from "../../utils/Dialog/Dialog";
import { arrowForwardCircleOutline } from 'ionicons/icons';
import { IWorker } from '@/interfaces/WorkerInterfaces';

const teamInput = ref<any | null>(null);
const roleInput = ref<any | null>(null);
const supervisorInput = ref<any | null>(null);

const listWorkers = ref<Array<IWorker>>([]);

const autocompletionUI = computed(() => {
    return {
        teams: listWorkers.value.map((worker) => worker.team).filter((value, index, self) => self.indexOf(value) === index),
        roles: listWorkers.value.map((worker) => worker.role).filter((value, index, self) => self.indexOf(value) === index),
        supervisors: listWorkers.value.map((worker) => worker.supervisor).filter((value, index, self) => self.indexOf(value) === index)
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
    dni: string,
    team: string,
    role: string,
    isActive: boolean,
    supervisor: string,
    country: string
}>({
    name: '',
    dni: '',
    team: '',
    role: '',
    isActive: true,
    supervisor: '',
    country: 'PE'
});


const createWorker = async () => {
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
        team: dynamicData.value.team,
        role: dynamicData.value.role,
        is_active: dynamicData.value.isActive,
        supervisor: dynamicData.value.supervisor,
        dni: dynamicData.value.dni,
        country: dynamicData.value.country
    }

    RequestAPI.post('/workers', dataParsed).then((response) => {
        props.emitter.fire('created', {});
        props.emitter.fire('close');

        toastController.create({
            message: '✅ Trabajador creado exitosamente',
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
const loadWorkers = async () => {
    listWorkers.value = await RequestAPI.get('/workers');
}

const validateCamps = () => {
    let errors:Array<string> = [];

    if (dynamicData.value.name.trim().length == 0){
        errors.push("Por favor, ingresa el nombre del trabajador");
    }
    
    if (dynamicData.value.team.trim().length == 0){
        errors.push("Por favor, ingresa el equipo del trabajador");
    }

    if (dynamicData.value.role.trim().length == 0){
        errors.push("Por favor, ingresa la función del trabajador");
    }

    if (dynamicData.value.supervisor.trim().length == 0){
        errors.push("Por favor, ingresa el supervisor del trabajador");
    }

    if (dynamicData.value.country.trim().length == 0){
        errors.push("Por favor, ingresa el país del trabajador");
    }

    if (dynamicData.value.dni.trim().length == 0){
        errors.push("Por favor, ingresa el DNI del trabajador");
    }


    return {
        isValid: errors.length == 0,
        errors: errors
    }
}

onMounted(() => {
    setTimeout(() => {
        teamInput.value.$el.nativeInput.setAttribute('list', 'workers-teams-datalist');
        roleInput.value.$el.nativeInput.setAttribute('list', 'workers-roles-datalist');
        supervisorInput.value.$el.nativeInput.setAttribute('list', 'workers-supervisors-datalist');
    }, 500);

    loadWorkers();
})
</script>

<style scoped lang="scss">
</style>