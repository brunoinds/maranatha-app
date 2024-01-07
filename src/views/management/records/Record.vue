<template>
    <article>
        <header class="content">
            <ion-accordion-group value="first">
                <ion-accordion value="first">
                    <ion-item slot="header">
                        <ion-label><b>Filtros</b></ion-label>
                    </ion-item>
                    <div slot="content">
                        <filters-area :filters="currentRecord.filters" v-model="currentRecord.filters"></filters-area>
                    </div>
                </ion-accordion>
            </ion-accordion-group>
            
            <div class="ion-padding">
                <ion-button expand="block" @click="currentRecord.doSearch">
                    <ion-icon slot="end" :icon="arrowForwardCircleOutline"></ion-icon>
                    <ion-label>Generar Informe</ion-label>
                </ion-button>
            </div>
        </header>
        <main>
            <table-area v-if="currentRecord.data.headers.length > 0 || currentRecord.data.isLoading" :headers="currentRecord.data.headers" :items="currentRecord.data.body" :is-loading="currentRecord.data.isLoading"></table-area>
        </main>
        <footer v-if="currentRecord.data.headers.length > 0" class="ion-padding">
            <ion-button color="success" @click="downloadExcel" fill="outline" size="small" expand="block" style="max-width: 200px; margin: 0 auto; width: 100%;">
                <ion-icon slot="start" :icon="cloudDownloadOutline"></ion-icon>
                Descargar Excel
            </ion-button>
        </footer>
    </article>
</template>

<styles lang="scss" scoped>
.content{
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
}
</styles>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonAccordion, IonAccordionGroup, IonContent, IonButton, IonImg, IonAvatar,IonBackButton, IonProgressBar, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController } from '@ionic/vue';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { computed, ref } from 'vue';
import { Dialog } from '@/utils/Dialog/Dialog';
import EditUser from '@/dialogs/EditUser/EditUser.vue';

import { addOutline, albumsOutline, alertCircleOutline, arrowForwardCircleOutline, checkmarkCircleOutline, close, cloudDownloadOutline, logIn, refreshOutline } from 'ionicons/icons';
import { IReport } from '@/interfaces/ReportInterfaces';
import { useRouter } from 'vue-router';
import FiltersArea from '@/views/management/records/components/FiltersArea.vue';
import { DateTime } from 'luxon';
import TableArea from '@/views/management/records/components/TableArea.vue';
import { onMounted } from 'vue';
import RecordsConfigs from '@/views/management/records/RecordsConfigs';
import {ExcelGenerator} from '@/utils/Records/ExcelGenerator';
import { Toolbox } from '@/utils/Toolbox/Toolbox';

const isLoading = ref<boolean>(true);
const router = useRouter();
const page = ref<HTMLElement|null>(null);


const props = defineProps({
    type: {
        type: String,
        required: true
    }
})

interface IRecordConfiguration{
    id: string;
    title: string;
    filters: IRecordFilter[];
    endpoint: string;
    data?: {
        body?: {
            formatData?: (data:any) => any;
        }
    }
}
interface IRecordFilter{
    id: string;
    name: string;
    isRequired: boolean;
    type: string;
    options?: any[];
    value?: any;
}

const downloadExcel = () => {
    ExcelGenerator.generateExcelFrom({
        data: {
            headers: currentRecord.value.data.headers,
            body: currentRecord.value.data.body,
            query: currentRecord.value.data.query
        },
        filters: currentRecord.value.filters,
        title: 'Informe ' + currentRecord.value.configuration?.title || 'Informe'
    }).then((result) => {
        const fileTitle = 'Informe ' + currentRecord.value.configuration?.title
        Toolbox.share(fileTitle + '.xlsx', result as unknown as string)
    })
}


const currentRecord = ref<{
    configuration: IRecordConfiguration|null;
    data: {
        headers: any[];
        body: any[];
        query: any;
        isLoading: boolean;
    };
    filters: any[];
    doSearch: () => void;
}>({
    configuration: null,
    data: {
        headers: [],
        body: [],
        query: {},
        isLoading: false
    },
    filters: [],
    doSearch: () => {
        currentRecord.value.data.isLoading = true;
        RequestAPI.get('/management/records/' + currentRecord.value.configuration?.endpoint, (() => {
            const query:any = {};
            currentRecord.value.filters.forEach((filter) => {
                query[filter.value.id] = filter.value.value;
            });
            return query;
        })())
        .then((response) => {
            currentRecord.value.data.headers = response.data.headers;
            currentRecord.value.data.body = response.data.body;
            currentRecord.value.data.query = response.query;



            if (currentRecord.value.configuration?.data?.body?.formatData){
                currentRecord.value.data.body = currentRecord.value.data.body.map((item:any) => {
                    return currentRecord.value.configuration.data.body.formatData(item);
                })
            }

            currentRecord.value.data.isLoading = false;
        })
    }
})


function loadConfigurationById(id: string){
    const configuration = RecordsConfigs.find((config) => config.id == id);
    if (configuration){
        currentRecord.value.configuration = configuration;
        currentRecord.value.filters = generateFiltersData(configuration.filters);
    }
}



function generateFiltersData(filtersData:any){
    function generateFilterValue(filterItemData:any){
        const filterItem = ref(filterItemData);
        if (filterItem.value.type == 'date' && !filterItem.value.value){
            filterItem.value.value = DateTime.now().toISO();
        }else if (filterItem.value.type == 'dropdown'){
            filterItem.value.value = null;
        }
        return filterItem;
    }
    filtersData = filtersData.map((filter:any) => {
        return generateFilterValue(filter);
    });

    return filtersData;
}

onMounted(() => {
    loadConfigurationById(props.type);
})
</script>
