<template>
    <article>
        <br>

        <main>
            <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>

            <ion-grid v-if="indicators">
                <ion-row>
                    <ion-col>
                        <ion-card class="card-amount" style="height: 180px;">
                            <ion-card-header>
                                <ion-card-subtitle>Gastos Totales</ion-card-subtitle>
                            </ion-card-header>
                            <ion-card-content>
                                <ion-grid name="content">
                                    <ion-row name="amount-area">
                                        <ion-card-title name="amount" value="$" style="color: rgb(54, 162, 235); font-size: 60px">{{ Toolbox.moneyFormat(indicators.spendings.total) }}</ion-card-title>
                                    </ion-row>
                                </ion-grid>
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                    <ion-col>
                        <ion-card class="card-amount" style="height: 180px;">
                            <ion-card-header>
                                <ion-card-subtitle>Pendiente Aprobación</ion-card-subtitle>
                            </ion-card-header>
                            <ion-card-content >
                                <ion-grid name="content">
                                    <ion-row name="amount-area">
                                        <ion-card-title name="amount" value="$" color="warning" style="font-size: 50px" >{{ Toolbox.moneyFormat(indicators.reports.byStatus[EReportStatus.Submitted].amount) }}</ion-card-title>
                                    </ion-row>
                                    <ion-row>
                                        <ion-label name="note">{{ indicators.reports.byStatus[EReportStatus.Submitted].count }} reportes</ion-label>
                                    </ion-row>
                                </ion-grid>
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                    <ion-col v-if="false">
                        <ion-card class="card-amount" style="height: 180px;">
                            <ion-card-header>
                                <ion-card-subtitle>Borradores</ion-card-subtitle>
                            </ion-card-header>
                            <ion-card-content >
                                <ion-grid name="content">
                                    <ion-row name="amount-area">
                                        <ion-card-title name="amount" value="$" color="medium" style="font-size: 50px" >{{ Toolbox.moneyFormat(indicators.reports.byStatus[EReportStatus.Draft].amount) }}</ion-card-title>
                                    </ion-row>
                                    <ion-row>
                                        <ion-label name="note">{{ indicators.reports.byStatus[EReportStatus.Draft].count }} reportes</ion-label>
                                    </ion-row>
                                </ion-grid>
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                    <ion-col  v-if="false">
                        <ion-card class="card-amount" style="height: 180px;">
                            <ion-card-header>
                                <ion-card-subtitle>Rechazados</ion-card-subtitle>
                            </ion-card-header>
                            <ion-card-content >
                                <ion-grid name="content">
                                    <ion-row name="amount-area">
                                        <ion-card-title name="amount" value="$" color="medium" style="font-size: 50px" >{{ Toolbox.moneyFormat(indicators.reports.byStatus[EReportStatus.Rejected].amount) }}</ion-card-title>
                                    </ion-row>
                                    <ion-row>
                                        <ion-label name="note">{{ indicators.reports.byStatus[EReportStatus.Rejected].count }} reportes</ion-label>
                                    </ion-row>
                                </ion-grid>
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                    <ion-col>
                        <ion-card class="card-amount" style="height: 180px;">
                            <ion-card-header>
                                <ion-card-subtitle>Pendiente Reembolso</ion-card-subtitle>
                            </ion-card-header>
                            <ion-card-content >
                                <ion-grid name="content">
                                    <ion-row name="amount-area">
                                        <ion-card-title name="amount" value="$" color="tertiary" style="font-size: 50px">{{ Toolbox.moneyFormat(indicators.reports.pendingRestitution.amount) }}</ion-card-title>
                                    </ion-row>
                                    <ion-row>
                                        <ion-label name="note">{{ indicators.reports.pendingRestitution.count }} reportes</ion-label>
                                    </ion-row>
                                </ion-grid>
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        <ion-card class="card-amount" style="height: 180px;">
                            <ion-card-header>
                                <ion-card-subtitle>Promédio Saldos</ion-card-subtitle>
                            </ion-card-header>
                            <ion-card-content >
                                <ion-grid name="content">
                                    <ion-row name="amount-area">
                                        <ion-card-title name="amount" value="S/." color="success" style="font-size: 50px">{{ Toolbox.moneyFormat(indicators.wallets.pettyCash.balance.average) }}</ion-card-title>
                                    </ion-row>
                                </ion-grid>
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                    <ion-col>
                        <ion-card class="card-amount" style="height: 180px;">
                            <ion-card-header>
                                <ion-card-subtitle>Promédio Uso Caja Chica</ion-card-subtitle>
                            </ion-card-header>
                            <ion-card-content>
                                <ion-grid name="content">
                                    <ion-row name="amount-area">
                                        <ion-card-title name="amount" color="secondary" style="font-size: 60px;">{{ indicators.wallets.pettyCash.usagePercentage.average.toFixed(1) }}%</ion-card-title>
                                    </ion-row>
                                </ion-grid>
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                    <ion-col>
                        <ion-card class="card-amount" style="height: 180px;">
                            <ion-card-header>
                                <ion-card-subtitle>Cajas Chicas en Alerta</ion-card-subtitle>
                            </ion-card-header>
                            <ion-card-content >
                                <ion-grid name="content">
                                    <ion-row name="amount-area">
                                        <ion-card-title name="amount" color="danger" style="font-size: 65px;">{{ indicators.wallets.pettyCash.alerts.count }}</ion-card-title>
                                    </ion-row>
                                </ion-grid>
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                    <ion-col>
                        <ion-card class="card-amount" style="height: 180px;">
                            <ion-card-header>
                                <ion-card-subtitle>Distribución en Caja Chica</ion-card-subtitle>
                            </ion-card-header>
                            <ion-card-content >
                                <ion-grid name="content">
                                    <ion-row name="amount-area">
                                        <ion-card-title name="amount" value="S/." style="font-size: 50px">{{ Toolbox.moneyFormat(indicators.wallets.pettyCash.givenAmount.sum) }}</ion-card-title>
                                    </ion-row>
                                </ion-grid>
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                </ion-row>

                <ion-row>
                    <ion-col>
                        <ion-card class="card-amount" style="height: 180px;">
                            <ion-card-header>
                                <ion-card-subtitle style="font-size: 9px">Tiempo Promedio Envío y Reembolso</ion-card-subtitle>
                            </ion-card-header>
                            <ion-card-content >
                                <ion-grid name="content">
                                    <ion-row name="amount-area">
                                        <ion-card-title name="amount" style="font-size: 65px;">{{ indicators.reports.time.averageHoursBetweenSubmittedAndRestituted.toFixed(1) }}</ion-card-title>
                                    </ion-row>
                                    <ion-row>
                                        <ion-note name="note">horas</ion-note>
                                    </ion-row>
                                </ion-grid>
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                    <ion-col>
                        <ion-card class="card-amount" style="height: 180px;">
                            <ion-card-header>
                                <ion-card-subtitle style="font-size: 9px">Tiempo Promedio Envío y Aprobación</ion-card-subtitle>
                            </ion-card-header>
                            <ion-card-content >
                                <ion-grid name="content">
                                    <ion-row name="amount-area">
                                        <ion-card-title name="amount" style="font-size: 65px;">{{ indicators.reports.time.averageHoursBetweenSubmittedAndApproved.toFixed(1) }}</ion-card-title>
                                    </ion-row>
                                    <ion-row>
                                        <ion-note name="note">horas</ion-note>
                                    </ion-row>
                                </ion-grid>
                            </ion-card-content>
                        </ion-card>
                    </ion-col>

                    <ion-col>
                        <ion-card class="card-amount" style="height: 180px;">
                            <ion-card-header>
                                <ion-card-subtitle style="font-size: 9px">Tiempo Promedio Aprobación y Reembolso</ion-card-subtitle>
                            </ion-card-header>
                            <ion-card-content >
                                <ion-grid name="content">
                                    <ion-row name="amount-area">
                                        <ion-card-title name="amount" style="font-size: 65px;">{{ indicators.reports.time.averageHoursBetweenApprovedAndRestituted.toFixed(1) }}</ion-card-title>
                                    </ion-row>
                                    <ion-row>
                                        <ion-note name="note">horas</ion-note>
                                    </ion-row>
                                </ion-grid>
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                    <ion-col>
                        <ion-card class="card-amount" style="height: 180px;">
                            <ion-card-header>
                                <ion-card-subtitle style="font-size: 9px">Tiempo Promedio Creación y Envío</ion-card-subtitle>
                            </ion-card-header>
                            <ion-card-content >
                                <ion-grid name="content">
                                    <ion-row name="amount-area">
                                        <ion-card-title name="amount" style="font-size: 65px;">{{ indicators.reports.time.averageHoursBetweenCreatedAndSubmitted.toFixed(1) }}</ion-card-title>
                                    </ion-row>
                                    <ion-row>
                                        <ion-note name="note">horas</ion-note>
                                    </ion-row>
                                </ion-grid>
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                </ion-row>

                <ion-row>
                    <ion-col>
                        <ion-card style="height: 400px;">
                            <ion-card-header>
                                <ion-card-subtitle>Gastos en el año</ion-card-subtitle>
                            </ion-card-header>
                            <ion-card-content style="height: 350px">
                                <BarChart style="height: 300px;" :height="400" :chart-data="indicators.inYearMonthsGraph.data"  :options="indicators.inYearMonthsGraph.options" />
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </main>
    </article>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonGrid, IonRow, IonCol, IonNote, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonCardSubtitle, IonToolbar, IonTitle, IonSelect, IonSelectOption, IonContent, IonAccordion, IonAccordionGroup, IonProgressBar, IonImg, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController } from '@ionic/vue';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { computed, onUnmounted, ref } from 'vue';
import { Dialog } from '@/utils/Dialog/Dialog';
import AttendanceIcon from '&/assets/icons/attendance.svg';

import { addOutline, albumsOutline, alertCircleOutline, checkmarkCircleOutline,sendOutline, closeCircleOutline, arrowUpOutline, arrowUpCircleOutline, arrowDownCircleOutline  } from 'ionicons/icons';
import { IAttendance } from '@/interfaces/AttendanceInterfaces';
import { useRouter } from 'vue-router';
import NewReport from '@/dialogs/NewReport/NewReport.vue';
import { DateTime } from 'luxon';
import {AppEvents} from '@/utils/AppEvents/AppEvents';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import NewAttendance from '@/dialogs/NewAttendance/NewAttendance.vue';
import { IExpense, IJob } from '@/interfaces/JobsAndExpensesInterfaces';
import { userInfo } from 'os';
import { JobsAndExpenses } from '@/utils/Stored/JobsAndExpenses';
import { AccountantCurrentYearState, AccountantCurrentYearIndicators } from '@/views/management/graphs/GraphsGenerator';
import * as _ from "lodash";
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { DoughnutChart, BarChart, LineChart } from 'vue-chart-3';
import { watch } from 'vue';
import { onMounted } from 'vue';

import { Viewport } from '@/utils/Viewport/Viewport';
import { EReportStatus } from '@/interfaces/ReportInterfaces';


const isLoading = ref<boolean>(true);
const router = useRouter();
const page = ref<HTMLElement|null>(null);
const indicatorsData = ref<AccountantCurrentYearIndicators|null>(null);

const indicators = computed<AccountantCurrentYearIndicators|null>(() => {
    if (indicatorsData.value == null){
        return null;
    }

    const indicators = _.cloneDeep(indicatorsData.value);
    
    indicators.inYearMonthsGraph = {
        data: {
            labels: indicatorsData.value.spendings.inYearMonths.map((daily) => daily.month),
            datasets: [
                {
                    fill: false,
                    label: 'Gastos del Mes',
                    data: indicatorsData.value.spendings.inYearMonths.map((daily) => daily.total),
                    backgroundColor: Object.values({
                        red: 'rgb(255, 99, 132)',
                        orange: 'rgb(255, 159, 64)',
                        yellow: 'rgb(255, 205, 86)',
                        green: 'rgb(75, 192, 192)',
                        blue: 'rgb(54, 162, 235)',
                        purple: 'rgb(153, 102, 255)',
                        grey: 'rgb(201, 203, 207)',
                        cyan: 'rgb(0, 255, 255)',
                        magenta: 'rgb(255, 0, 255)',
                        lime: 'rgb(0, 255, 0)',
                        pink: 'rgb(255, 105, 180)',
                        teal: 'rgb(0, 128, 128)',
                        lavender: 'rgb(230, 230, 250)',
                        beige: 'rgb(245, 245, 220)'
                    }),
                    hoverOffset: 4
                }
            ]
        },
        options: {
            type: 'bar',
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
            }
        }
    };

    return indicators;
})




const loadData = async () => {
    isLoading.value = true;
    const indicators = await AccountantCurrentYearState.getIndicators(2024);
    indicatorsData.value = indicators;
    isLoading.value = false;
}

loadData();

onMounted(()=>{
    const callbackId = AppEvents.on('all:reload', () => {
        loadData();
    })

    onUnmounted(() => {
        AppEvents.off('all:reload', callbackId);
    })
})

</script>


<style lang="scss" scoped>
.card-amount{
    :deep(ion-card-content){
        height: 70%;
            display: flex;
            align-items: center;
    }
    :deep(*){
        [name="content"]{
            display: flex;
            flex-direction: column;
            align-items: center;
            row-gap: 4px;
        }
        [name="amount-area"] {
            position: relative;
        }
        [name="amount"] {
            font-size: 35px;
            &[value]{
                padding-left: 14px;
            }
            &[value="S/."]{
                padding-left: 28px;
            }
            &::before {
                content: attr(value);
                position: absolute;
                top: -2px;
                left: 0;
                font-size: 23px;
                color: #a6a6a6;
            }
        }
        [name="note"] {
            font-size: 12px;
        }
        
        [name="chip"] {
            font-size: 12px;
            padding: 10px;
            margin: 0px;
            height: 24px;

            [iname="icon"] {
                font-size: 14px;
                margin: 0px;
                padding: 0px;
            }
            [name="percentage"] {
                margin-left: 4px;
            }
        }
    }
}
</style>