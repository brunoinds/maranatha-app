<template>
    <article>
        <header v-show="false">
            <ion-searchbar v-if="!props.isLoading" :animated="true" placeholder="Buscar datos" v-model="search"></ion-searchbar>
        </header>
        <main>
            <v-data-table
                :theme="currentDeviceTheme"
                :headers="props.headers"
                :items="props.items"
                :search="search"
                :loading-text="'Cargando datos...'"
                :loading="props.isLoading"
            ></v-data-table>
        </main>
    </article>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonSearchbar, IonContent, IonButton, IonImg, IonAvatar,IonBackButton, IonProgressBar, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController } from '@ionic/vue';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { PropType, computed, ref } from 'vue';
import { Dialog } from '@/utils/Dialog/Dialog';
import EditUser from '@/dialogs/EditUser/EditUser.vue';

import { addOutline, albumsOutline, alertCircleOutline, checkmarkCircleOutline, close, logIn } from 'ionicons/icons';
import { IReport } from '@/interfaces/ReportInterfaces';
import { useRouter } from 'vue-router';
import FiltersArea from '@/views/management/records/components/FiltersArea.vue';
import { DateTime } from 'luxon';
import { Theme } from '@/utils/Theme/Theme';


const accountsData = ref<any>(null);
const isLoading = ref<boolean>(true);
const router = useRouter();
const page = ref<HTMLElement|null>(null);

const props = defineProps({
    headers: {
        type: Array as PropType<any[]>,
        required: true
    },
    items: {
        type: Array as PropType<any[]>,
        required: true
    },
    isLoading: {
        type: Boolean as PropType<boolean>,
        required: false,
        default: false
    }
})


const currentDeviceTheme = computed(() => {
    return Theme.getTheme();
});

const search = ref('');

</script>
