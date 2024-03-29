<template>
    <ion-page ref="page">
        <ion-header>
            <ion-toolbar>
                <ion-title v-if="walletType == 'my-wallet'">Mi Billetera</ion-title>
                <ion-title v-if="walletType == 'management'">Billetera de {{userBalance?.user.name}}</ion-title>
                <ion-buttons>
                    <ion-back-button v-if="walletType == 'management'" defaultHref="/management/wallets"></ion-back-button>
                </ion-buttons>
            </ion-toolbar>
            <ion-toolbar>
                <header class="header" style="max-width: 600px;margin: 0 auto;width: 100%;">
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
            <section class="content">
                <br>
                <article class="ion-padding wallet">
                    <ion-label>{{userBalance?.user.name}}</ion-label>
                    <div v-if="!isAdminWallet && !isLoading">
                        <ion-img v-show="userBalance?.totals.balance.type == 'neutral'" :src="CreditCardNeutral" style="width: 100%; margin: 0 auto; filter: drop-shadow(rgba(0, 0, 0, 0.47) 0px 0px 3px);"></ion-img>
                        <ion-img v-show="userBalance?.totals.balance.type == 'positive'" :src="CreditCardPositive" style="width: 100%; margin: 0 auto; filter: drop-shadow(rgba(0, 0, 0, 0.47) 0px 0px 3px);"></ion-img>
                        <ion-img v-show="userBalance?.totals.balance.type == 'negative'" :src="CreditCardNegative" style="width: 100%; margin: 0 auto; filter: drop-shadow(rgba(0, 0, 0, 0.47) 0px 0px 3px);"></ion-img>
                    </div>
                    <ion-img v-if="isAdminWallet" :src="CreditCardAdmin" style="width: 100%; margin: 0 auto; filter: drop-shadow(rgba(0, 0, 0, 0.47) 0px 0px 3px);"></ion-img>
                    
                    <ion-skeleton-text animated style="height: 220px;width: 100%;border-radius: 20px;" v-if="isLoading"></ion-skeleton-text>
                </article>



                <article>
                    <ion-grid class="ion-padding">
                        <ion-row>
                            <ion-col>
                                <ion-skeleton-text v-if="isLoading" animated style="height: 100px; border-radius: 10px;"></ion-skeleton-text>

                                <ion-card style="margin: 0; padding: 0; width: 100%;" v-if="!isLoading">
                                    <ion-card-header>
                                        <ion-card-title :color="userBalance?.totals.balance.color" style="text-wrap: nowrap; font-size: 38px;">S/. {{ userBalance?.totals.balance.amount }}</ion-card-title>
                                        <ion-card-subtitle>Saldo total</ion-card-subtitle>
                                    </ion-card-header>
                                </ion-card>
                            </ion-col>
                        </ion-row>
                        <ion-row>
                            <ion-skeleton-text v-if="isLoading" animated style="height: 200px; border-radius: 10px; margin: 6px"></ion-skeleton-text>

                            <ion-card style="margin: 5px; padding: 0; width: 100%" v-if="!isLoading">
                                <ion-card-content>
                                    <line-chart :height="200" :chart-data="chartData" :options="chartOptions"></line-chart>
                                </ion-card-content>
                            </ion-card>
                        </ion-row>
                        <ion-row  v-if="!isLoading">
                            <ion-col>
                                <ion-card style="margin: 0; padding: 0; width: 100%;">
                                    <ion-card-header>
                                        <ion-card-title color="warning" style="text-wrap: nowrap; font-size: 22px;">S/. {{ userBalance?.petty_cash.reports.pending_reposition.amount.value}}</ion-card-title>
                                        <ion-card-subtitle>PEND. REPOSICIÓN</ion-card-subtitle>
                                    </ion-card-header>
                                    <ion-card-content>
                                        <table style="font-size: 11px; width: 100%;">
                                            <tbody>
                                                <tr>
                                                    <td>Reportes</td>
                                                    <td>{{ userBalance?.petty_cash.reports.pending_reposition.items.length }}</td>
                                                </tr>
                                                <tr>
                                                    <td>Dólares</td>
                                                    <td>$  {{ userBalance?.petty_cash.reports.pending_reposition.currencies.dollars.amount }}</td>
                                                </tr>
                                                <tr>
                                                    <td>Soles</td>
                                                    <td>S/. {{ userBalance?.petty_cash.reports.pending_reposition.currencies.soles.amount }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </ion-card-content>
                                </ion-card>
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


                <ion-list-header  v-if="isAdmin && !isLoading" style="font-size: 15px">Opciones del Administrador</ion-list-header>

                <ion-list :inset="true" v-if="isAdmin && !isLoading">
                    <ion-item button  @click="addCredit">
                        <ion-icon color="success" slot="start" :icon="addCircleOutline"></ion-icon>
                        <ion-label>
                            <h2>Agregar valor a la caja chica</h2>
                        </ion-label>
                    </ion-item>
                </ion-list>

                <ion-list-header style="font-size: 15px"  v-if="!isLoading &&  userBalance?.items.length > 0">Historial de Movimientos</ion-list-header>
                <ion-list :inset="true" v-if="!isLoading">
                    <ion-item v-for="item in userBalance?.items" :key="item.id" @click="openBalance(item)" button>
                        <ion-icon slot="start" :icon="item.icon"></ion-icon>
                        <ion-label>
                            <h2><b>{{item.description}}</b></h2>
                            <p><b>Fecha:</b> {{ item.date }}</p>
                            <p>Saldo: S/. {{ item.balance_here.value }}</p>
                        </ion-label>
                        <ion-note slot="end" :color="item.color">{{item.amount.signal}}S/. {{ item.amount.value }}</ion-note>
                    </ion-item>
                </ion-list>


                <section style="padding: 20px"  v-if="isLoading">
                    <ion-skeleton-text v-for="i in 8" animated style="height: 70px; border-radius: 10px;"></ion-skeleton-text>
                </section>
            </section>


            <section class="visibler">
                <ion-img :src="CreditCardNeutral"></ion-img>
                <ion-img :src="CreditCardPositive"></ion-img>
                <ion-img :src="CreditCardNegative"></ion-img>
                <ion-img :src="CreditCardAdmin"></ion-img>
            </section>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonGrid, IonCard, IonListHeader, IonSkeletonText, IonButtons, IonBackButton, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonNote, IonRow, IonCol, IonToolbar, IonTitle, IonContent, IonProgressBar, IonImg, IonIcon, IonList, IonItem, IonLabel, actionSheetController, alertController, toastController } from '@ionic/vue';
import { computed, onUnmounted, ref } from 'vue';

import { addCircleOutline, alertCircle, cashOutline, chevronBackCircleOutline, chevronForwardCircleOutline, downloadOutline, gitCompareOutline, removeCircleOutline, shareOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import {AppEvents} from '../../utils/AppEvents/AppEvents';
import CreditCardPositive from '&/assets/images/credit-card-positive.svg';
import CreditCardNegative from '&/assets/images/credit-card-negative.svg';
import CreditCardNeutral from '&/assets/images/credit-card-neutral.svg';
import CreditCardAdmin from '&/assets/images/credit-card-admin.svg';

import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { DateTime } from 'luxon';
import Numeral from 'numeral';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { LineChart } from 'vue-chart-3';
import { Dialog } from '@/utils/Dialog/Dialog';
import AddCreditPettyCash from '@/dialogs/AddCreditPettyCash/AddCreditPettyCash.vue';
import { Session } from '@/utils/Session/Session';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import { useRoute } from 'vue-router';
import { onMounted } from 'vue';
const isLoading = ref<boolean>(true);
const router = useRouter();
const page = ref<HTMLElement|null>(null);
const userBalanceData = ref<UserBalance|null>(null);
const selectedYear = ref<number>(DateTime.now().year);
const route = useRoute();

const userId = ref(route.params.id);

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
    })
    
    userBalance.items.sort((a:any, b:any) => {
        return DateTime.fromISO(b.date).toUnixInteger() - DateTime.fromISO(a.date).toUnixInteger();
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
            type: (() => {
                if (userBalanceData.value.totals.balance > 0) return 'positive';
                if (userBalanceData.value.totals.balance < 0) return 'negative';
                return 'neutral';
            })()
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

    userBalance.petty_cash.reports.pending_reposition.currencies.dollars.amount = Numeral(userBalance.petty_cash.reports.pending_reposition.currencies.dollars.amount).format('0,0.00');
    userBalance.petty_cash.reports.pending_reposition.currencies.soles.amount = Numeral(userBalance.petty_cash.reports.pending_reposition.currencies.soles.amount).format('0,0.00');

    if (userBalanceData.value){
        chartData.value.labels = userBalanceData.value.items.map((item) => {
            return DateTime.fromISO(item.date).toUnixInteger()
        });
        chartData.value.datasets[0].data = userBalanceData.value.items.map(d => d.amount)
    };

    return userBalance;
});

const walletType = ref(route.path.includes('my-wallet') ? 'my-wallet' : 'management')

const chartData = ref<any>({
    type: 'line',
    labels: [],
    datasets: [
        {
            fill: false,
            label: 'Amount',
            data: [],
            borderColor: '#3880FF',
            backgroundColor: '#98eaea',
            tension: 0.2
        }
    ]
})

const chartOptions = ref({
    responsive: true,
    plugins: {
        legend: {
            display: false,
            position: 'top',
        },
        title: {
            display: false,
            text: 'Chart.js Doughnut Chart'
        },
        tooltip: {
            callbacks: {
                title: function(context: any) {
                    const time = parseInt(context[0].label.replace(/,/g, ''));
                    return DateTime.fromSeconds(time).toFormat('dd/MM/yyyy HH:mm');
                },
                label: function(context:any) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += '$' + Toolbox.moneyFormat(context.raw);
                    }
                    return label;
                }
            }
        }
    },
    scales: {
        x: {
            type: 'linear',
            grid: {
                display: true,
                lineWidth: 1,
                drawBorder: false,
                zeroLineColor:'transparent'
            },
            ticks: {
                display: true,
                callback: function(value: any, index: any, values: any) {
                    return DateTime.fromSeconds(value).toFormat('dd/MM');
                }
            },
            
        },
        y: {
            beginAtZero: true,
            grid: {
                lineWidth: 1,
                drawBorder: false
            },
            ticks: {
                display: true
            }
        }
    },
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
        receipt_image_url: string|null;
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
            type: 'positive'| 'negative' | 'neutral'
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
        receipt_image_url: string|null;
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
        };
    };
}
const isAdmin = ref(false);


const isAdminCheck = async () => {
    const currentSession = await Session.getCurrentSession();
    if (!currentSession){
        return;
    };

    isAdmin.value = currentSession.roles().includes("admin");
}


const isAdminWallet = computed(() => {
    if (walletType.value == 'management'){
        return false;
    }else{
        return isAdmin.value;
    }
})

const addCredit = () => {
    Dialog.show(AddCreditPettyCash, {
        onLoaded($this) {
            $this.on('created', (event:any) => {
                loadUserBalanceYear();
                AppEvents.emit('all:reload');
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
    if (walletType.value == 'my-wallet'){
        const response = await RequestAPI.get('/balance/me/years/' + selectedYear.value);
        userBalanceData.value = response;
        isLoading.value = false;
        return;
    }else{
        const response = await RequestAPI.get('/management/balances/users/' + userId.value + '/years/' + selectedYear.value);
        userBalanceData.value = response;
        isLoading.value = false;
        return;
    }
}

const showBalanceReceiptImage = async (balance: UserBalanceComputed['items'][0]) => {
    RequestAPI.get('/balances/' + balance.id + "/receipt-image").then((response) => {
        const imageBase64 = "data:image/png;base64," + response.image;

        const filename = `Voucher ${balance.description}.png`;

        if (Capacitor.isNativePlatform()){
            Toolbox.openNative(filename, response.image);
        }else{
            //Create blob file from base64 image:
            const byteString = atob(imageBase64.split(',')[1]);
            const mimeString = imageBase64.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const dw = new DataView(ab);
            for (let i = 0; i < byteString.length; i++) {
                dw.setUint8(i, byteString.charCodeAt(i));
            }
            const blob = new Blob([ab], { type: mimeString });
            
            let link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

    })
}

const openBalance = async (balance: UserBalanceComputed['items'][0]) => {
    let buttons = [
        {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
                
            }
        }
    ]

    if (balance.receipt_image_url){
        buttons = [
            {
                text: 'Ver voucher de depósito',
                role: 'ok',
                handler: () => {
                    showBalanceReceiptImage(balance)
                }
            },
            ...buttons
        ]
    }

    if (balance.report_id){
        buttons = [
            {
                text: 'Abrir reporte',
                role: 'ok',
                handler: () => {
                    router.push(`/reports/${balance.report_id}`);
                }
            },
            ...buttons
        ]
    }

    if (balance.model == 'Direct' && isAdmin){
        buttons = [            
            ...buttons,
            {
                text: 'Eliminar depósito',
                role: 'destructive',
                handler: () => {
                    isLoading.value = true;
                    RequestAPI.delete('/balances/' + balance.id).then((response) => {
                        loadUserBalanceYear();
                        AppEvents.emit('all:reload');
                        toastController.create({
                            message: '✅ Depósito eliminado con éxito',
                            duration: 2000
                        }).then((toast) => {
                            toast.present();
                        })
                    }).catch((error) => {
                        alertController.create({
                            header: 'Oops...',
                            message: error.response.message,
                            buttons: ['OK']
                        }).then((alert) => {
                            alert.present();
                        });
                    }).finally(() => {
                        isLoading.value = false;
                    })
                }
            },
        ]
    }


    await actionSheetController.create({
        header: 'Opciones',
        buttons: buttons
    }).then((actionSheet) => {
        actionSheet.present();
    })
}

isAdminCheck();

onMounted(() => {
    loadUserBalanceYear();

    const callbackId = AppEvents.on('all:reload', () => {
        loadUserBalanceYear();
    })

    onUnmounted(() => {
        AppEvents.off('all:reload', callbackId);
    })
})

</script>

<style scoped lang="scss">

ion-content {
    --background: #f2f3f7;
}


.visibler{
    position: absolute; z-index: -1; visibility: hidden;
    > ion-img{
        position: absolute;
        z-index: -1;
        width: 30px;
        height: 30px;
    }
}

.content{
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
}
.wallet{
    position: relative;
    max-width: 400px;
    margin: 0 auto;
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