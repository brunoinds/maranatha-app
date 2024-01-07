<template>
    <article>
        <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>

        <ion-list v-if="!isLoading">
            <ion-item v-for="account in accountsData" :key="account.id" button @click="updateUser(account)">
                <ion-label>
                    <h2><b>{{ account.name  }}</b></h2>
                    <h3>@{{  account.username }}</h3>
                    <p>{{ account.email }}</p>
                </ion-label>
            </ion-item>
        </ion-list>
    </article>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonImg, IonAvatar,IonBackButton, IonProgressBar, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController } from '@ionic/vue';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { computed, ref } from 'vue';
import { Dialog } from '@/utils/Dialog/Dialog';
import EditUser from '@/dialogs/EditUser/EditUser.vue';

import { addOutline, albumsOutline, alertCircleOutline, checkmarkCircleOutline, close, logIn } from 'ionicons/icons';
import { IReport } from '@/interfaces/ReportInterfaces';
import { useRouter } from 'vue-router';
const accountsData = ref<any>(null);
const isLoading = ref<boolean>(true);
const router = useRouter();
const page = ref<HTMLElement|null>(null);

const loadAccounts = async () => {
    isLoading.value = true;
    accountsData.value = (await RequestAPI.get('/users')).filter((account:any) => account.username != 'admin');
    isLoading.value = false;
}

const updateUser = (account) => {
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
