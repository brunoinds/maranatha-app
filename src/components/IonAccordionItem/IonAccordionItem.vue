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

import { IonAccordion, IonAccordionGroup } from '@ionic/vue';
import { ref } from 'vue';

const isOpen = ref(false);
const meElement = ref<HTMLElement | null>(null);
const timeoutId = ref<number | null>(null);
const onChange = (event: CustomEvent) => {
    const meElementEl = (meElement.value as any).$el;
    if (event.target != meElementEl){
        return;
    }
    if (event.detail.value){
        if (timeoutId.value) {
            clearTimeout(timeoutId.value);
        }
        isOpen.value = true;
        return;
    }

    setTimeout(() => {
        isOpen.value = false;
    }, 300);
}

</script>

<style scoped lang="scss">

</style>