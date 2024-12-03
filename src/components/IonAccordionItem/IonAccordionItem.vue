<template>
    <ion-accordion-group ref="meElement" @ionChange="onChange">
        <ion-accordion>
            <article slot="header">
                <slot name="head"></slot>
            </article>
            
            <div slot="content">
                <slot name="body" v-if="isOpen"></slot>
            </div>
        </ion-accordion>
    </ion-accordion-group>
    
</template>

<script setup lang="ts">

import { IonAccordion, IonAccordionGroup, IonButton, IonButtons, IonChip, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSearchbar, IonSelect, IonSelectOption, IonToggle, IonToolbar, alertController } from '@ionic/vue';
import { ref } from 'vue';

const isOpen = ref(false);
const meElement = ref<HTMLElement | null>(null);

const onChange = (event: CustomEvent) => {
    const meElementEl = (meElement.value as any).$el;
    if (event.target != meElementEl){
        return;
    }
    if (event.detail.value){
        isOpen.value = true;
        return;
    }

    isOpen.value = false;
}

</script>

<style scoped lang="scss">

</style>