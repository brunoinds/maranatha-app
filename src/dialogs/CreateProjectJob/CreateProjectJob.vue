<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Crear Proyecto</ion-title>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <ion-list>
                <ion-item-choose-dialog @click="openJobSelector" placeholder="Selecciona el Job" label="Job:" :value="form.job_code"/>
                <ion-item-choose-dialog @click="openStructureSelector" placeholder="Selecciona el Tipo de Estructura" label="Tipo de Estructura:" :value="viewUI.structure"/>
                <ion-item>
                    <ion-input label="Largo" type="number" label-placement="stacked" inputmode="numeric" :min="1" v-model="form.length"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input label="Ancho" type="number" label-placement="stacked" inputmode="numeric" :min="1" v-model="form.width"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input label="Area" type="number" label-placement="stacked" inputmode="numeric" :min="1" v-model="form.area"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-select label="Tipo de Evento"  label-placement="stacked" v-model="form.event_type" :disabled="isLoading">
                        <ion-select-option v-for="type in eventTypesOptionsUI" :value="type.value">{{type.label}}</ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item-choose-dialog @click="openSupervisorSelector" placeholder="Selecciona el supervisor" label="Supervisor:" :value="viewUI.supervisor"/>
                <ion-item-choose-dialog @click="openAdministratorsSelector" placeholder="Selecciona los administradores" label="Administradores:" :value="viewUI.administrators"/>
                <ion-item>
                    <ion-label position="stacked">Fecha programada de início</ion-label>
                    <IonDatetimeItem design="text" presentation="date" v-model="form.scheduled_start_date" :disabled="isLoading" :value="form.scheduled_start_date"></IonDatetimeItem>
                </ion-item>
                <ion-item>
                    <ion-label position="stacked">Fecha programada de término</ion-label>
                    <IonDatetimeItem design="text" presentation="date" v-model="form.scheduled_end_date" :disabled="isLoading" :value="form.scheduled_end_date"></IonDatetimeItem>
                </ion-item>
            </ion-list>
            <section class="ion-padding">
                <ion-button expand="block" shape="round" size="default" style="height: 50px" @click="createJob" :disabled="isLoading">
                    <ion-icon :icon="arrowForwardCircleOutline" slot="end"></ion-icon>
                    Crear Proyecto
                </ion-button>
            </section>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import IonDatetimeItem from '@/components/IonDatetimeItem/IonDatetimeItem.vue';
import IonItemChooseDialog from '@/components/IonItemChooseDialog/IonItemChooseDialog.vue';
import JobSelector from '@/dialogs/JobSelector/JobSelector.vue';
import ProjectsStructureSelector from '@/dialogs/ProjectsStructureSelector/ProjectsStructureSelector.vue';
import UsersSelector from '@/dialogs/UsersSelector/UsersSelector.vue';
import { EProjectEventType, EProjectJobStatus, INewProjectJob, IProjectStructure, ProjectEnumsDescriptor } from '@/interfaces/ProjectsInterfaces';
import { IUser } from '@/interfaces/UserInterfaces';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { Session } from '@/utils/Session/Session';
import { ProjectsStore } from '@/utils/Stored/ProjecsStore';
import { UsersStore } from '@/utils/Stored/UsersStore';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonProgressBar, IonSelect, IonSelectOption, IonTitle, IonToolbar, alertController, toastController } from '@ionic/vue';
import { arrowForwardCircleOutline } from 'ionicons/icons';
import { DateTime } from 'luxon';
import { computed, onMounted, ref } from 'vue';
import { Dialog, DialogEventEmitter } from "../../utils/Dialog/Dialog";



const isLoading = ref<boolean>(false);
const usersData = ref<IUser[]>([]);
const structuresData = ref<IProjectStructure[]>([]);

const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    }
});


const form = ref<INewProjectJob>({
    job_code: '',
    project_structure_id: null as any,
    width: '0',
    length: '0',
    area: '0',
    admins_ids: [Session.getCurrentSessionSync()?.id() as number],
    supervisor_id: null as any,
    event_type: EProjectEventType.NewConstruction,
    scheduled_start_date: DateTime.now().toISO() as string,
    scheduled_end_date: DateTime.now().plus({months: 2}).toISO() as string,
    started_at: null,
    ended_at: null,
    status: EProjectJobStatus.WaitingApproval
});
const viewUI = computed(() => {
    return {
        administrators: form.value.admins_ids.map((id) => {
            return usersData.value.find((user) => user.id === id)?.name || '';
        }).join(', '),
        supervisor: usersData.value.find((user) => user.id === form.value.supervisor_id)?.name || '',
        structure: structuresData.value.find((structure) => structure.id === form.value.project_structure_id)?.name || ''
    }
})
const eventTypesOptionsUI = computed(() => {
    return Object.entries(EProjectEventType).map(([key, value]) => {
        return {
            value: value,
            label: ProjectEnumsDescriptor.eventType(value)
        }
    });
})


const createJob = async () => {
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
        ...form.value,
        scheduled_start_date: DateTime.fromISO(form.value.scheduled_start_date).startOf('day').toISO(),
        scheduled_end_date: DateTime.fromISO(form.value.scheduled_end_date).endOf('day').toISO(),
        width: parseFloat(form.value.width),
        length: parseFloat(form.value.length),
        area: parseFloat(form.value.area),

    }

    RequestAPI.post('/projects/jobs', dataParsed).then((response) => {
        props.emitter.fire('created', response);
        props.emitter.fire('close');

        AppEvents.emit('projects:reload');

        toastController.create({
            message: '✅ Proyecto creado exitosamente',
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
const validateCamps = () => {
    let errors:Array<string> = [];

    if (form.value.job_code.trim().length == 0){
        errors.push("Por favor, ingresa el Job");
    }
    if (form.value.project_structure_id == null){
        errors.push("Por favor, selecciona el tipo de estructura");
    }
    if (form.value.supervisor_id == null){
        errors.push("Por favor, selecciona el supervisor");
    }
    if (form.value.admins_ids.length == 0){
        errors.push("Por favor, selecciona los administradores");
    }
    if (new Date(form.value.scheduled_start_date) > new Date(form.value.scheduled_end_date)){
        errors.push("Por favor, selecciona una fecha de término mayor a la fecha de inicio");
    }

    return {
        isValid: errors.length == 0,
        errors: errors
    }
}
const openJobSelector = () => {
    Dialog.show(JobSelector, {
        props: {
            includeDisabledJobs: false
        },
        onLoaded($this) {
            $this.on('selected', (event:any) => {
                const job = event.data;
                form.value.job_code = job.code;
            })
            
        },
    })
}
const openStructureSelector = () => {
    Dialog.show(ProjectsStructureSelector, {
        props: {
            
        },
        onLoaded($this) {
            $this.on('selected', (event:any) => {
                const item = event.data;
                form.value.project_structure_id = item.id;
            })
        },
    })
}
const openAdministratorsSelector  = () => {
    Dialog.show(UsersSelector, {
        props: {
            selectedUsersIds: form.value.admins_ids,
            allowMultipleChoice: true
        },
        onLoaded($this) {
            $this.on('selected', (event:any) => {
                const users = event.data;
                form.value.admins_ids = users.map((user: any) => user.id);
            })
            
            $this.on('close', () => {
            })
        },
    })
}
const openSupervisorSelector  = () => {
    Dialog.show(UsersSelector, {
        props: {
            selectedUserId: form.value.supervisor_id,
            allowMultipleChoice: false
        },
        onLoaded($this) {
            $this.on('selected', (event:any) => {
                const user = event.data;
                form.value.supervisor_id = user.id
            })
            $this.on('close', () => {
            })
        },
    })
}

onMounted(async () => {
    usersData.value = await UsersStore.getUsers();
    structuresData.value = await ProjectsStore.getStructures();
})
</script>

<style scoped lang="scss">
</style>