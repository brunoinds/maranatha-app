import { createGesture, Gesture } from "@ionic/vue";
import { ref } from "vue";



class IonPeekPop{
    private static gesture: Gesture | null = null;
    public static initialize(){
        const gesture = createGesture({
            el: document.getElementByTagName('ion-app'),
            onStart: () => {
                console.log('start');
            },
            onMove: (detail) => {
                const popoverContentEl = ref(document.querySelector(`[global-register="ion-peek-pop-popover-content"]`));
                const isReadyForMoveMoviments = ref(popoverContentEl.value?.getAttribute('isReadyForMoveMoviments') === 'true');

                console.log(popoverContentEl)

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
                    const windowPadding = (window.innerHeight - popoverContentEl.value.getBoundingClientRect().height) / 2;
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




                console.log({newTag, currentMovementChangePercentageX});
                if (currentMovementChangePercentageX > 80 || currentMovementChangePercentageX < -80){
                    closePeek();
                }

            },
            onEnd: () => {
                const popoverContentEl = ref(document.querySelector(`[global-register="ion-peek-pop-popover-content"]`));
                const isReadyForMoveMoviments = ref(popoverContentEl.value?.getAttribute('isReadyForMoveMoviments') === 'true');


                if (!isReadyForMoveMoviments.value || !popoverContentEl.value){
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
            gestureName: 'gestureId' + uniqueId.value,
        });
        this.gesture = gesture;
        this.gesture.enable();
    }
}






export const useIonPeekPop = () => {

}