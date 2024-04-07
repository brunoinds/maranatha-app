<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-buttons>
                    <ion-back-button defaultHref="/account"></ion-back-button>
                </ion-buttons>
                <ion-title>Cuentas</ion-title>
                <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-list v-if="!isLoading">
                <ion-item v-for="account in accountsData" :key="account.id" button @click="updateUser(account)">
                    <ion-label>
                        <h2><b>{{ account.name  }}</b></h2>
                        <h3>@{{  account.username }}</h3>
                        <p>{{ account.email }}</p>
                    </ion-label>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import EditUser from '@/dialogs/EditUser/EditUser.vue';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar } from '@ionic/vue';
import { ref } from 'vue';
import { Dialog } from '../../utils/Dialog/Dialog';
import { RequestAPI } from '../../utils/Requests/RequestAPI';

const accountsData = ref<any>(null);
const isLoading = ref<boolean>(true);
const page = ref<HTMLElement|null>(null);

const loadAccounts = async () => {
    isLoading.value = true;
    accountsData.value = (await RequestAPI.get('/users')).filter((account:any) => account.username != 'admin');
    isLoading.value = false;
}

const updateUser = (account:any) => {
    Dialog.show(EditUser, {
        onLoaded($this) {
            $this.on('updated', (event:any) => {
                loadAccounts()
            })
            $this.on('deleted', (event:any) => {
                loadAccounts()
            })
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        },
        props: {
            account
        }
    })
}

loadAccounts()
</script>
