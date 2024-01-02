<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-title>Saldo</ion-title>
            </ion-toolbar>
            <ion-toolbar>
                <header class="header">
                    <button @click="goPreviousYear">
                        <ion-icon :icon="chevronBackCircleOutline"></ion-icon>
                    </button>
                    <h1>{{selectedYear}}</h1>
                    <button @click="goNextYear">
                        <ion-icon :icon="chevronForwardCircleOutline"></ion-icon>
                    </button>
                </header>
                <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <button @click="addCredit">Add Credit</button>
            <article class="ion-padding wallet">
                <ion-label>{{userBalance?.user.name}}</ion-label>
                <ion-img :src="CreditCard" style="width: 100%; margin: 0 auto; filter: drop-shadow(rgba(0, 0, 0, 0.47) 0px 0px 3px);"></ion-img>
            </article>
            <article>
                <ion-grid class="ion-padding">
                    <ion-row>
                        <ion-col>
                            <ion-card style="margin: 0; padding: 0; width: 100%;">
                                <ion-card-header>
                                    <ion-card-title :color="userBalance?.totals.balance.color" style="text-wrap: nowrap; font-size: 38px;">S/. {{ userBalance?.totals.balance.amount }}</ion-card-title>
                                    <ion-card-subtitle>Saldo total</ion-card-subtitle>
                                </ion-card-header>
                            </ion-card>
                        </ion-col>
                    </ion-row>
                    <ion-row>
                        <ion-col>
                            <ion-row>
                                <ion-card style="margin: 0; padding: 0; width: 100%;">
                                    <ion-card-header>
                                        <ion-card-title  color="warning" style="text-wrap: nowrap; font-size: 22px;">S/. {{ userBalance?.petty_cash.reports.pending_reposition.amount.value}}</ion-card-title>
                                        <ion-card-subtitle>PEND. REPOSICIÓN</ion-card-subtitle>
                                    </ion-card-header>
                                </ion-card>
                            </ion-row>
                            <br>
                            <ion-row>
                                <ion-card style="margin: 0; padding: 0; width: 100%">
                                    <ion-card-content>
                                        <line-chart :height="200" :chart-data="chartData" :options="chartOptions"></line-chart>
                                    </ion-card-content>
                                </ion-card>
                            </ion-row>
                        </ion-col>
                        <ion-col>
                            <ion-card style="margin: 0; padding: 0;">
                                <ion-card-header>
                                    <ion-card-title color="medium" style="text-wrap: nowrap; font-size: 22px;">S/. {{userBalance?.petty_cash.reports.not_approved.amount.value}}</ion-card-title>
                                    <ion-card-subtitle>Gastos Aún No Aprob.</ion-card-subtitle>
                                    <br>
                                    <ion-card-title color="primary" style="text-wrap: nowrap; font-size: 22px;">S/. {{userBalance?.petty_cash.given_amount}}</ion-card-title>
                                    <ion-card-subtitle>Caja Chica</ion-card-subtitle>
                                </ion-card-header>
                                <ion-card-content>
                                    <table style="font-size: 11px; width: 100%;">
                                        <tbody>
                                            <tr>
                                                <td>Dólares</td>
                                                <td>$  {{ userBalance?.petty_cash.reports.not_approved.currencies.dollars.amount }}</td>
                                            </tr>
                                            <tr>
                                                <td>Soles</td>
                                                <td>S/. {{ userBalance?.petty_cash.reports.not_approved.currencies.soles.amount }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </ion-card-content>
                            </ion-card>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </article>

            

            <ion-list :inset="true" v-if="userBalance && userBalance.petty_cash.reports.pending_reposition.items.length > 0">
                <ion-item :detail="true" button>
                    <ion-icon color="warning" slot="start" :icon="alertCircle"></ion-icon>
                    <ion-label>
                        <h2>{{userBalance.petty_cash.reports.pending_reposition.items.length}} reposiciones pendientes</h2>
                        <p>Valor pendiente: S/. {{ userBalance?.petty_cash.reports.pending_reposition.amount.value}}</p>
                    </ion-label>
                </ion-item>
            </ion-list>


            <ion-list-header style="font-size: 15px">Opciones del Administrador</ion-list-header>

            <ion-list :inset="true">
                <ion-item button>
                    <ion-icon color="success" slot="start" :icon="addCircleOutline"></ion-icon>
                    <ion-label>
                        <h2>Agregar valor a la caja chica</h2>
                    </ion-label>
                </ion-item>
                <ion-item button>
                    <ion-icon color="danger" slot="start" :icon="removeCircleOutline"></ion-icon>
                    <ion-label>
                        <h2>Retirar valor de la caja chica</h2>
                    </ion-label>
                </ion-item>
            </ion-list>

            <ion-list-header style="font-size: 15px">Historial de Movimientos</ion-list-header>
            <ion-list :inset="true">
                <ion-item v-for="item in userBalance?.items" :key="item.id">
                    <ion-icon slot="start" :icon="item.icon"></ion-icon>
                    <ion-label>
                        <h2><b>{{item.description}}</b></h2>
                        <p><b>Fecha:</b> {{ item.date }}</p>
                        <p>Saldo: S/. {{ item.balance_here.value }}</p>
                    </ion-label>
                    <ion-note slot="end" :color="item.color">{{item.amount.signal}}S/. {{ item.amount.value }}</ion-note>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonGrid, IonCard, IonListHeader, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonNote, IonRow, IonCol, IonToolbar, IonTitle, IonContent, IonProgressBar, IonImg, IonIcon, IonList, IonItem, IonLabel } from '@ionic/vue';
import { computed, ref } from 'vue';

import { addCircleOutline, alertCircle, cashOutline, chevronBackCircleOutline, chevronForwardCircleOutline, downloadOutline, gitCompareOutline, removeCircleOutline, shareOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import {AppEvents} from '../../utils/AppEvents/AppEvents';
import CreditCard from '&/assets/images/credit-card.svg';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { DateTime } from 'luxon';
import Numeral from 'numeral';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { LineChart } from 'vue-chart-3';
import { Dialog } from '@/utils/Dialog/Dialog';
import AddCreditPettyCash from '@/dialogs/AddCreditPettyCash/AddCreditPettyCash.vue';

const isLoading = ref<boolean>(true);
const router = useRouter();
const page = ref<HTMLElement|null>(null);
const userBalanceData = ref<UserBalance|null>(null);
const selectedYear = ref<number>(DateTime.now().year);

const userBalance = computed<UserBalanceComputed|null>(() => {
    let userBalance:any|UserBalanceComputed = JSON.parse(JSON.stringify(userBalanceData.value)) as unknown as UserBalance;
    if (!userBalanceData.value) return null;

    userBalance.items = userBalanceData.value.items.map((item: any) => {
        item = JSON.parse(JSON.stringify(item));
        item.date = DateTime.fromISO(item.date).toFormat('dd/MM/yyyy HH:mm');
        item.icon = (() => {
            if (item.model === 'Direct'){
                if (item.type === 'Credit') return downloadOutline;
                if (item.type === 'Debit') return shareOutline;
            }else if (item.model === 'Restitution'){
                return gitCompareOutline;
            }else if (item.model === 'Expense'){
                return cashOutline;
            }else{
                return alertCircle;
            }
        })();
        item.color = (() => {
            if (item.model === 'Direct'){
                if (item.type === 'Credit') return 'success';
                if (item.type === 'Debit') return 'danger';
            }else if (item.model === 'Restitution'){
                return 'success';
            }else if (item.model === 'Expense'){
                return 'danger';
            }else{
                return 'warning';
            }
        })();
        item.amount = {
            signal: item.type === 'Credit' ? '+' : '-',
            value: Numeral(item.amount).format('0,0.00'),
            color: item.color,
        }
        item.balance_here = {
            signal: item.balance_here > 0 ? '+' : '-',
            value: Numeral(item.balance_here).format('0,0.00'),
            color: item.balance_here > 0 ? 'success' : 'danger',
        }
        return item;
    });

    userBalance.totals = {
        credit: {
            signal: userBalanceData.value.totals.credit > 0 ? '+' : '-',
            amount: Numeral(userBalanceData.value.totals.credit).format('0,0.00'),
            color: userBalanceData.value.totals.credit > 0 ? 'success' : 'danger',
        },
        debit: {
            signal: userBalanceData.value.totals.debit > 0 ? '+' : '-',
            amount: Numeral(userBalanceData.value.totals.debit).format('0,0.00'),
            color: userBalanceData.value.totals.debit > 0 ? 'success' : 'danger',
        },
        balance: {
            signal: userBalanceData.value.totals.balance > 0 ? '+' : '-',
            amount: Numeral(userBalanceData.value.totals.balance).format('0,0.00'),
            color: userBalanceData.value.totals.balance > 0 ? 'success' : 'danger',
        },
    }
    userBalance.petty_cash.given_amount = Numeral(userBalance.petty_cash.given_amount).format('0,0.00');

    userBalance.petty_cash.reports.not_approved.amount = {
        signal: userBalance.petty_cash.reports.not_approved.amount > 0 ? '+' : '-',
        value: Numeral(userBalance.petty_cash.reports.not_approved.amount).format('0,0.00'),
        color: userBalance.petty_cash.reports.not_approved.amount > 0 ? 'success' : 'danger',
    }
    userBalance.petty_cash.reports.pending_reposition.amount = {
        signal: userBalance.petty_cash.reports.pending_reposition.amount > 0 ? '+' : '-',
        value: Numeral(userBalance.petty_cash.reports.pending_reposition.amount).format('0,0.00'),
        color: userBalance.petty_cash.reports.pending_reposition.amount > 0 ? 'success' : 'danger',
    }
    userBalance.petty_cash.reports.not_approved.currencies.dollars.amount = Numeral(userBalance.petty_cash.reports.not_approved.currencies.dollars.amount).format('0,0.00');
    userBalance.petty_cash.reports.not_approved.currencies.soles.amount = Numeral(userBalance.petty_cash.reports.not_approved.currencies.soles.amount).format('0,0.00');


    if (userBalanceData.value){
        chartData.value.labels = userBalanceData.value.items.map((item) => {
            return DateTime.fromISO(item.date).toUnixInteger()
        });
        chartData.value.datasets[0].data = userBalanceData.value.items.map(d => d.amount)
    };

    return userBalance;
});

const chartData = ref<any>({
    type: 'line',
    labels: [],
    datasets: [
        {
            fill: false,
            label: 'Amount',
            data: [],
            borderColor: '#4bc0c0',
            backgroundColor: '#98eaea',
            tension: 0.5
        }
    ]
})

const chartOptions = ref({
    scales: {
        x: {
            type: 'linear',
            grid: {
                display: false,
                lineWidth: 0,
                drawBorder: false,
                zeroLineColor:'transparent'
            },
            ticks: {
                display: false
            }
        },
        y: {
            beginAtZero: true,
            grid: {
                lineWidth: 0,
                color: '#FF7376',
                drawBorder: false
            },
            ticks: {
                display: false
            }
        }
    },
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            callbacks: {
                title: function(context: any) {
                    const time = parseInt(context[0].label.replace(/,/g, ''));
                    return DateTime.fromSeconds(time).toFormat('dd/MM/yyyy HH:mm');
                },
            }
        }
    }
})



interface UserBalance{
    user: {
        id: number;
        name: string;
        username: string;
    },
    totals: {
        credit: number;
        debit: number;
        balance: number;
    };
    items: Array<{
        id: number;
        description: string;
        ticket_number: string|null;
        report_id: number|null;
        date: string;
        type: string;
        model: string;
        amount: number;
        balance_here: number;
    }>;
    petty_cash: {
        given_amount: number;
        usage_percentage: number;
        balance: number;
        reports: {
            not_approved: {
                currencies: {
                    dollars: {
                        amount: number;
                        count: number;
                    };
                    soles: {
                        amount: number;
                        count: number;
                    };
                };
                items: Array<{
                    id: number;
                    title: string;
                    date: string;
                    amount: number;
                    money_type: string;
                }>;
                amount: number;
            };
            pending_reposition: {
                items: Array<any>;
                amount: number;
            };
        };
    };
}
interface UserBalanceComputed{
    user: {
        id: number;
        name: string;
        username: string;
    },
    totals: {
        credit: {
            signal: string;
            amount: string;
            color: string;
        };
        debit: {
            signal: string;
            amount: string;
            color: string;
        };
        balance: {
            signal: string;
            amount: string;
            color: string;
        };
    };
    items: Array<{
        id: number;
        description: string;
        ticket_number: string|null;
        report_id: number|null;
        date: string;
        type: string;
        model: string;
        amount: {
            signal: string;
            value: string;
            color: string;
        };
        balance_here: {
            signal: string;
            value: string;
            color: string;
        };
        icon: any;
        color: string;
    }>;
    petty_cash: {
        given_amount: string;
        usage_percentage: number;
        balance: number;
        reports: {
            not_approved: {
                currencies: {
                    dollars: {
                        amount: string;
                        count: number;
                    };
                    soles: {
                        amount: string;
                        count: number;
                    };
                };
                items: Array<{
                    id: number;
                    title: string;
                    date: string;
                    amount: number;
                    money_type: string;
                }>;
                amount: {
                    signal: string;
                    value: string;
                    color: string;
                };
            };
            pending_reposition: {
                items: Array<{
                    id: number;
                    title: string;
                    date: string;
                    amount: number;
                    money_type: string;
                }>;
                amount: {
                    signal: string;
                    value: string;
                    color: string;
                };
            };
        };
    };
}
AppEvents.on('balances:reload', () => {
})


const addCredit = () => {
    Dialog.show(AddCreditPettyCash, {
        onLoaded($this) {
            $this.on('created', (event:any) => {
                loadUserBalanceYear()
            })
        },
        modalControllerOptions: {
            presentingElement: page,
            showBackdrop: true,
        },
        props: {
            userId: userBalanceData.value?.user.id
        }
    })
}

const goPreviousYear = () => {
    selectedYear.value = selectedYear.value - 1;
    loadUserBalanceYear();
}
const goNextYear = () => {
    selectedYear.value = selectedYear.value + 1;
    loadUserBalanceYear();
}

const loadUserBalanceYear = async () => {
    isLoading.value = true;
    const response = await RequestAPI.get('/balance/me/years/' + selectedYear.value);
    userBalanceData.value = response;
    isLoading.value = false;
}

loadUserBalanceYear();
</script>

<style scoped lang="scss">

ion-content {
    --background: #f2f3f7;
}

.wallet{
    position: relative;
    > ion-label{
        position: absolute;
        z-index: 1000;
        bottom: 96px;
        left: 35px;
        width: 100%;
        font-size: 16px;
        font-weight: bold;
        text-transform: uppercase;
        color: #fff;
        text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.47);
    }
}

.header{
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: transparent;
    padding: 8px 14px;
    > h1{
        font-size: 13px;
        font-weight: 600;
        margin: 0;
    }
    > button{
        background-color: transparent;
        border: none;
        color: var(--main-color);
        font-size: 20px;
        padding: 0px;
        &[disabled]{
            filter:grayscale(1);
            &:active{
                opacity: 1;
            }
        }
        &:active{
            opacity: 0.2;
        }
    }
}
</style>