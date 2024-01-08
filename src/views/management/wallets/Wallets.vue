<template>
    <article class="content">
        <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
        
        <ion-list :inset="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
            <ion-item v-for="wallet in balancesData?.balances" :key="wallet.id" button @click="openWallet(wallet.user.id)">
                <ion-label>
                    <h2><b>{{ wallet.user.name  }}</b></h2>
                    <h3>@{{  wallet.user.username }}</h3>
                </ion-label>
                <section class="notes">
                    <div>
                        <span>Saldo</span>
                        <ion-label :color="moneyColor(wallet.balance.petty_cash.balance)">{{moneySignal(wallet.balance.petty_cash.balance)}}{{ Toolbox.moneyFormat(wallet.balance.petty_cash.balance, EMoneyType.PEN) }}</ion-label>
                    </div>
                    <div v-if="wallet.balance.petty_cash.reports.pending_reposition.amount > 0">
                        <span>Pend. Repo.</span>
                        <ion-label color="tertiary">{{ Toolbox.moneyFormat(wallet.balance.petty_cash.reports.pending_reposition.amount, EMoneyType.PEN) }}</ion-label>
                    </div>
                    <div v-if="wallet.balance.petty_cash.reports.pending_reposition.amount > 0">
                        <span>Uso</span>
                        <ion-label :color="pittyCashColor(wallet.balance.petty_cash.usage_percentage)">{{ wallet.balance.petty_cash.usage_percentage.toFixed(0) }}%</ion-label>
                    </div>
                </section>
            </ion-item>
        </ion-list>
    </article>
</template>

<styles lang="scss" scoped>
.notes {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    > div{
        display: flex;
        flex-direction: column;
        align-items: center;
        border-left: 1px solid var(--border-color);
        margin-left: 5px;
        padding-left: 5px;
        &:nth-child(1){
            border-left: unset;
            margin-left: unset;
            padding-left: unset;
        }
    }
    span {
        font-size: 12px;
        color: var(--ion-color-medium);
    }
    ion-label {
        font-size: 14px;
        font-weight: bold;
    }
}
</styles>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonImg, IonAvatar,IonBackButton, IonProgressBar, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController } from '@ionic/vue';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { computed, ref } from 'vue';
import { Dialog } from '@/utils/Dialog/Dialog';
import EditUser from '@/dialogs/EditUser/EditUser.vue';
import { Viewport } from '@/utils/Viewport/Viewport';
import { addOutline, albumsOutline, alertCircleOutline, checkmarkCircleOutline, close, logIn } from 'ionicons/icons';
import { EMoneyType, IReport } from '@/interfaces/ReportInterfaces';
import { useRouter } from 'vue-router';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
const balancesData = ref<any>(null);
const isLoading = ref<boolean>(true);
const router = useRouter();
const page = ref<HTMLElement|null>(null);

const loadBalances = async () => {
    isLoading.value = true;
    balancesData.value = (await RequestAPI.get('/management/balances/users', {
        year: 2024
    }));
    isLoading.value = false;
}
loadBalances()



const moneyColor = (money: number) => {
    if(money < 0) return 'danger';
    if(money > 0) return 'success';
    return 'medium';
}
const moneySignal = (money: number) => {
    if(money < 0) return '-';
    if(money > 0) return '+';
    return '';
}
const pittyCashColor = (percentage: number) => {
    if(percentage > 80 && percentage <100) return 'warning';
    if(percentage >= 100) return 'danger';
    return 'primary';
}
const openWallet = (userId: string) => {
    router.push(`/wallets/users/${userId}`);
}
</script>

<style scoped lang="scss">

.content{
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
}

</style>