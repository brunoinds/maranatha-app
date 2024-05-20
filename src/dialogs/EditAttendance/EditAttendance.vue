<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Datos de la Asistencia</ion-title>
                <ion-buttons slot="end">    
                    <ion-button @click="saveAttendance">Guardar</ion-button>
                </ion-buttons>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <ion-list-header>Datos de la Asistencia:</ion-list-header>
            <ion-list :inset="true">
                <ion-item button @click="openJobSelector">
                    <ion-input :readonly="true" label="Job:" label-placement="stacked" placeholder="Selecciona el Job" v-model="dynamicData.jobCode"></ion-input>
                </ion-item>

                <ion-item button @click="openExpenseSelector">
                    <ion-input :readonly="true" label="Expense:" label-placement="stacked" placeholder="Selecciona el Expense" v-model="dynamicData.expenseCode"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-label position="stacked">Descripción</ion-label>
                    <ion-input v-model="dynamicData.description" placeholder="Detalles adicionales" :disabled="isLoading"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-label position="stacked">Fecha de Início</ion-label>
                    <IonDatetimeItem design="text" presentation="date" v-model="dynamicData.startDate" :disabled="isLoading" :value="dynamicData.startDate"></IonDatetimeItem>
                </ion-item>
                <ion-item>
                    <ion-label position="stacked">Fecha de Término</ion-label>
                    <IonDatetimeItem design="text" presentation="date" v-model="dynamicData.endDate" :disabled="isLoading" :value="dynamicData.endDate"></IonDatetimeItem>
                </ion-item>
            </ion-list>


            <ion-list-header>Trabajadores Involuncrados:</ion-list-header>
            <ion-list :inset="true">
                <ion-item-group v-for="team in workersTeamsList" :key="team.team">
                    <ion-item-divider>
                        <ion-label>EQUIPO {{ team.team }}</ion-label>
                    </ion-item-divider>
                    <ion-item v-for="worker in team.workers" :key="worker.dni">
                        <ion-checkbox justify="space-between" v-model="worker.isSelected">{{worker.name}}</ion-checkbox>
                    </ion-item>
                </ion-item-group>

                <!--Generate 20 skeletons:-->
                <ion-skeleton-text v-for="i in 20" :key="i" animated style="height: 40px" v-if="workersTeamsList.length == 0"></ion-skeleton-text>
            </ion-list>


            <article v-if="isAdmin">
                <ion-list-header>Propiedad de la Asistencia:</ion-list-header>

                <ion-list :inset="true">
                    <ion-item button @click="transferOwnership">
                        <ion-icon color="primary" slot="start" :icon="returnUpForwardOutline"></ion-icon>
                        <ion-label color="primary">Transferir propiedad</ion-label>
                    </ion-item>
                </ion-list>
            </article>


            <article class="ion-padding">
                <ion-button :disable="isLoading" color="danger" expand="block" @click="deleteAttendance">
                    <ion-icon shape="round" size="default" :icon="trashBinOutline" slot="start"></ion-icon>
                    Borrar Asistencia
                </ion-button>
            </article>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonImg, IonSkeletonText, IonItemGroup, IonCheckbox, IonItemDivider, IonToolbar, IonTitle, IonButtons, IonThumbnail, IonContent,  IonListHeader, IonIcon, IonInput, IonSelect, IonSelectOption, IonModal, IonDatetime, IonDatetimeButton, IonButton, IonList, IonItem, IonLabel, IonProgressBar, toastController, alertController, actionSheetController } from '@ionic/vue';
import { computed, defineComponent, nextTick, onMounted, reactive, ref } from 'vue';
import { briefcaseOutline, trashBinOutline, returnUpForwardOutline, camera, cameraOutline,  qrCodeOutline, ticketOutline, checkmarkCircleOutline, arrowForwardCircleOutline, cash } from 'ionicons/icons';
import { Dialog, DialogEventEmitter } from "../../utils/Dialog/Dialog";
import { vMaska } from "maska";
import { EMoneyType, EReportStatus, EReportType, IReport } from '@/interfaces/ReportInterfaces';
import { DateTime } from 'luxon';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { Session } from '@/utils/Session/Session';
import { IReportResponse, StoredReports } from '@/utils/Stored/StoredReports';
import { JobsAndExpenses } from '@/utils/Stored/JobsAndExpenses';
import { IJob, IExpense, EExpenseUses } from '../../interfaces/JobsAndExpensesInterfaces';
import { IAttendance } from '../../interfaces/AttendanceInterfaces';
import IonDatetimeItem from '@/components/IonDatetimeItem/IonDatetimeItem.vue';
import JobSelector from '@/dialogs/JobSelector/JobSelector.vue';
import ExpenseSelector from '@/dialogs/ExpenseSelector/ExpenseSelector.vue';

const isLoading = ref<boolean>(false);
const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    },
    attendance: {
        type: Object as () => IAttendance,
        required: true
    },
    workersDNIs: {
        type: Array as () => Array<string>,
        required: true
    }
});
const dynamicData = ref<{
    jobCode: number|null,
    expenseCode: number|null,
    description: string,
    startDate: string,
    endDate: string,
}>({
    description: props.attendance.description as string,
    jobCode: props.attendance.job_code as unknown as number,
    expenseCode: props.attendance.expense_code as unknown as number,
    startDate: props.attendance.from_date,
    endDate: props.attendance.to_date
});

const jobsAndExpenses = ref<{jobs: Array<IJob>, expenses: Array<IExpense>}>({
    jobs: [],
    expenses: []
});

const workersTeamsList = ref<Array<{team: string, workers: [{dni: string, name: string, isSelected: boolean}]}>>([]);
const selectedWorkers = computed<Array<{dni: string, name: string, isSelected: boolean}>>(() => {
    let workersSelected:Array<{dni: string, name: string, isSelected: boolean}> = [];

    workersTeamsList.value.forEach((team) => {
        team.workers.forEach((worker) => {
            if (worker.isSelected){
                workersSelected.push(worker);
            }
        });
    });
    return workersSelected;
});

const saveAttendance = async () => {
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
    RequestAPI.put('/attendances/' + props.attendance.id, {
        description: dynamicData.value.description,
        job_code: dynamicData.value.jobCode,
        expense_code: dynamicData.value.expenseCode,
        from_date: dynamicData.value.startDate,
        to_date: dynamicData.value.endDate,
        workers_dnis: selectedWorkers.value.map((worker) => {
            return worker.dni;
        })
    }).then((response) => {
        props.emitter.fire('updated', {
            ...response.attendance
        });
        toastController.create({
            message: '✅ Asistencia actualizada con éxito!',
            duration: 2000
        }).then((toast) => {
            toast.present();
        })
        props.emitter.fire('close');
    }).catch((error) => {
        alertController.create({
            header: 'Oops...',
            message: error.response.message,
            buttons: ['OK']
        }).then((alert) => {
            alert.present();
        });
    }).finally(() => {
        isLoading.value = false;
    });
}

const transferOwnership = async () => {
    const users = (await RequestAPI.get('/users'));

    const doTransfer = (user: any) => {
        alertController.create({
            header: `¿Transferir propiedad de la asistencia?`,
            message: `¿Estás seguro que deseas transferir la propiedad de la asistencia a ${user.name}?`,
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel'
                },
                {
                    text: 'Transferir',
                    role: 'destructive',
                    handler: () => {
                        RequestAPI.put('/attendances/' + props.attendance.id + '/transfer-ownership', {
                            user_id: user.id
                        }).then((response) => {
                            toastController.create({
                                message: '✅ Propiedad transferida con éxito!',
                                duration: 2000
                            }).then((toast) => {
                                toast.present();
                            })
                            props.emitter.fire('close');
                        }).catch((error) => {
                            alertController.create({
                                header: 'Oops...',
                                message: error.response.message,
                                buttons: ['OK']
                            }).then((alert) => {
                                alert.present();
                            });
                        });
                    }
                }
            ]
        }).then((alert) => {
            alert.present();
        });
    }

    const items = users.map((user) => {
        return {
            text: user.name + ' (@' + user.username + ')',
            handler: () => {
                doTransfer(user);
            }
        }
    });

    actionSheetController.create({
        header: 'Transferir propiedad de la asistencia a:',
        buttons: [
            ...items,
            {
                text: 'Cancelar',
                role: 'cancel'
            }
        ]
    }).then((actionSheet) => {
        actionSheet.present();
    })
}

const validateCamps = () => {
    let errors = [];
    const startDate = DateTime.fromISO(dynamicData.value.startDate);
    const endDate = DateTime.fromISO(dynamicData.value.endDate);

    if (startDate > endDate){
        errors.push("La fecha de inicio no puede ser mayor a la fecha de término");
    }

    if (dynamicData.value.jobCode == null){
        errors.push("Debes seleccionar un Job");
    }
    if (dynamicData.value.expenseCode == null){
        errors.push("Debes seleccionar un Expense");
    }

    if (selectedWorkers.value.length == 0){
        errors.push("Debes seleccionar al menos un trabajador");
    }

    return {
        isValid: errors.length == 0,
        errors: errors
    }
}

const openJobSelector = () => {
    Dialog.show(JobSelector, {
        props: {
            includeDisabledJobs: false,
            selectedJobCode: dynamicData.value.jobCode,
            jobsFilterCallback(job: IJob){
                return !job.code.startsWith('000');
            }
        },
        onLoaded($this) {
            $this.on('selected', (event:any) => {
                const job = event.data;
                dynamicData.value.jobCode = job.code;
            })
        },
    })
}


const openExpenseSelector = () => {
    Dialog.show(ExpenseSelector, {
        props: {
            selectedExpenseCode: dynamicData.value.expenseCode,
            expensesFilterCallback(expense: IExpense){
                return expense.uses.includes(EExpenseUses.Attendances);
            },
        },
        onLoaded($this) {
            $this.on('selected', (event:any) => {
                const expense = event.data;
                dynamicData.value.expenseCode = expense.code;
            })
        },
    })
}

const loadJobsAndExpenses = async () => {
    const jobs =  await JobsAndExpenses.getJobs() as unknown as Array<IJob>;
    jobsAndExpenses.value.jobs = jobs

    const expenses = await JobsAndExpenses.getExpenses() as unknown as Array<IExpense>;
    jobsAndExpenses.value.expenses = expenses;
}

const deleteAttendance = async () => {
    isLoading.value = true;
    RequestAPI.delete('/attendances/' + props.attendance.id).then((response) => {
        props.emitter.fire('deleted', {
            ...response.attendance
        });
        toastController.create({
            message: '✅ Asistencia eliminada con éxito!',
            duration: 2000
        }).then((toast) => {
            toast.present();
        })
        props.emitter.fire('close');
    }).catch((error) => {
        alertController.create({
            header: 'Oops...',
            message: error.response.message,
            buttons: ['OK']
        }).then((alert) => {
            alert.present();
        });
    }).finally(() => {
        isLoading.value = false;
    });
}
const loadWorkersTeamsList = async () => {
    const workersTeamsListFetched = await RequestAPI.get('/workers-list');
    const workersTeamsListGrouped = workersTeamsListFetched.filter((worker) => {
        return worker.is_active
    }).reduce((acc, worker) => {
        const team = worker.team;
        const workerData = {
            dni: worker.dni,
            name: worker.name,
            isSelected: props.workersDNIs.includes(worker.dni)
        }

        if (acc[team] == undefined){
            acc[team] = {
                team: team,
                workers: []
            }
        }

        acc[team].workers.push(workerData);

        return acc;
    }, {});

    const workersTeamsListArray = Object.keys(workersTeamsListGrouped).map((key) => {
        return workersTeamsListGrouped[key];
    });
    
    workersTeamsList.value = workersTeamsListArray;
}
const isAdmin = ref(false);

const isAdminCheck = async () => {
    const currentSession = await Session.getCurrentSession();
    if (!currentSession){
        return;
    };

    isAdmin.value = currentSession.roles().includes("admin");
}

loadJobsAndExpenses();
loadWorkersTeamsList();
isAdminCheck();

</script>

<style scoped lang="scss">
</style>