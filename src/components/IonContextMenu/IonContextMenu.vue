<template>
    <ion-backdrop v-if="isVisible" @ionBackdropTap="onClickBackdrop"></ion-backdrop>
    <article class="article" ref="componentRef" :origin-position="originPosition" @touchend="onTouchEnded" @click="onClickEnded">
        <slot></slot>
    </article>
</template>

<script setup lang="ts">

import { onMounted, getCurrentInstance, ref, watch } from 'vue';
import { IonList, IonItem, IonLabel, IonBackdrop, createGesture } from '@ionic/vue';
import { useMouseInElement } from '@vueuse/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const isVisible = ref(false);
const componentRef = ref(null);

const emit = defineEmits(['onSelect']);

const positionX = ref('0px');
const positionY = ref('0px');
const originPosition = ref<'TopLeft' | 'TopRight' | 'BottomLeft' | 'BottomRight'>('TopLeft');
const isAlreadySelected = ref(false);

const onClickBackdrop = () => {
    isVisible.value = false;
    closeComponent();
}

const selectItem = (index: number) => {
    if (isAlreadySelected.value){
        return;
    }

    const itemEmit = {
        label: componentRef.value.querySelectorAll('button')[index].getAttribute('label'),
        value: componentRef.value.querySelectorAll('button')[index].getAttribute('value')
    }

    emit('onSelect', itemEmit);

    isAlreadySelected.value = true;
    closeComponent();

    

    setTimeout(() => {
        isAlreadySelected.value = false;
    }, 300);
}

const onTouchEnded = (event: TouchEvent) => {
    if (buttonIndexHover.value > -1){
        selectItem(buttonIndexHover.value);
    }else{
        closeComponent();
    }
}

const onClickEnded = (event: MouseEvent) => {
    if (buttonIndexHover.value > -1){
        selectItem(buttonIndexHover.value);
    }else{
        closeComponent();
    }
}


const props = defineProps({
    trigger: {
        type: String,
        required: true
    }
})

const buttonIndexHover = ref(-1);


const closeComponent = () => {
    if (!componentRef.value){
        return;
    }
    componentRef.value.classList.remove('opening');
    componentRef.value.classList.add('closing');
    setTimeout(() => {
        isVisible.value = false;
        componentRef.value.classList.remove('closing');
        componentRef.value.classList.add('disabled');
    }, 300);
}
const openComponent = () => {
    if (!componentRef.value){
        return;
    }
    componentRef.value.classList.remove('disabled');
    componentRef.value.classList.add('opening');
    componentRef.value.classList.add('open');
}


const changeItemHover = (index: number) => {
    buttonIndexHover.value = index;
    if (buttonIndexHover.value > -1){
        Haptics.impact({
            style: ImpactStyle.Light
        });
        componentRef.value.querySelectorAll('button').forEach((element, i) => {
            if (i === index){
                element.setAttribute('is-hovering', 'true');
            }else{
                element.setAttribute('is-hovering', 'false');
            }
        })
    }else{
        componentRef.value.querySelectorAll('button').forEach((element, i) => {
            element.setAttribute('is-hovering', 'false');
        })
    }
}

const calculateComponentSizing = () => {
    setTimeout(() => {
        const componentSizing = (componentRef.value as unknown as HTMLElement).getBoundingClientRect();
        const triggerSizing = document.querySelector('#' + props.trigger)?.getBoundingClientRect();

        if (!triggerSizing || !componentSizing) {
            return;
        }

        let desiredPosition = {
            x: 0,
            y: 0
        }

        let yOrientation = 'Top';
        let xOrientation = 'Left';

        if (triggerSizing.y + componentSizing.height > window.innerHeight) {
            desiredPosition.y = triggerSizing.y - componentSizing.height - 10;
            yOrientation = 'Bottom';
        } else {
            desiredPosition.y = triggerSizing.y + triggerSizing.height + 10;
            yOrientation = 'Top';
        }
        if (triggerSizing.x + componentSizing.width > window.innerWidth) {
            desiredPosition.x = (triggerSizing.x + triggerSizing.width) - (componentSizing.width);
            xOrientation = 'Right';
        } else {
            desiredPosition.x = triggerSizing.x;
            xOrientation = 'Left';
        }

        originPosition.value = (yOrientation + xOrientation) as 'TopLeft' | 'TopRight' | 'BottomLeft' | 'BottomRight';

        positionX.value = desiredPosition.x + 'px';
        positionY.value = desiredPosition.y + 'px';


        if (componentRef.value){
            componentRef.value.querySelectorAll('button').forEach((element, i) => {
                const { isOutside } = useMouseInElement(element)

                watch(isOutside, (value) => {
                    if (value){
                        if (buttonIndexHover.value === i){
                            changeItemHover(-1);
                        }
                    }else{
                        if (buttonIndexHover.value !== i){
                            changeItemHover(i);
                        }
                    }
                })
            })
            componentRef.value.classList.add('disabled');
        }
    }, 100);
}

onMounted(() => {
    document.querySelector('#' + props.trigger)?.addEventListener('click', () => {
        if (isVisible.value){
            closeComponent();
            return;
        }
        
        openComponent();
        isVisible.value = true;
    });

    calculateComponentSizing();
});

</script>


<style scoped lang="scss">


@keyframes openAnimation{
    0%{
        scale: 0%;
        opacity: 0;
    }
    100%{
        scale: 100%;
        opacity: 1;
    }
}
@keyframes closeAnimation{
    0%{
        scale: 100%;
        opacity: 1;
    }
    100%{
        scale: 0%;
        opacity: 0;
    }
}
.article{
    z-index: 100000000;
    position: fixed;
    background: rgba( 255, 255, 255, 0.7 );
    box-shadow: 0 8px 32px 0 rgb(73 73 73 / 37%);
    backdrop-filter: blur( 6px );
    -webkit-backdrop-filter: blur( 6px );
    border-radius: 10px;

    left: v-bind(positionX);
    top: v-bind(positionY);

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    border-radius: 14px;
    overflow: hidden;
    visibility: hidden;
    :slotted(button){
        border-bottom-width: 0.55px;
        border-style: solid;
        border-color: var(--ion-tab-bar-border-color, var(--ion-border-color, var(--ion-color-step-150, rgba(0, 0, 0, 0.2))));



        &[separate="true"]:not(:last-child){
            border-bottom-width: 4px;
        }
        &[separate="true"]:last-child{
            border-top-width: 4px;
        }
        &:nth-last-child(1){
            border-bottom: unset;
        }
    }

    &[origin-position="TopLeft"]{
        transform-origin: 0% 0%;
    }
    &[origin-position="TopRight"]{
        transform-origin: 100% 0%;
    }
    &[origin-position="BottomLeft"]{
        transform-origin: 0% 100%;
    }
    &[origin-position="BottomRight"]{
        transform-origin: 100% 100%;
    }

    &.open{
        visibility: visible;
    }
    &.disabled{
        display: none;
    }

    &.opening{
        animation: openAnimation 0.2s cubic-bezier(0.1, 0.76, 0.55, 0.9);
    }
    &.closing{
        animation: closeAnimation 0.2s cubic-bezier(0.1, 0.76, 0.55, 0.9) forwards;
    }
}

@media (prefers-color-scheme: dark) {
    .article{
        background: rgba( 36, 36, 36, 0.7 );
        box-shadow: 0 8px 32px 0 rgb(73 73 73 / 37%);
        backdrop-filter: blur( 6px );
        -webkit-backdrop-filter: blur( 6px );
        border-radius: 10px;
    }
}
</style>