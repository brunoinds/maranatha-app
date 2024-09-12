<template>
    <section class="content">
        <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>

        

        <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
            <ion-item v-for="outcome in outcomesUI" button @click="openWarehouseOutcomeRequest(outcome)">
                <ion-label>
                    <h2><b>Pedido #00{{ outcome.id }}</b></h2>
                    <h3><b>{{ outcome.user?.name }}</b></h3>
                    <p>{{ outcome.date_ago }}</p>
                    <p><b>{{ outcome.products_count }} ítems solicitados</b></p>
                </ion-label>

                <ion-button size="default" fill="clear" v-if="outcome.chat.unseen_messages_count" :disabled="true">
                    <ion-icon slot="start" :icon="chatbubbleEllipsesOutline"></ion-icon>
                    {{ outcome.chat.unseen_messages_count }}
                </ion-button>
                
                <OutcomeRequestStatusChip slot="end" :request="outcome" :view-mode="'Dispacher'" />
            </ion-item>
        </ion-list>
    </section>


    <ion-fab slot="fixed" vertical="bottom" horizontal="end" :edge="false">
        <ion-fab-button @click="openQrCodeScanner('Dispacher')">
            <ion-icon :icon="qrCodeOutline"></ion-icon>
        </ion-fab-button>
        <br>
        <ion-fab-button @click="createWarehouseOutcomeRequest">
            <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
    </ion-fab>
</template>


<script setup lang="ts">

import { IonList, IonItem, IonLabel, IonFab, IonFabButton, IonIcon, IonButton, IonProgressBar } from '@ionic/vue';
import { PropType, computed, onMounted, onUnmounted, ref } from 'vue';
import { IWarehouse, IWarehouseOutcome, IWarehouseOutcomeRequest } from '@/interfaces/InventoryInterfaces';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import { addOutline, chatbubbleEllipsesOutline, qrCodeOutline } from 'ionicons/icons';
import { Dialog } from '@/utils/Dialog/Dialog';
import CreateInventoryWarehouseOutcome from '@/dialogs/CreateInventoryWarehouseOutcome/CreateInventoryWarehouseOutcome.vue';
import EditInventoryWarehouseOutcome from '@/dialogs/EditInventoryWarehouseOutcome/EditInventoryWarehouseOutcome.vue';
import CreateInventoryWarehouseOutcomeRequest from '@/dialogs/CreateInventoryWarehouseOutcomeRequest/CreateInventoryWarehouseOutcomeRequest.vue';
import { useRouter } from 'vue-router';
import  OutcomeRequestStatusChip  from '@/components/OutcomeRequestStatusChip/OutcomeRequestStatusChip.vue';
import TimeAgo from 'javascript-time-ago';
import es from 'javascript-time-ago/locale/es';
import { IUser } from '@/interfaces/UserInterfaces';
import { Session } from '@/utils/Session/Session';
import { Viewport } from '@/utils/Viewport/Viewport';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { QRCodeScanner } from '@/dialogs/QRCodeScanner/QRCodeScanner';

TimeAgo.addLocale(es);
const timeAgo = new TimeAgo('es-PE');

const router = useRouter();

const isLoading = ref<boolean>(false);
const props = defineProps({
    warehouse: {
        type: Object as PropType<IWarehouse>,
        required: true
    }
});

const outcomesData = ref<IWarehouseOutcomeRequest[]>([]);
const usersData = ref<IUser[]>([]);

const outcomesUI = computed(() => {
    return outcomesData.value.map((outcome) => {
        return {
            ...outcome,
            date_ago: timeAgo.format(new Date(outcome.requested_at || outcome.created_at)),
            user: usersData.value.find(user => user.id === outcome.user_id),
            products_count: outcome.requested_products.reduce((acc, product) => acc + product.quantity, 0),
            chat: {
                unseen_messages_count: outcome.messages.filter(message => message.user_id != Session.getCurrentSessionSync()?.id() && message.read_at == null).length
            },
            original: outcome
        }
    }).sort((a, b) => b.id - a.id);
});

const loadOutcomes = async () => {
    isLoading.value = true;
    const response = await RequestAPI.get(`/inventory/warehouses/${props.warehouse.id}/outcome-requests`);
    usersData.value = await RequestAPI.get('/users');
    outcomesData.value = response;
    isLoading.value = false;
}

const openQrCodeScanner = (viewModeAs:string) => {
    QRCodeScanner.open().onScan().then((content) => {
        if (content.includes('app/inventory/outcome-requests/')){
            const id = content.split('?view-mode')[0].split('/').pop();
            router.push(`/inventory/outcome-requests/${id}?view-mode=${viewModeAs}`);
        }
    })
}


const createWarehouseOutcomeRequest = () => {
    Dialog.show(CreateInventoryWarehouseOutcomeRequest, {
        props: {
            warehouseId: props.warehouse.id
        },
        onLoaded($this) {
            $this.on('created', (event:any) => {
                AppEvents.emit('inventory:reload');
            })
        },
        modalControllerOptions: {
            //presentingElement: props.page,
            //showBackdrop: true,
        }
    })
}
const openWarehouseOutcomeRequest = (warehouseOutcomeRequest: IWarehouseOutcomeRequest) => {
    router.push(`/inventory/outcome-requests/${warehouseOutcomeRequest.id}?view-mode=Dispacher`);
}
onMounted(() => {
    loadOutcomes();
    const callbackId = AppEvents.on('inventory:reload', () => {
        loadOutcomes();
    })
    onUnmounted(() => {
        AppEvents.off('inventory:reload', callbackId);
    })
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

