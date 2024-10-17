<template>
    <article>
        <header class="ion-padding">
            <ion-segment v-if="configurationsUI" :scrollable="true" :value="segmentValue" v-model="segmentValue">
                <ion-segment-button v-for="itemRecord in configurationsUI" :value="itemRecord.id" :key="itemRecord.id">
                    <ion-label>{{ itemRecord.title}}</ion-label>
                </ion-segment-button>
            </ion-segment>
        </header>

        <ion-progress-bar v-if="!configurationsUI" type="indeterminate"></ion-progress-bar>

        <main v-if="configurationsUI">
            <Record v-for="itemRecord in configurationsUI" :type="itemRecord.id" :key="itemRecord.title" :preFilling="preFilling" v-show="itemRecord.id == segmentValue"></Record>
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
import { onMounted } from 'vue';

const segmentValue = ref('jobs-by-costs');

const props = defineProps({
    location: {
        type: String,
        required: false,
        default: 'AdminManagement'
    },
    preFilling: {
        type: Object,
        required: false,
        default: () => ({})
    }
});

const configurationsData = ref<any>(null);

const configurationsUI = computed(() => {
    if (!configurationsData.value) return null;
    return configurationsData.value?.filter((item: any) => {
        if (props.location == 'AdminManagement') {
            return true;
        }else if (props.location == 'InventoryManagement') {
            const idsAvailable = ['inventory-by-products-kardex', 'inventory-by-products-balance', 'inventory-by-products-stock', 'inventory-by-products-loans-kardex', 'inventory-by-products'];
            return idsAvailable.includes(item.id);
        }else{
            return true;
        }
    });
})

onMounted(async () => {
    configurationsData.value = await RecordsConfigs.getConfigurations();

    if (props.location == 'AdminManagement') {
        segmentValue.value = 'jobs-by-costs';
    }else if (props.location == 'InventoryManagement') {
        segmentValue.value = 'inventory-by-products-kardex';
    }
})
</script>
