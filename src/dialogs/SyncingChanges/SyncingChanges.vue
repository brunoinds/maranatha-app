<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-buttons slot="start"></ion-buttons>
                <ion-title>Sincronizando boletas y facturas</ion-title>
            </ion-toolbar>
            <ion-progress-bar :value="progressValue"></ion-progress-bar>
        </ion-header>
        <ion-content>
            <article v-if="StoredInvoices.uploadPendingInfo.value.isUploading" style="padding: 10px;display: flex; flex-direction: column; align-items: center; justify-content: center; row-gap: 10px; border-bottom: 1px solid gainsboro; padding: 20px;">
                <ion-img class="rotate" :src="SyncIcon" style="width: 130px;margin: 0 auto;"></ion-img>
                <article style="display: flex; flex-direction: column; align-items: center; text-align: center;">
                    <h2 style="text-align: center; font-size: 19px; margin: 0">Sincronizando documentos...</h2>
                    <p style="margin: 0; font-size: 12px;">Esto puede tardar unos minutos, por favor no cierres la aplicación.</p>
                </article>
            </article>

            <article v-if="!StoredInvoices.uploadPendingInfo.value.isUploading" style="padding: 10px;display: flex; flex-direction: column; align-items: center; justify-content: center; row-gap: 10px; border-bottom: 1px solid gainsboro;padding: 20px;">
                <ion-img :src="ErrorIcon" style="width: 130px;margin: 0 auto;"></ion-img>
                <article style="display: flex; flex-direction: column; align-items: center; text-align: center;">
                    <h2 style="text-align: center; font-size: 19px; margin: 0">Error al subir documentos...</h2>
                    <p style="margin: 0; font-size: 12px;">Chequea las boletas/facturas que no han podido ser enviadas al servidor...</p>
                </article>
            </article>



            <article>
                <ion-accordion-group>
                    <ion-accordion v-for="invoice in syncingItemsData" :key="invoice.id">
                        <ion-item slot="header" color="light">
                            <IonThumbnail slot="start">
                                <ion-img :src="'data:image/jpeg;base64, ' + invoice.image"></ion-img>
                            </IonThumbnail>
                            <ion-label>
                                <h2><b>{{ invoice.description }}</b></h2>
                                <p>{{ invoice.date }} ($ {{ invoice.amount.toFixed(2) }})</p>
                                <p style="color: gray; font-size: 10px">{{ invoice.uploading.text }}</p>

                            </ion-label>
                            <ion-progress-bar style="position: absolute; bottom: 0; left: 0; right: 0;" :value="invoice.uploading.progress * 0.01" :type="invoice.uploading.progress == 0 ? 'indeterminate' : 'determinate'" v-if="invoice.uploading.isUploading && invoice.uploading.progress < 100"></ion-progress-bar>
                            <IonIcon slot="end" color="success" :icon="checkmarkCircleOutline"  v-if="!invoice.uploading.isUploading && !invoice.uploading.error"></IonIcon>
                            <IonIcon slot="end" color="danger" :icon="alertCircleOutline"  v-if="invoice.uploading.error"></IonIcon>
                        </ion-item>
                        <section slot="content">
                            <section class="ion-padding" v-if="invoice.uploading.error">
                                <span style="display: flex; align-items: center; font-size: 13px; column-gap: 6px; margin-bottom: 10px">
                                    <IonIcon color="danger" :icon="alertCircleOutline"></IonIcon>
                                    <p style="margin: 0px;">No fue posible subir este documento porque el siguiente error ha ocurrido:</p>
                                </span>
                                <article style="color: red; background-color: whitesmoke; border-radius: 8px; font-size: 11px; padding: 6px;">
                                    <pre>{{ invoice.uploading.error?.requestError}}</pre>
                                    <pre>{{ invoice.uploading.error?.nativeError}}</pre>
                                </article>

                                <article style="display: flex; align-items: center; justify-content: space-between;">
                                    <ion-button size="small" fill="outline" color="dark" @click="shareErrorCode(invoice)">
                                        <IonIcon slot="start" :icon="copyOutline"></IonIcon>
                                        <span>Compartir código de error</span>
                                    </ion-button>
                                    <ion-button size="small" fill="outline" color="danger" @click="removeInvoice(invoice.id)">
                                        <IonIcon slot="start" :icon="trashOutline"></IonIcon>
                                        <span>Eliminar este documento</span>
                                    </ion-button>
                                </article>
                            </section>
                            

                        </section>
                    </ion-accordion>
                </ion-accordion-group>
            </article>

            <article class="ion-padding" v-if="!StoredInvoices.uploadPendingInfo.value.isUploading">
                <ion-button expand="block" color="warning" @click="retrySyncAll">
                    <IonIcon slot="start" :icon="reloadOutline"></IonIcon>
                    <span>Reintentar sincronizar</span>
                </ion-button>
                <ion-button expand="block" color="danger" fill="clear" @click="removeAll">
                    <IonIcon slot="start" :icon="trashOutline"></IonIcon>
                    <span>Borrar todo</span>
                </ion-button>
            </article>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import SyncIcon from '&/assets/icons/sync.svg';
import ErrorIcon from '&/assets/icons/error.svg';

import { IInvoiceResponseUploading, StoredInvoices } from '@/utils/Stored/StoredInvoices';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonAccordionGroup, IonAccordion, IonThumbnail, IonImg, IonItem, IonLabel, IonList, IonPage, IonProgressBar, IonTitle, IonToolbar, alertController } from '@ionic/vue';
import { copyOutline, checkmarkCircleOutline, alertCircleOutline, reloadOutline, trashOutline } from 'ionicons/icons';
import { computed, ref } from 'vue';
import { DialogEventEmitter } from "../../utils/Dialog/Dialog";
import { DateTime } from 'luxon';
import { TStorage } from '@/utils/Toolbox/TStorage';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import { AppEvents } from '@/utils/AppEvents/AppEvents';


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


const syncingItemsData = computed<Array<IInvoiceResponseUploading>>(() => {
    return StoredInvoices.uploadPendingInfo.value.invoices.map(invoice => {
        return {
            ...invoice,
            date: DateTime.fromISO(invoice.date).toFormat('dd/MM/yyyy')
        }
    });
});


const shareErrorCode = async (invoice: IInvoiceResponseUploading) => {
    const bucket = await TStorage.load('StoredInvoices', {invoices: []});

    const errorData = JSON.stringify({
        invoice,
        error: invoice.uploading.error || undefined,
        date: DateTime.now().toISO(),
        bucket: bucket
    }, null, 2);
    const errorDataBase64 = btoa(errorData);
    Toolbox.share('invoice-' + invoice.id + '-upload-error.json', errorDataBase64);
}
const removeInvoice = async (id: number) => {
    alertController.create({
        header: 'Eliminar documento',
        message: '¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.',
        buttons: [
            {
                text: 'Cancelar',
                role: 'cancel'
            },
            {
                text: 'Eliminar',
                role: 'destructive',
                handler: () => {
                    removeInvoiceFromQueue(id);
                }
            }
        ]
    }).then(alert => alert.present());
}
const retrySyncAll = async () => {
    props.emitter.fire('close');
    await StoredInvoices.uploadPending();
    AppEvents.emit('all:reload');
}

const removeAll = async () => {
    alertController.create({
        header: '¿Borrar todo?',
        message: 'Todas las boletas/facturas que están con estado pendiente de sincronización serán eliminadas. Esta acción no se puede deshacer. ¿Estás seguro de que deseas continuar?',
        buttons: [
            {
                text: 'Sí, borrar',
                role: 'destructive',
                handler: () => {
                    removeAllFromQueue();
                }
            },
            {
                text: 'No, gracias',
                role: 'cancel'
            }
        ]
    }).then((alert) => {
        alert.present();
    })
}

const removeAllFromQueue = async () => {
    await StoredInvoices.removeLocalInvoices();
    StoredInvoices.uploadPendingInfo.value.invoices = [];
    retrySyncAll();
    AppEvents.emit('all:reload');
}
const removeInvoiceFromQueue = async (id: number) => {
    await StoredInvoices.removeLocalInvoice(id);
    StoredInvoices.uploadPendingInfo.value.invoices = StoredInvoices.uploadPendingInfo.value.invoices.filter(invoice => invoice.id !== id);
    if (StoredInvoices.uploadPendingInfo.value.invoices.length === 0) {
        AppEvents.emit('all:reload');
    }
    retrySyncAll();
}

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