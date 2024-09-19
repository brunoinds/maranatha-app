<template>
    <section class="content">
        <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>

        
    </section>


    <ion-fab slot="fixed" vertical="bottom" horizontal="end" :edge="false">
        <ion-fab-button @click="createConstructionDailyReport">
            <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
        <br>
        <ion-fab-button @click="createConstructionPhase">
            <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
    </ion-fab>
</template>


<script setup lang="ts">

import { IProjectJob } from '@/interfaces/ProjectsInterfaces';
import { IonIcon, IonProgressBar, IonFab, IonFabButton } from '@ionic/vue';
import { DateTime } from 'luxon';
import { PropType, computed, onMounted, ref } from 'vue';
import chroma from "chroma-js";
import { IProjectConstructionPhase, IProjectConstructionTask } from '@/interfaces/ProjectsInterfaces';
import { addOutline } from 'ionicons/icons';
import CreateProjectConstructionDailyReport from '@/dialogs/CreateProjectConstructionDailyReport/CreateProjectConstructionDailyReport.vue';
import { Dialog } from '@/utils/Dialog/Dialog';
import CreateProjectConstructionPhase from '@/dialogs/CreateProjectConstructionPhase/CreateProjectConstructionPhase.vue';

const isLoading = ref<boolean>(false);
const props = defineProps({
    projectJob: {
        type: Object as PropType<IProjectJob>,
        required: true
    }
});

const projectJobData = computed(() => {
    return props.projectJob;
})


const createConstructionDailyReport = () => {
    Dialog.show(CreateProjectConstructionDailyReport, {
        props: {
            
        },
        onLoaded($this) {
            $this.on('selected', (event:any) => {
                
            })
            
        },
    })
}

const createConstructionPhase = () => {
    Dialog.show(CreateProjectConstructionPhase, {
        props: {
            projectJob: props.projectJob
        },
        onLoaded($this) {
            $this.on('selected', (event:any) => {
                
            })
            
        },
    })
}

onMounted(() => {
    
});
</script>

<style scoped lang="scss">
.content{
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
}
ion-fab[slot="fixed"]{
    position: fixed;
}
</style>

