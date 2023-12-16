<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start">
                </ion-buttons>
                <ion-title>Sincronizando boletas y facturas</ion-title>
                <ion-progress-bar :value="progressValue"></ion-progress-bar>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <article class="ion-padding" style="display: flex;flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                <ion-img class="rotate" :src="SyncIcon" style="width: 90%;margin: 0 auto;"></ion-img>
                <h2 style="text-align: center">Sincronizando documentos...</h2>
                <p class="ion-text-center">Esto puede tardar unos minutos, por favor no cierres la aplicación.</p>
            </article>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonImg, IonToolbar, IonTitle, IonButtons, IonThumbnail, IonContent,  IonListHeader, IonIcon, IonInput, IonSelect, IonSelectOption, IonModal, IonDatetime, IonDatetimeButton, IonButton, IonList, IonItem, IonLabel, IonProgressBar, toastController, alertController } from '@ionic/vue';
import { computed, defineComponent, nextTick, onMounted, reactive, ref } from 'vue';
import { briefcaseOutline,  trashBinOutline, camera, cameraOutline, qrCodeOutline, ticketOutline, checkmarkCircleOutline, arrowForwardCircleOutline, cash } from 'ionicons/icons';
import { DialogEventEmitter } from "../../utils/Dialog/Dialog";
import { vMaska } from "maska";
import { values } from 'lodash';
import { DateTime } from 'luxon';
import * as EmailValidator from 'email-validator';
import { watch } from 'fs';
import SyncIcon from '&/assets/icons/sync.svg';


const props = defineProps({
    emitter: {
        type: DialogEventEmitter,
        required: true
    }
});


const progressValue = ref<number>(0);

props.emitter.on('progress', (data) => {
    progressValue.value = data.data;
});
</script>

<style scoped lang="scss">
.rotate {
    animation: rotation 2s infinite linear reverse;
}

@keyframes rotation {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(359deg);
    }
}
</style>