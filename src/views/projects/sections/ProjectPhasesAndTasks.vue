<template>
    <section class="content">
        <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
    </section>

    <article>
        <ion-list-header>Construcción</ion-list-header>
        <ion-accordion-group>
            <ion-accordion v-for="phase in phasesAndTasksUI.construction" :key="phase.phase.id">
                <ion-item slot="header" color="light">
                    <ion-label>
                        <h2><b>{{ phase.phase.name }}</b></h2>
                        <p>{{ phase.phase.description }}</p>
                        <p>{{ phase.phase.progress }}%</p>
                        <p>{{ phase.phase.status }}</p>
                        <p>Workers: {{ phase.count_workers }}</p>

                    </ion-label>
                </ion-item>
                <section slot="content">
                    <ion-list>
                        <ion-item v-for="task in phase.tasks" :key="task.id">
                            <ion-label>
                                <h3><b>{{ task.name }}</b></h3>
                                <p>{{ task.description }}</p>
                                <p>{{ task.progress }}%</p>
                                <p>{{ task.status }}</p>

                            </ion-label>
                        </ion-item>
                    </ion-list>
                </section>
            </ion-accordion>
        </ion-accordion-group>
    </article>


</template>


<script setup lang="ts">

import { IProjectJob } from '@/interfaces/ProjectsInterfaces';
import { IonProgressBar } from '@ionic/vue';
import { PropType, computed, onMounted, ref } from 'vue';

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


const phasesAndTasksUI = computed(() => {
    return {
        construction: projectJobData.value.construction_phases?.map((phase) => {
            return {
                phase: phase,
                count_workers: (() => {
                    let count = 0;
                    phase.tasks?.forEach((task) => {
                        if(task.count_workers > count){
                            count = task.count_workers;
                        }
                    });
                    return count;
                })(),
                tasks: phase.tasks
            }
        })
    }
})


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

