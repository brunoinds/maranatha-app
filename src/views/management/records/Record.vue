<template>
    <article>
        <header class="content-data">
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
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>

            <div class="ion-padding">
                <ion-button expand="block" @click="currentRecord.doSearch">
                    <ion-icon slot="end" :icon="arrowForwardCircleOutline"></ion-icon>
                    <ion-label>Generar Informe</ion-label>
                </ion-button>
                <ion-button color="success" @click="downloadExcel" fill="clear" size="default" expand="block" style="max-width: 200px; margin: 0 auto; width: 100%;">
                    <ion-icon slot="end" :icon="cloudDownloadOutline"></ion-icon>
                    Descargar Excel
                </ion-button>
            </div>
        </header>
        <main>
            <table-area v-if="currentRecord.data.headers.length > 0 || currentRecord.data.isLoading" :headers="currentRecord.data.headers" :items="currentRecord.data.body" :is-loading="currentRecord.data.isLoading"></table-area>
        </main>
        <footer class="ion-padding">
            <article style="display: flex; align-items: center; justify-content: center;">
                <ion-label class="ion-text-center" style="font-size: 12px">Cód. Plantilla: {{ currentRecord.configuration?.id }}</ion-label>
            </article>
        </footer>
    </article>
</template>

<styles lang="scss" scoped>
.content-data{
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
}
</styles>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonAccordion, IonAccordionGroup, IonContent, IonButton, IonImg, IonAvatar,IonBackButton, IonProgressBar, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController } from '@ionic/vue';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { computed, onUnmounted, ref } from 'vue';
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
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { GenerateAttendancesByWorkersJobsExpenses } from '@/utils/ExcelExport/AttendancesByWorkersJobsExpenses';

const isLoading = ref<boolean>(true);
const router = useRouter();
const page = ref<HTMLElement|null>(null);


const props = defineProps({
    type: {
        type: String,
        required: true
    },
    preFilling: {
        type: Object,
        required: false,
        default: () => ({})
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
        },
        footer?: any;
        rules?: any;
        metadata?: any;
    }
}
interface IRecordFilter{
    id: string;
    name: string;
    isRequired: boolean;
    type: string;
    options?: any[];
    multiple?: boolean;
    value?: any;
}

const downloadExcel = async () => {
    if (currentRecord.value.data.headers.length == 0){
        await currentRecord.value.doSearch();
    }



    if (currentRecord.value.configuration?.id == 'attendances-by-workers-jobs-expenses'){
        GenerateAttendancesByWorkersJobsExpenses.render(currentRecord.value.data).then((result) => {
            const fileTitle = 'Informe ' + currentRecord.value.configuration?.title
            Toolbox.share(fileTitle + '.xls', result as unknown as string)
        })
        return;
    }
    

    ExcelGenerator.generateExcelFrom({
        data: {
            headers: currentRecord.value.data.headers,
            body: currentRecord.value.data.body,
            query: currentRecord.value.data.query,
            rules: currentRecord.value.data.rules || undefined,
            footer: currentRecord.value.data.footer || undefined
        },
        filters: currentRecord.value.filters.map((filter) => {
            let filterStatic = JSON.parse(JSON.stringify(filter.value));
            if (filterStatic.id == 'warehouse_ids'){
                filterStatic.options = filterStatic.options.map((item) => {
                    return {
                        ...item,
                        value: item.name
                    }
                })
                if (Array.isArray(filterStatic.value)){
                    filterStatic.value = filterStatic.value.map((item) => {
                        return filterStatic.options.find((option) => option.id == item).name
                    })
                }
            }
            return ref(filterStatic);
        }),
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
        footer: any;
        rules: any;
        query: any;
        metadata: any;
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
            footer: null,
            rules: null,
            metadata: null,
            isLoading: false
        },
        filters: [],
        doSearch: () => {
            return new Promise((resolve) => {
                currentRecord.value.data.isLoading = true;
                if (currentRecord.value.configuration?.filters)

                RequestAPI.get('/management/records/' + currentRecord.value.configuration?.endpoint, (() => {
                    const query:any = {};
                    currentRecord.value.filters.forEach((filter) => {
                        query[filter.value.id] = filter.value.value;

                        if (filter.value.id == 'date_range'){
                            query['start_date'] = DateTime.fromFormat(filter.value.value.start, 'yyyy-MM-dd').toISO();
                            query['end_date'] = DateTime.fromFormat(filter.value.value.end, 'yyyy-MM-dd').toISO()
                        }
                    });

                    query['date_range'] = undefined;

                    return query;
                })())
                .then((response) => {
                    currentRecord.value.data.headers = response.data.headers;
                    currentRecord.value.data.body = response.data.body;
                    currentRecord.value.data.query = response.query;
                    currentRecord.value.data.footer = response.data.footer || undefined;
                    currentRecord.value.data.rules = response.data.rules || undefined;
                    currentRecord.value.data.metadata = response.data.metadata || undefined;

                    if (currentRecord.value.configuration?.data?.body?.formatData){
                        currentRecord.value.data.body = currentRecord.value.data.body.map((item:any) => {
                            return currentRecord.value.configuration.data.body.formatData(item);
                        })
                    }

                    currentRecord.value.data.isLoading = false;
                    resolve()
                })
        })
        
    }
})


async function loadConfigurationById(id: string){
    isLoading.value = true;
    const configs = await RecordsConfigs.getConfigurations();
    const configuration = configs.find((config) => config.id == id);
    if (configuration){
        currentRecord.value.configuration = configuration;
        currentRecord.value.filters = generateFiltersData(configuration.filters);
    }
    isLoading.value = false;
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

onMounted(async () => {
    await loadConfigurationById(props.type);

    //Load prefilling data:
    currentRecord.value.filters.forEach((filter) => {
        if (props.preFilling[filter.value.id]){
            filter.value.value = props.preFilling[filter.value.id];
        }
    })
});

onMounted(() => {
    const callbackId = AppEvents.on('all:reload', () => {
        currentRecord.value.doSearch();
    })
    onUnmounted(() => {
        AppEvents.off('all:reload', callbackId);
    })
})
</script>
