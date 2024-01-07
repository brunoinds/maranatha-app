<template>
    <article>
        <ion-list :inset="true">
            <ion-item @click="goToJobs" button>
                <ion-label color="primary">
                    <h2>Modificar Jobs</h2>
                </ion-label>
            </ion-item>
            <ion-item @click="goToExpenses" button>
                <ion-label color="primary">
                    <h2>Modificar Expenses</h2>
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


const goToJobs = () => {
    router.push('/jobs');
}
const goToAccounts = () => {
    router.push('/accounts');
}
const goToExpenses = () => {
    router.push('/expenses');
}

</script>
