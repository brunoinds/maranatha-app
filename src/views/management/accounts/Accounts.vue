<template>
    <article class="content">
        <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>

        <!-- <ion-button @click="open">Open</ion-button> -->

        <ion-list v-if="!isLoading"  :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
            <ion-item v-for="account in accountsData" :key="account.id" button @click="updateUser(account)">
                <ion-label>
                    <h2><b>{{ account.name  }}</b></h2>
                    <h3>@{{  account.username }}</h3>
                    <p>{{ account.email }}</p>
                </ion-label>
            </ion-item>
        </ion-list>
    </article>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonButton, IonContent, IonImg, IonAvatar,IonBackButton, IonProgressBar, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController } from '@ionic/vue';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { computed, onMounted, ref } from 'vue';
import { Dialog } from '@/utils/Dialog/Dialog';
import EditUser from '@/dialogs/EditUser/EditUser.vue';
import { Viewport } from '@/utils/Viewport/Viewport';
import { addOutline, albumsOutline, alertCircleOutline, checkmarkCircleOutline, close, logIn } from 'ionicons/icons';
import { IReport } from '@/interfaces/ReportInterfaces';
import { useRouter } from 'vue-router';
import { useManagementHtml } from '@/views/management/management';
import KeyValueEditor from '@/dialogs/KeyValueEditor/KeyValueEditor.vue';
const accountsData = ref<any>(null);
const isLoading = ref<boolean>(true);
const router = useRouter();
const page = ref<HTMLElement|null>(null);

const loadAccounts = async () => {
    isLoading.value = true;
    accountsData.value = (await RequestAPI.get('/users')).filter((account:any) => account.username != 'admin');
    isLoading.value = false;
}

const updateUser = (account) => {
    Dialog.show(EditUser, {
        onLoaded($this) {
            $this.on('updated', (event:any) => {
                loadAccounts()
            })
            $this.on('deleted', (event:any) => {
                loadAccounts()
            })
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        },
        props: {
            account
        }
    })
}

const open = () => {
    Dialog.show(KeyValueEditor, {
        props: {
            metadata: {}
        },
        onLoaded($this) {
            
        },
    })
}

loadAccounts();


onMounted(() => {
    const info = useManagementHtml();
    page.value = info.page.value;
})
</script>

<style scoped lang="scss">

.content{
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
}

</style>