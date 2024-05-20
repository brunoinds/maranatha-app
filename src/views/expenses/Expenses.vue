<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-back-button default-href="/"></ion-back-button>
                </ion-buttons>
                <ion-title>Expenses</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="addExpense">
                        <ion-icon :icon="addOutline"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
            <ion-toolbar>
                <ion-searchbar v-model="dynamicData.search" :animated="true" placeholder="Buscar Expense"></ion-searchbar>
                <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-list v-if="!isLoading">
                <ion-item v-for="expense in expensesUI" :key="expense.id" @click="clickExpense(expense)" button>
                    <ion-label>
                        <h2><b>{{expense.code}}</b> - {{ expense.name }}</h2>
                        <p>{{ expense.uses }}</p>
                    </ion-label>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonSearchbar, IonIcon, IonItem, IonLabel, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar, actionSheetController, alertController, toastController } from '@ionic/vue';
import { computed, ref } from 'vue';
import { RequestAPI } from '../../utils/Requests/RequestAPI';
import { addOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { Dialog } from '@/utils/Dialog/Dialog';
import CreateExpense from '@/dialogs/CreateExpense/CreateExpense.vue';
import EditExpense from '@/dialogs/EditExpense/EditExpense.vue';
import { JobsAndExpenses } from '@/utils/Stored/JobsAndExpenses';

const expensesData = ref<Array<{
    id: number;
    name: string;
    code: string;
    uses: Array<string>;
}>>([]);


const expensesUI = computed(() => {
    return expensesData.value.map((expense) => {
        return {
            ...expense,
            uses: expense.uses.join(', ')
        }
    }).filter((expense) => {
        let searchContent = dynamicData.value.search.toLowerCase().trim();
        if (searchContent.length == 0){
            return expense;
        }
        return expense.name.toLowerCase().includes(searchContent) || expense.code.toLowerCase().includes(searchContent);
    });
})
const isLoading = ref<boolean>(true);
const router = useRouter();
const page = ref<HTMLElement|null>(null);

const dynamicData = ref<{
    search: string;
}>({
    search: ''
});

const loadExpenses = async () => {
    isLoading.value = true;
    expensesData.value = await RequestAPI.get('/expenses');
    isLoading.value = false;
    JobsAndExpenses.refresh();
}

const addExpense = async (prefiled:any = null) => {
    Dialog.show(CreateExpense, {
        onLoaded($this) {
            $this.on('created', (event:any) => {
                loadExpenses();
            })
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        }
    })
}
const deleteExpense = async (job:any) => {
    try {
        await RequestAPI.delete(`/expenses/${job.id}`);
        loadExpenses();
        toastController.create({
            message: '✅ Expense eliminado con éxito',
            duration: 2000
        }).then((toast) => {
            toast.present();
        })
    } catch (error) {
        alertController.create({
            header: 'Oops...',
            message: error.response.message,
            buttons: ['OK']
        }).then((alert) => {
            alert.present();
        })
    }
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
    Dialog.show(EditExpense, {
        onLoaded($this) {
            $this.on('created', (event:any) => {
                loadExpenses();
            })
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        },
        props: {
            expenseCode: expense.code,
            expenseId: expense.id
        }
    })
}

loadExpenses();
</script>
