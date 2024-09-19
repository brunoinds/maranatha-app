<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-button @click="props.emitter.fire('close')">Cancelar</ion-button>
                </ion-buttons>
                <ion-title>Elegir Estructura</ion-title>
            </ion-toolbar>
            <ion-toolbar>
                <ion-searchbar v-model="dynamicData.search" :animated="true" placeholder="Buscar estructura"></ion-searchbar>
            </ion-toolbar>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <ion-list>
                <ion-item button v-for="structure in structuresUI" :key="structure.id" @click="selectStructure(structure)" :detail="false">
                    <ion-label>
                        <h2>{{ structure.name }}</h2>
                        <p>{{ structure.structure_type }}</p>
                        <p>{{ ProjectEnumsDescriptor.structureBuildingType(structure.building_type) }}</p>
                    </ion-label>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IProjectStructure, ProjectEnumsDescriptor } from '@/interfaces/ProjectsInterfaces';
import { ProjectsStore } from '@/utils/Stored/ProjecsStore';
import { IonButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonPage, IonProgressBar, IonSearchbar, IonTitle, IonToolbar } from '@ionic/vue';
import { computed, onMounted, ref } from 'vue';
import { DialogEventEmitter } from "../../utils/Dialog/Dialog";

const isLoading = ref<boolean>(false);
const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    }
});


const structuresData = ref<IProjectStructure[]>([]);

const dynamicData = ref<{
    search: string,
}>({
    search: '',
});


const structuresUI = computed(() => {
    return structuresData.value.filter((structure) => {
        if (dynamicData.value.search.length === 0) return true;
        return  structure.name.toLowerCase().includes(dynamicData.value.search.toLowerCase()) || 
                structure.structure_type?.toLowerCase().includes(dynamicData.value.search.toLowerCase())
    })
})

const loadStructures = async () => {
    isLoading.value = true;
    const response = await ProjectsStore.getStructures();

    structuresData.value = response;
    isLoading.value = false;
}


const selectStructure = (structure: IProjectStructure) => {
    props.emitter.fire('selected', structure);
    props.emitter.fire('close');
}


onMounted(() => {
    loadStructures();
})


</script>

<style scoped lang="scss">
</style>