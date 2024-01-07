<template>
    <article>
        <header class="ion-padding">
            <ion-segment :scrollable="true" :value="segmentValue" v-model="segmentValue">
                <ion-segment-button v-for="itemRecord in RecordsConfigs" :value="itemRecord.id" :key="itemRecord.id">
                    <ion-label>{{ itemRecord.title}}</ion-label>
                </ion-segment-button>
            </ion-segment>
        </header>

        <main>
            <Record v-for="itemRecord in RecordsConfigs" :type="itemRecord.id" :key="itemRecord.title" v-show="itemRecord.id == segmentValue"></Record>
        </main>
    </article>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonSelect, IonSegment, IonSegmentButton, IonSelectOption, IonContent, IonImg, IonAvatar,IonBackButton, IonProgressBar, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController } from '@ionic/vue';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { computed, ref } from 'vue';
import { Dialog } from '@/utils/Dialog/Dialog';
import EditUser from '@/dialogs/EditUser/EditUser.vue';

import { addOutline, albumsOutline, alertCircleOutline, checkmarkCircleOutline, close, logIn } from 'ionicons/icons';
import { IReport } from '@/interfaces/ReportInterfaces';
import Record from '@/views/management/records/Record.vue';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
const accountsData = ref<any>(null);
const isLoading = ref<boolean>(true);
const router = useRouter();
const page = ref<HTMLElement|null>(null);
const route = useRoute();
import RecordsConfigs from '@/views/management/records/RecordsConfigs';

const segmentValue = ref('jobs-by-costs');

</script>
