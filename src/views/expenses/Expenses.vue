<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/"></ion-back-button>
                </ion-buttons>
                <ion-title>Expenses</ion-title>
                <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
                <ion-buttons slot="end">
                    <ion-button @click="addExpense">
                        <ion-icon :icon="addOutline"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-list v-if="!isLoading">
                <ion-item v-for="expense in expensesData" :key="expense.id" @click="clickExpense(expense)" button>
                    <ion-label>
                        <h2><b>{{ expense.name }}</b></h2>
                        <p>{{expense.code}}</p>
                    </ion-label>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonImg, IonAvatar, IonButtons, IonBackButton, IonProgressBar, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController, actionSheetController, toastController } from '@ionic/vue';
import { RequestAPI } from '../../utils/Requests/RequestAPI';
import { computed, ref } from 'vue';

import { addOutline, albumsOutline, alertCircleOutline, checkmarkCircleOutline, close, logIn } from 'ionicons/icons';
import { useRouter } from 'vue-router';

const expensesData = ref<Array<{
    id: number;
    name: string;
    code: string
}>>([]);
const isLoading = ref<boolean>(true);
const router = useRouter();
const page = ref<HTMLElement|null>(null);

const loadExpenses = async () => {
    isLoading.value = true;
    expensesData.value = await RequestAPI.get('/expenses');
    isLoading.value = false;
}

const addExpense = async (prefiled:any = null) => {
    const alert = await alertController.create({
        header: 'Nuevo Expense',
        inputs: [
        {
                type: 'text',
                placeholder: 'Name',
                value: prefiled ? prefiled.name : null
            },
            {
                type: 'text',
                placeholder: 'Code',
                value: prefiled ? prefiled.code : null
            }
        ],
        buttons: [
            {
                text: 'Cancelar',
                role: 'cancel',
                handler: () => {
                    
                },
            },
            {
                text: 'Crear Expense',
                role: 'confirm'
            }
        ]
    });

    await alert.present();
    const { role, data } = await alert.onDidDismiss();

    if (role == "confirm"){
        const dataParsed = {
            name: data.values[0],
            code: data.values[1]
        }

        RequestAPI.post('/expenses', dataParsed).then((response) => {
            alertController.create({
                header: '¡Éxito!',
                message: 'Expense creado exitosamente',
                buttons: ['OK']
            }).then(async (alert) => {
                await alert.present();
                await alert.onDidDismiss();
                loadExpenses();
            });
        }).catch((error) => {
            alertController.create({
                header: 'Oops...',
                message: error.response.message,
                buttons: ['OK']
            }).then(async (alert) => {
                await alert.present();
                await alert.onDidDismiss();
                addExpense(dataParsed);
            });
        });
    }
}
const deleteExpense = async (job:any) => {
    await RequestAPI.delete(`/expenses/${job.id}`);
    loadExpenses();
    toastController.create({
        message: 'Expense eliminado con éxito',
        duration: 2000
    }).then((toast) => {
        toast.present();
    })
}


const clickExpense = async(expense:any) => {
    await actionSheetController.create({
        header: 'Opciones',
        buttons: [
            {
                text: 'Editar',
                handler: () => {
                    editExpense(expense)
                }
            },
            {
                text: 'Eliminar',
                role: 'destructive',
                handler: () => {
                    deleteExpense(expense)
                }
            },
            {
                text: 'Cancelar',
                role: 'cancel',
                handler: () => {
                    
                }
            }
        ]
    }).then((actionSheet) => {
        actionSheet.present();
    })
}


const editExpense = async (expense:any) => {
    const alert = await alertController.create({
        header: 'Editar Expense',
        inputs: [
        {
                type: 'text',
                placeholder: 'Name',
                value: expense.name
            },
            {
                type: 'text',
                placeholder: 'Code',
                value: expense.code
            }
        ],
        buttons: [
            {
                text: 'Cancelar',
                role: 'cancel',
                handler: () => {
                    
                },
            },
            {
                text: 'Guardar expense',
                role: 'confirm'
            }
        ]
    });

    await alert.present();
    const { role, data } = await alert.onDidDismiss();

    if (role == "confirm"){
        const dataParsed = {
            id: expense.id,
            name: data.values[0],
            code: data.values[1]
        }


        RequestAPI.patch('/expenses/' + expense.id, dataParsed).then((response) => {
            alertController.create({
                header: '¡Éxito!',
                message: 'Expense guardado exitosamente',
                buttons: ['OK']
            }).then(async (alert) => {
                await alert.present();
                await alert.onDidDismiss();
                loadExpenses();
            });
        }).catch((error) => {
            alertController.create({
                header: 'Oops...',
                message: error.response.message,
                buttons: ['OK']
            }).then(async (alert) => {
                await alert.present();
                await alert.onDidDismiss();
                editExpense(expense);
            });
        });
    }
}

loadExpenses();
</script>
