<template>
    <section>
        <header class="ion-padding">
            <ion-segment v-if="configurationsData" :scrollable="true" :value="segmentValue" v-model="segmentValue">
                <ion-segment-button v-for="itemRecord in configurationsData" :value="itemRecord.id" :key="itemRecord.id">
                    <ion-label>{{ itemRecord.title}}</ion-label>
                </ion-segment-button>
            </ion-segment>
        </header>
        <main>
            <article>
                
            </article>
        </main>
    </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonCheckbox, IonSegment, IonSelect, IonSelectOption, IonButton, IonSegmentButton, IonContent, IonAccordion, IonAccordionGroup, IonProgressBar, IonImg, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController } from '@ionic/vue';



const segmentValue = ref('warehouses');

const configurationsData = computed(() => {
    let items = [
        {
            id: 'warehouses',
            title: 'Almacenes',
            enabled: true
        }
    ];


    return items.filter((item) => item.enabled);
});
</script>

<style scoped lang="scss">
</style>