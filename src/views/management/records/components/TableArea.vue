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
import { IonSearchbar } from '@ionic/vue';
import { PropType, computed, ref } from 'vue';

import { Theme } from '@/utils/Theme/Theme';
import { useRouter } from 'vue-router';


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
