<template>
    <button class="item" ref="itemEl" v-on-long-press="[onLongPressCallbackDirective, { delay: 500, modifiers: { stop: true, prevent: true } }]">
        <article class="item-protector" @click="onPressCallback"></article>
        <article ref="itemContentEl">
            <ion-button id="open-custom-dialog" v-show="false">Peek</ion-button>
            <slot name="item"></slot>
        </article>
    </button>
    
    <article class="popover">
        <section class="popover-modal-holder" v-if="showModal">
            <ion-modal class="modal" v-if="showModal" :showBackdrop="false" ref="modalEl" trigger="open-custom-dialog" :enter-animation="enterAnimation" :keepContentsMounted="false">
                <article class="item-mirror-area" ref="itemMirrorAreaEl">
                    <slot name="item"></slot>
                </article>
                <article class="popover-area">
                    <article class="popover-content" ref="popoverContentEl" style="transform: translateX(-50%) translateY(-50%)">
                        <article class="popover-slot">
                            <slot name="popover"></slot>
                        </article>
                        <article class="popover-items">
                            <ion-list>
                                <ion-item button>
                                    <ion-label>Item 1</ion-label>
                                </ion-item>
                                <ion-item>
                                    <ion-label>Item 2</ion-label>
                                </ion-item>
                            </ion-list>
                            </article>
                    </article>
                </article>
            </ion-modal>
        </section>
        
    </article>

</template>

<script setup lang="ts">

import { onMounted, getCurrentInstance, ref, watch, nextTick } from 'vue';
import { IonList, IonItem, IonLabel, IonBackdrop, IonPage, IonModal, createGesture, createAnimation } from '@ionic/vue';
import { onLongPress, useMouseInElement } from '@vueuse/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { OnLongPress } from '@vueuse/components'
import { vOnLongPress } from '@vueuse/components'


const backdropEl = ref<HTMLElement | null>(null);

const isBackdropVisible = ref(false);
const modalEl = ref(null);
const itemEl = ref<HTMLElement>();
const popoverContentEl = ref<HTMLElement>();
const itemContentEl = ref<HTMLElement>();
const itemMirrorAreaEl = ref<HTMLElement>();
const isReadyForMoveMoviments = ref(false);
const hasLongPress = ref(false);
const showModal = ref(false);

const props = defineProps({
    
})
const emit = defineEmits(['onPeek', 'onPop', 'onDismiss']);

const waitForNextTick = async () => {
    await nextTick();
}

const onPressCallback = (ev) => {
    if (hasLongPress.value) {
        ev.stopPropagation();
        ev.preventDefault();
        hasLongPress.value = false;
        return;
    }
}
const onLongPressCallbackDirective = (ev) => {
    ev.stopPropagation();
    hasLongPress.value = true;
    doPeek();
}


const doPeek = async () => {
    showModal.value = true;

    await waitForNextTick();

    document.querySelector('#open-custom-dialog').click();
    Haptics.impact({
        style: ImpactStyle.Heavy
    });

    setTimeout(() => {
        if (!popoverContentEl.value || !itemContentEl.value || !itemMirrorAreaEl.value){
            return;
        }

        const popoverContentRect = popoverContentEl.value?.getBoundingClientRect();
        const itemContentRect = itemContentEl.value?.getBoundingClientRect();

        console.log('Prev', popoverContentRect);


        itemMirrorAreaEl.value.style.position = 'fixed';
        itemMirrorAreaEl.value.style.top = `${itemContentRect.top}px`;
        itemMirrorAreaEl.value.style.left = `${itemContentRect.left}px`;
        itemMirrorAreaEl.value.style.width = `${itemContentRect.width}px`;
        itemMirrorAreaEl.value.style.height = `${itemContentRect.height}px`;
        itemMirrorAreaEl.value.style.zIndex = '1000';
        itemMirrorAreaEl.value.style.opacity = '1';


        popoverContentEl.value.style.position = 'fixed';
        popoverContentEl.value.style.top = `${itemContentRect.top}px`;
        popoverContentEl.value.style.left = `${itemContentRect.left}px`;
        popoverContentEl.value.style.width = `${itemContentRect.width}px`;
        popoverContentEl.value.style.height = `${itemContentRect.height}px`;
        popoverContentEl.value.style.zIndex = '1000';
        popoverContentEl.value.style.transform = 'unset';
        popoverContentEl.value.style.opacity = '0';



        //Animate to make the itemMirrorAreaEl to the popoverContentEl:
        requestAnimationFrame(() => {
            if (!popoverContentEl.value || !itemMirrorAreaEl.value){
                return;
            }

            itemMirrorAreaEl.value.style.visibility = 'visible';
            itemMirrorAreaEl.value.style.transition = 'all 0.3s ease';
            itemMirrorAreaEl.value.style.top = `${popoverContentRect.top}px`;
            itemMirrorAreaEl.value.style.left = `${popoverContentRect.left}px`;
            itemMirrorAreaEl.value.style.width = `${popoverContentRect.width}px`;
            itemMirrorAreaEl.value.style.height = `${popoverContentRect.height}px`;
            itemMirrorAreaEl.value.style.zIndex = '1000';
            itemMirrorAreaEl.value.style.opacity = '0';
        })

        //Animate to make popoverContentEl to have same size as itemMirrorAreaEl and then morph to the final size of the popoverContentEl:
        requestAnimationFrame(() => {
            if (!popoverContentEl.value || !itemMirrorAreaEl.value){
                return;
            }
            popoverContentEl.value.style.visibility = 'visible';
            popoverContentEl.value.style.transition = 'all 0.3s ease';
            popoverContentEl.value.style.top = `${popoverContentRect.top}px`;
            popoverContentEl.value.style.left = `${popoverContentRect.left}px`;
            popoverContentEl.value.style.width = `${popoverContentRect.width}px`;
            popoverContentEl.value.style.height = `${popoverContentRect.height}px`;
            popoverContentEl.value.style.transform = 'unset';
            popoverContentEl.value.style.zIndex = '1000';
            popoverContentEl.value.style.opacity = '1';
            setTimeout(() => {
                requestAnimationFrame(() => {
                    if (!popoverContentEl.value || !itemMirrorAreaEl.value){
                        return;
                    }
                    popoverContentEl.value.style.transition = 'unset';
                    popoverContentEl.value.style.position = 'absolute';
                    popoverContentEl.value.style.top = '50%';
                    popoverContentEl.value.style.left = '50%';
                    popoverContentEl.value.style.transform = 'translateX(-50%) translateY(-50%)';
                    isReadyForMoveMoviments.value = true;
                })
            }, 300)
        })


        console.log(itemContentEl.value?.getBoundingClientRect());
    }, 100)

}
const closePeek = async () => {
    modalEl.value.$el.dismiss();
    setTimeout(async () => {
        await waitForNextTick();
        showModal.value = false;
    }, 300)
}

onMounted(() => {

    setTimeout(() => {
        const gesture = createGesture({
            el: itemEl.value?.closest('ion-app'),
            onStart: () => {
                console.log('start');
            },
            onMove: (detail) => {
                if (!popoverContentEl.value || !isReadyForMoveMoviments.value){
                    return;
                }

                const calculateMovementChangePercentageX = () => {
                    if (detail.deltaX > 0){
                        return (detail.currentX * 100) / window.innerWidth;
                    }else{
                        return -(100 - ((detail.currentX * 100) / detail.startX));
                    }
                }
                const calculateTranslationX = (currentMovementChangePercentageX:number) => {
                    const windowPadding = (window.innerWidth - popoverContentEl.value?.getBoundingClientRect().width) / 2;
                    if (currentMovementChangePercentageX > 0){
                        return (currentMovementChangePercentageX * windowPadding) / 100;
                    }else{
                        return -((currentMovementChangePercentageX * -1) * windowPadding) / 100;
                    }
                }

                const calculateMovementChangePercentageY = () => {
                    if (detail.deltaY > 0){
                        /*
                            (detail.currentY * 100) / window.innerHeight; is:
                            window.innerHeight = 100%
                            detail.currentY = x%
                        
                        */

                        //return +(100 - ((detail.currentY * 100) / detail.startY));

                        //Return the inverse of return -(100 - ((detail.currentY * 100) / detail.startY));
                        return (detail.currentY * 100) / window.innerHeight;
                    }else{
                        return -(100 - ((detail.currentY * 100) / detail.startY));
                    }
                }

                const calculateTranslationY = (currentMovementChangePercentageY:number) => {
                    const windowPadding = (window.innerHeight - popoverContentEl.value?.getBoundingClientRect().height) / 2;
                    if (currentMovementChangePercentageY > 0){
                        return (currentMovementChangePercentageY * windowPadding) / 100;
                    }else{
                        return -((currentMovementChangePercentageY * -1) * windowPadding) / 100;
                    }
                }


                const getTranslateX = (element:HTMLElement) => {
                    const regex = /translateX\(([^)]+)\)/;
                    const style = element.style.transform;
                    const match = regex.exec(style);
                    return match[1];
                }
                const getTranslateY = (element:HTMLElement) => {
                    const regex = /translateY\(([^)]+)\)/;
                    const style = element.style.transform;
                    const match = regex.exec(style);
                    return match[1];
                }



                const currentMovementChangePercentageX = calculateMovementChangePercentageX();
                const currentMovementChangePercentageY = calculateMovementChangePercentageY();
                const currentTranslationX = calculateTranslationX(currentMovementChangePercentageX);
                const currentTranslationY = calculateTranslationY(currentMovementChangePercentageY);

                //Now with currentTranslationX px, the context is the element is top: 50%, left: 50% and current transform: translateX(-50%) translateY(-50%). So, calculate how much translateX should be added to the element in percentage:
                const currentTranslateXPercentage = (currentTranslationX * 100) / popoverContentEl.value?.getBoundingClientRect().width;
                const currentTranslateYPercentage = (currentTranslationY * 100) / popoverContentEl.value?.getBoundingClientRect().height;

                //Get the current translateX value and translateY, save them and add the currentTranslationX value to the translateX value:

                const currentTransform = {
                    translateX: getTranslateX(popoverContentEl.value),
                    translateY: getTranslateY(popoverContentEl.value)
                }

                let desiredTransform = {
                    translateX: currentTransform.translateX,
                    translateY: currentTransform.translateY
                }

                if (currentTranslateXPercentage > 0){
                    desiredTransform.translateX = ((-50) + currentTranslateXPercentage).toFixed(2).toString();
                }else{
                    desiredTransform.translateX = ((-50) + currentTranslateXPercentage).toFixed(2).toString();
                }

                if (currentTranslateYPercentage > 0){
                    //desiredTransform.translateY = ((-50) + currentTranslateYPercentage).toFixed(2).toString();
                }else{
                    //desiredTransform.translateY = ((-50) + currentTranslateYPercentage).toFixed(2).toString();
                }

                desiredTransform.translateY = '-50'.toString();


                const newTag = `translateX(${desiredTransform.translateX}%) translateY(${desiredTransform.translateY}%)`;


                requestAnimationFrame(() => {
                    if (!popoverContentEl.value){
                        return;
                    }
                    popoverContentEl.value.style.transform = newTag;
                })




                //console.log({newTag, currentMovementChangePercentageY, currentTranslationY, currentTranslateYPercentage});
                if (currentMovementChangePercentageX > 80 || currentMovementChangePercentageX < -80){
                    closePeek();
                }

            },
            onEnd: () => {
                if (!isReadyForMoveMoviments.value){
                    return;
                }
                const newTag = `translateX(-50%) translateY(-50%)`;
                requestAnimationFrame(() => {
                    if (!popoverContentEl.value){
                        return;
                    }
                    popoverContentEl.value.style.transform = newTag;
                })
            },
            gestureName: 'example',
        });
        gesture.enable();
    }, 100)
    
})

window.oncontextmenu = function() { return false; }


const enterAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot as unknown as any;

    const backdropAnimation = createAnimation()
      .addElement(root.querySelector('ion-backdrop'))
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = createAnimation()
      .addElement(root.querySelector('.modal-wrapper'))
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(1)' },
        { offset: 1, opacity: '0.99', transform: 'scale(1)' },
      ]);

    return createAnimation()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(300)
      .addAnimation([backdropAnimation, wrapperAnimation]);
};

</script>


<style scoped lang="scss">
ion-backdrop {
    opacity: 0.9;
    background: var(--ion-color-primary);
}

ion-modal{
    --width: 100%;
    --height: 100%;
    --border-radius: 0px;
    --box-shadow: 0 28px 48px rgba(0, 0, 0, 0.4);
    --background: transparent;
    backdrop-filter: blur(1.5px);
    -webkit-backdrop-filter: blur(1.5px);
}

.popover-area{
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}
.popover-content{
    border-radius: 10px;
    overflow: hidden;
    background-color: gray;
    position: absolute;
    top: 50%;
    left: 50%;
    width: 90%;
    box-shadow: 0 28px 48px rgba(0, 0, 0, 0.4);
}

.item{
    position: relative;

    > .item-protector{
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: transparent;
        z-index: 1;
    }
}

.item-mirror-area{
    visibility: hidden;
}
.popover-content{
    visibility: hidden;
}

</style>