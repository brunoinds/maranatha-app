<template>
    <article>
        <header class="ion-padding">
            <ion-select interface="popover" label="Seleciona un periodo" label-placement="floating" fill="outline" mode="md" :value="comparisonDropdownChosen" v-model="comparisonDropdownChosen">
                <ion-select-option v-for="period in comparisonOptions"  :value="period.value">{{ period.text }}</ion-select-option>
            </ion-select>
        </header>
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
                                        <ion-card-title name="amount" value="$" style="color: rgb(54, 162, 235); font-size: 60px">{{ indicators.spendings.total.value }}</ion-card-title>
                                    </ion-row>
                                    <ion-row>
                                    </ion-row>
                                    <ion-row>
                                        <ion-chip name="chip" :color="indicators.spendings.total.previous.percentage.color">
                                            <ion-icon iname="icon" :icon="indicators.spendings.total.previous.percentage.icon"></ion-icon>
                                            <ion-label name="percentage" v-show="!indicators.spendings.total.previous.percentage.hideValue">{{ indicators.spendings.total.previous.percentage.value }}</ion-label>
                                        </ion-chip>
                                    </ion-row>
                                </ion-grid>
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                    <ion-col>
                        <ion-card class="card-amount" style="height: 180px;">
                            <ion-card-header>
                                <ion-card-subtitle>Boletas/Facturas</ion-card-subtitle>
                            </ion-card-header>
                            <ion-card-content>
                                <ion-grid name="content">
                                    <ion-row name="amount-area">
                                        <ion-card-title name="amount" value="$">{{ indicators.spendings.by.invoices.value }}</ion-card-title>
                                    </ion-row>
                                    <ion-row>
                                        <ion-chip name="chip" :color="indicators.spendings.by.invoices.previous.percentage.color">
                                            <ion-icon iname="icon" :icon="indicators.spendings.by.invoices.previous.percentage.icon"></ion-icon>
                                            <ion-label name="percentage" v-show="!indicators.spendings.by.invoices.previous.percentage.hideValue">{{ indicators.spendings.by.invoices.previous.percentage.value }}</ion-label>
                                        </ion-chip>
                                    </ion-row>
                                </ion-grid>
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                    <ion-col>
                        <ion-card class="card-amount" style="height: 180px;">
                            <ion-card-header>
                                <ion-card-subtitle>Mano de Obra</ion-card-subtitle>
                            </ion-card-header>
                            <ion-card-content>
                                <ion-grid name="content">
                                    <ion-row name="amount-area">
                                        <ion-card-title name="amount" value="$">{{ indicators.spendings.by.workers.value }}</ion-card-title>
                                    </ion-row>
                                    <ion-row>
                                        <ion-chip name="chip" :color="indicators.spendings.by.workers.previous.percentage.color">
                                            <ion-icon iname="icon" :icon="indicators.spendings.by.workers.previous.percentage.icon"></ion-icon>
                                            <ion-label name="percentage" v-show="!indicators.spendings.by.workers.previous.percentage.hideValue">{{ indicators.spendings.by.workers.previous.percentage.value }}</ion-label>
                                        </ion-chip>
                                    </ion-row>
                                </ion-grid>
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                    <ion-col>
                        <ion-card class="card-amount" style="height: 180px;">
                            <ion-card-header>
                                <ion-card-subtitle>Promédio Gastos/Día</ion-card-subtitle>
                            </ion-card-header>
                            <ion-card-content>
                                <ion-grid name="content">
                                    <ion-row name="amount-area">
                                        <ion-card-title name="amount" value="$">{{ indicators.spendings.perDayAverage.value }}</ion-card-title>
                                    </ion-row>
                                    <ion-row>
                                        <ion-note name="note">por día</ion-note>
                                    </ion-row>
                                    <ion-row>
                                        <ion-chip name="chip" :color="indicators.spendings.perDayAverage.previous.percentage.color">
                                            <ion-icon iname="icon" :icon="indicators.spendings.perDayAverage.previous.percentage.icon"></ion-icon>
                                            <ion-label name="percentage" v-show="!indicators.spendings.perDayAverage.previous.percentage.hideValue">{{ indicators.spendings.perDayAverage.previous.percentage.value }}</ion-label>
                                        </ion-chip>
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
                            <ion-card-content>
                                <ion-grid name="content">
                                    <ion-row name="amount-area">
                                        <ion-card-title name="amount">{{ indicators.reports.time.averageHoursBetweenSubmittedAndRestituted.value }}</ion-card-title>
                                    </ion-row>
                                    <ion-row>
                                        <ion-note name="note">horas</ion-note>
                                    </ion-row>
                                    <ion-row>
                                        <ion-chip name="chip" :color="indicators.reports.time.averageHoursBetweenSubmittedAndRestituted.previous.percentage.color">
                                            <ion-icon iname="icon" :icon="indicators.reports.time.averageHoursBetweenSubmittedAndRestituted.previous.percentage.icon"></ion-icon>
                                            <ion-label name="percentage" v-show="!indicators.reports.time.averageHoursBetweenSubmittedAndRestituted.previous.percentage.hideValue">{{ indicators.reports.time.averageHoursBetweenSubmittedAndRestituted.previous.percentage.value }}</ion-label>
                                        </ion-chip>
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
                            <ion-card-content>
                                <ion-grid name="content">
                                    <ion-row name="amount-area">
                                        <ion-card-title name="amount">{{ indicators.reports.time.averageHoursBetweenSubmittedAndApproved.value }}</ion-card-title>
                                    </ion-row>
                                    <ion-row>
                                        <ion-note name="note">horas</ion-note>
                                    </ion-row>
                                    <ion-row>
                                        <ion-chip name="chip" :color="indicators.reports.time.averageHoursBetweenSubmittedAndApproved.previous.percentage.color">
                                            <ion-icon iname="icon" :icon="indicators.reports.time.averageHoursBetweenSubmittedAndApproved.previous.percentage.icon"></ion-icon>
                                            <ion-label name="percentage" v-show="!indicators.reports.time.averageHoursBetweenSubmittedAndApproved.previous.percentage.hideValue">{{ indicators.reports.time.averageHoursBetweenSubmittedAndApproved.previous.percentage.value }}</ion-label>
                                        </ion-chip>
                                    </ion-row>
                                </ion-grid>
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                    <ion-col>
                        <ion-card class="card-amount" style="height: 180px;">
                            <ion-card-header>
                                <ion-card-subtitle style="font-size: 8px">Tiempo Promedio Aprobación y Reembolso</ion-card-subtitle>
                            </ion-card-header>
                            <ion-card-content>
                                <ion-grid name="content">
                                    <ion-row name="amount-area">
                                        <ion-card-title name="amount">{{ indicators.reports.time.averageHoursBetweenApprovedAndRestituted.value }}</ion-card-title>
                                    </ion-row>
                                    <ion-row>
                                        <ion-note name="note">horas</ion-note>
                                    </ion-row>
                                    <ion-row>
                                        <ion-chip name="chip" :color="indicators.reports.time.averageHoursBetweenApprovedAndRestituted.previous.percentage.color">
                                            <ion-icon iname="icon" :icon="indicators.reports.time.averageHoursBetweenApprovedAndRestituted.previous.percentage.icon"></ion-icon>
                                            <ion-label name="percentage" v-show="!indicators.reports.time.averageHoursBetweenApprovedAndRestituted.previous.percentage.hideValue">{{ indicators.reports.time.averageHoursBetweenApprovedAndRestituted.previous.percentage.value }}</ion-label>
                                        </ion-chip>
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
                            <ion-card-content>
                                <ion-grid name="content">
                                    <ion-row name="amount-area">
                                        <ion-card-title name="amount">{{ indicators.reports.time.averageHoursBetweenCreatedAndSubmitted.value }}</ion-card-title>
                                    </ion-row>
                                    <ion-row>
                                        <ion-note name="note">horas</ion-note>
                                    </ion-row>
                                    <ion-row>
                                        <ion-chip name="chip" :color="indicators.reports.time.averageHoursBetweenCreatedAndSubmitted.previous.percentage.color">
                                            <ion-icon iname="icon" :icon="indicators.reports.time.averageHoursBetweenCreatedAndSubmitted.previous.percentage.icon"></ion-icon>
                                            <ion-label name="percentage" v-show="!indicators.reports.time.averageHoursBetweenCreatedAndSubmitted.previous.percentage.hideValue">{{ indicators.reports.time.averageHoursBetweenCreatedAndSubmitted.previous.percentage.value }}</ion-label>
                                        </ion-chip>
                                    </ion-row>
                                </ion-grid>
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                </ion-row>

                <ion-row  v-if="Viewport.data.value.deviceSetting != 'DesktopLandscape'">
                    <ion-card style="width: 100%; height: 285px;">
                        <ion-card-header>
                            <ion-card-subtitle>Gastos Diários</ion-card-subtitle>
                        </ion-card-header>
                        <ion-card-content style="height: 350px">
                            <LineChart :height="230" :chart-data="indicators.spendings.daily.current.data"  :options="indicators.spendings.daily.current.options" />
                        </ion-card-content>
                    </ion-card>
                </ion-row>
                <ion-row>
                    <ion-col v-if="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                        <ion-card style="height: 400px; width: 500px;" >
                            <ion-card-header>
                                <ion-card-subtitle>Gastos Diários</ion-card-subtitle>
                            </ion-card-header>
                            <ion-card-content style="height: 350px">
                                <LineChart :height="290" :chart-data="indicators.spendings.daily.current.data"  :options="indicators.spendings.daily.current.options" />
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                    <ion-col>
                        <ion-row>
                            <ion-col>
                                <ion-card class="card-amount"  style="height: 180px;">
                                    <ion-card-header>
                                        <ion-card-subtitle>Trabajadores Involuncrados</ion-card-subtitle>
                                    </ion-card-header>
                                    <ion-card-content>
                                        <ion-grid name="content">
                                            <ion-row name="amount-area">
                                                <ion-card-title name="amount" style="font-size: 52px;" >{{ indicators.workers.count.workers.value }}</ion-card-title>
                                            </ion-row>
                                            <ion-row>
                                                <ion-chip name="chip" :color="indicators.workers.count.workers.previous.percentage.color">
                                                    <ion-icon iname="icon" :icon="indicators.workers.count.workers.previous.percentage.icon"></ion-icon>
                                                    <ion-label name="percentage" v-show="!indicators.workers.count.workers.previous.percentage.hideValue">{{ indicators.workers.count.workers.previous.percentage.value }}</ion-label>
                                                </ion-chip>
                                            </ion-row>
                                        </ion-grid>
                                    </ion-card-content>
                                </ion-card>
                            </ion-col>
                            <ion-col>
                                <ion-card class="card-amount"  style="height: 180px;">
                                    <ion-card-header>
                                        <ion-card-subtitle>Promédio Costo/Día por Trabajador</ion-card-subtitle>
                                    </ion-card-header>
                                    <ion-card-content>
                                        <ion-grid name="content">
                                            <ion-row name="amount-area">
                                                <ion-card-title name="amount" value="$">{{ indicators.workers.spendings.perDayAverage.value }}</ion-card-title>
                                            </ion-row>
                                            <ion-row>
                                                <ion-note name="note">por día</ion-note>
                                            </ion-row>
                                            <ion-row>
                                                <ion-chip name="chip" :color="indicators.workers.spendings.perDayAverage.previous.percentage.color">
                                                    <ion-icon iname="icon" :icon="indicators.workers.spendings.perDayAverage.previous.percentage.icon"></ion-icon>
                                                    <ion-label name="percentage" v-show="!indicators.workers.spendings.perDayAverage.previous.percentage.hideValue">{{ indicators.workers.spendings.perDayAverage.previous.percentage.value }}</ion-label>
                                                </ion-chip>
                                            </ion-row>
                                        </ion-grid>
                                    </ion-card-content>
                                </ion-card>
                            </ion-col>
                        </ion-row>
                        <ion-row>
                            <ion-col>
                                <ion-card class="card-amount"  style="height: 180px;">
                                    <ion-card-header>
                                        <ion-card-subtitle>Tasa de Inasistencias</ion-card-subtitle>
                                    </ion-card-header>
                                    <ion-card-content>
                                        <ion-grid name="content">
                                            <ion-row name="amount-area">
                                                <ion-card-title name="amount" style="font-size: 52px;">{{ indicators.workers.count.absences.value }}%</ion-card-title>
                                            </ion-row>
                                            <ion-row>
                                                <ion-chip name="chip" :color="indicators.workers.count.absences.previous.percentage.color">
                                                    <ion-icon iname="icon" :icon="indicators.workers.count.absences.previous.percentage.icon"></ion-icon>
                                                    <ion-label name="percentage" v-show="!indicators.workers.count.absences.previous.percentage.hideValue">{{ indicators.workers.count.absences.previous.percentage.value }}</ion-label>
                                                </ion-chip>
                                            </ion-row>
                                        </ion-grid>
                                    </ion-card-content>
                                </ion-card>
                            </ion-col>
                        </ion-row>
                    </ion-col>
                </ion-row>
                <ion-row v-if="Viewport.data.value.deviceSetting == 'DesktopLandscape'">
                    <ion-col  style="height: 400px; width: 500px;">
                        <ion-card>
                            <ion-card-header>
                                <ion-card-subtitle>Gastos por Usuário</ion-card-subtitle>
                            </ion-card-header>
                            <ion-card-content style="height: 350px;">
                                <DoughnutChart style="max-height: 330px;" :height="100" :width="100" :chart-data="indicators.spendings.distributions.byUsers.data"  :options="indicators.spendings.distributions.byUsers.options" />
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                    <ion-col style="height: 400px; width: 500px;">
                        <ion-card>
                            <ion-card-header>
                                <ion-card-subtitle>Gastos por Jobs</ion-card-subtitle>
                            </ion-card-header>
                            <ion-card-content style="height: 350px">
                                <BarChart :height="270" :chart-data="indicators.spendings.distributions.byJobs.data"  :options="indicators.spendings.distributions.byJobs.options" />
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                </ion-row>
                <ion-row v-if="Viewport.data.value.deviceSetting != 'DesktopLandscape'">
                    <ion-col>
                        <ion-card>
                            <ion-card-header>
                                <ion-card-subtitle>Gastos por Jobs</ion-card-subtitle>
                            </ion-card-header>
                            <ion-card-content style="height: 350px">
                                <BarChart :height="400" :chart-data="indicators.spendings.distributions.byJobs.data"  :options="indicators.spendings.distributions.byJobs.options" />
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                </ion-row>
                <ion-row v-if="Viewport.data.value.deviceSetting != 'DesktopLandscape'">
                    <ion-col>
                        <ion-card>
                            <ion-card-header>
                                <ion-card-subtitle>Gastos por Usuário</ion-card-subtitle>
                            </ion-card-header>
                            <ion-card-content style="height: 350px;">
                                <DoughnutChart style="max-height: 330px;" :height="100" :width="100" :chart-data="indicators.spendings.distributions.byUsers.data"  :options="indicators.spendings.distributions.byUsers.options" />
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                </ion-row>
            </ion-grid>
            <br>
            <br>
            <br>
        </main>
    </article>
</template>
<script setup lang="ts">
import { IonPage, IonHeader, IonGrid, IonRow, IonCol, IonNote, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonCardSubtitle, IonToolbar, IonTitle, IonSelect, IonSelectOption, IonContent, IonAccordion, IonAccordionGroup, IonProgressBar, IonImg, IonListHeader, IonFab, IonChip, IonFabButton, IonIcon, IonList, IonItem, IonLabel, alertController } from '@ionic/vue';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { computed, ref } from 'vue';
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
import { AccountantPeriodComparison, AccountantPeriodComparisonIndicators } from '@/views/management/graphs/GraphsGenerator';
import * as _ from "lodash";
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { DoughnutChart, BarChart, LineChart } from 'vue-chart-3';
import { watch } from 'vue';
import { onMounted } from 'vue';

import { Viewport } from '@/utils/Viewport/Viewport';
import { onUnmounted } from 'vue';


const isLoading = ref<boolean>(true);
const router = useRouter();
const page = ref<HTMLElement|null>(null);
const comparisonDropdownChosen = ref<string|null>(null);
const indicatorsData = ref<AccountantPeriodComparisonIndicators|null>(null);


const jobs = ref<IJob[]>([]);




interface AccountantPeriodComparisonIndicatorsComputed{
    spendings: {
        total: {
            value: string,
            previous: {
                percentage: {
                    color: string,
                    value: string,
                    icon: string,
                    hideValue: boolean
                }
            }
        },
        by: {
            invoices: {
                value: string,
                previous: {
                    percentage: {
                        color: string,
                        value: string,
                        icon: string,
                        hideValue: boolean
                    }
                }
            },
            workers: {
                value: string,
                previous: {
                    percentage: {
                        color: string,
                        value: string,
                        icon: string,
                        hideValue: boolean
                    }
                }
            }
        },
        distributions: {
            byJobs: {
                data: any,
                options: any
            },
            byUsers: {
                data: any,
                options: any
            }
        },
        perDayAverage: {
            value: string,
            previous: {
                percentage: {
                    color: string,
                    value: string,
                    icon: string,
                    hideValue: boolean
                }
            }
        },
        daily: {
            current: {
                data: any,
                options: any
            },
            previous: { day: number; total: number; by: { invoices: number; workers: number; }; }[]
        }
    },
    workers: {
        count: {
            workers: {
                value: string,
                previous: {
                    percentage: {
                        color: string,
                        value: string,
                        icon: string,
                        hideValue: boolean
                    }
                }
            },
            attendances: {
                value: string,
                previous: {
                    percentage: {
                        color: string,
                        value: string,
                        icon: string,
                        hideValue: boolean
                    }
                }
            },
            absences: {
                value: string,
                previous: {
                    percentage: {
                        color: string,
                        value: string,
                        icon: string,
                        hideValue: boolean
                    }
                }
            },
        },
        percentage: {
            attendances: {
                value: string,
                previous: {
                    percentage: {
                        color: string,
                        value: string,
                        icon: string,
                        hideValue: boolean
                    }
                }
            },
            absences: {
                value: string,
                previous: {
                    percentage: {
                        color: string,
                        value: string,
                        icon: string,
                        hideValue: boolean
                    }
                }
            },
        },
        spendings: {
            perDayAverage: {
                value: string,
                previous: {
                    percentage: {
                        color: string,
                        value: string,
                        icon: string,
                        hideValue: boolean
                    }
                }
            }
        }
    },
    invoices: {
        count: {
            bills: {
                value: string,
                previous: {
                    percentage: {
                        color: string,
                        value: string,
                        icon: string,
                        hideValue: boolean
                    }
                }
            },
            factures: {
                value: string,
                previous: {
                    percentage: {
                        color: string,
                        value: string,
                        icon: string,
                        hideValue: boolean
                    }
                }
            },
            total: {
                value: string,
                previous: {
                    percentage: {
                        color: string,
                        value: string,
                        icon: string,
                        hideValue: boolean
                    }
                }
            }
        },
        spendings: {
            perDayAverage: {
                value: string,
                previous: {
                    percentage: {
                        color: string,
                        value: string,
                        icon: string,
                        hideValue: boolean
                    }
                }
            }
        }
    },
    reports: {
            time: {
                averageHoursBetweenCreatedAndSubmitted: {
                    value: string,
                    previous: {
                        percentage: {
                            color: string,
                            value: string,
                            icon: string,
                            hideValue: boolean
                        }
                    }
                },
                averageHoursBetweenSubmittedAndApproved: {
                    value: string,
                    previous: {
                        percentage: {
                            color: string,
                            value: string,
                            icon: string,
                            hideValue: boolean
                        }
                    }
                },
                averageHoursBetweenApprovedAndRestituted: {
                    value: string,
                    previous: {
                        percentage: {
                            color: string,
                            value: string,
                            icon: string,
                            hideValue: boolean
                        }
                    }
                },
                averageHoursBetweenSubmittedAndRestituted: {
                    value: string,
                    previous: {
                        percentage: {
                            color: string,
                            value: string,
                            icon: string,
                            hideValue: boolean
                        }
                    }
                }
            }
    }
}
const indicators = computed<AccountantPeriodComparisonIndicatorsComputed|null>(() => {
    if (indicatorsData.value == null){
        return null;
    }
    const indicators = indicatorsData.value;

    const indicatorsComputed = {
        spendings: {
            total: {
                value: '',
                previous: {
                    percentage: {
                        color: '',
                        value: '',
                        icon: '',
                        hideValue: false
                    }
                }
            },
            by: {
                invoices: {
                    value: '',
                    previous: {
                        percentage: {
                            color: '',
                            value: '',
                            icon: '',
                            hideValue: false
                        }
                    }
                },
                workers: {
                    value: '',
                    previous: {
                        percentage: {
                            color: '',
                            value: '',
                            icon: '',
                            hideValue: false
                        }
                    }
                }
            },
            distributions: {
                byJobs: {
                    data: {},
                    options: {}
                },
                byUsers: {
                    data: {},
                    options: {}
                }
            },
            perDayAverage: {
                value: '',
                previous: {
                    percentage: {
                        color: '',
                        value: '',
                        icon: '',
                        hideValue: false
                    }
                }
            },
            daily: {
                current: {
                    data: {},
                    options: {}
                },
                previous: []
            }
        },
        workers: {
            count: {
                workers: {
                    value: '',
                    previous: {
                        percentage: {
                            color: '',
                            value: '',
                            icon: '',
                            hideValue: false
                        }
                    }
                },
                attendances: {
                    value: '',
                    previous: {
                        percentage: {
                            color: '',
                            value: '',
                            icon: '',
                            hideValue: false
                        }
                    }
                },
                absences: {
                    value: '',
                    previous: {
                        percentage: {
                            color: '',
                            value: '',
                            icon: '',
                            hideValue: false
                        }
                    }
                },
            },
            percentage: {
                attendances: {
                    value: '',
                    previous: {
                        percentage: {
                            color: '',
                            value: '',
                            icon: '',
                            hideValue: false
                        }
                    }
                },
                absences: {
                    value: '',
                    previous: {
                        percentage: {
                            color: '',
                            value: '',
                            icon: '',
                            hideValue: false
                        }
                    }
                },
            },
            spendings: {
                perDayAverage: {
                    value: '',
                    previous: {
                        percentage: {
                            color: '',
                            value: '',
                            icon: '',
                            hideValue: false
                        }
                    }
                }
            }
        },
        invoices: {
            count: {
                bills: {
                    value: '',
                    previous: {
                        percentage: {
                            color: '',
                            value: '',
                            icon: '',
                            hideValue: false
                        }
                    }
                },
                factures: {
                    value: '',
                    previous: {
                        percentage: {
                            color: '',
                            value: '',
                            icon: '',
                            hideValue: false
                        }
                    }
                },
                total: {
                    value: '',
                    previous: {
                        percentage: {
                            color: '',
                            value: '',
                            icon: '',
                            hideValue: false
                        }
                    }
                }
            },
            spendings: {
                perDayAverage: {
                    value: '',
                    previous: {
                        percentage: {
                            color: '',
                            value: '',
                            icon: '',
                            hideValue: false
                        }
                    }
                }
            }
        },
        reports: {
            time: {
                averageHoursBetweenCreatedAndSubmitted: {
                    value: '',
                    previous: {
                        percentage: {
                            color: '',
                            value: '',
                            icon: '',
                            hideValue: false
                        }
                    }
                },
                averageHoursBetweenSubmittedAndApproved: {
                    value: '',
                    previous: {
                        percentage: {
                            color: '',
                            value: '',
                            icon: '',
                            hideValue: false
                        }
                    }
                },
                averageHoursBetweenApprovedAndRestituted: {
                    value: '',
                    previous: {
                        percentage: {
                            color: '',
                            value: '',
                            icon: '',
                            hideValue: false
                        }
                    }
                },
                averageHoursBetweenSubmittedAndRestituted: {
                    value: '',
                    previous: {
                        percentage: {
                            color: '',
                            value: '',
                            icon: '',
                            hideValue: false
                        }
                    }
                }
            }
        }
    } as AccountantPeriodComparisonIndicatorsComputed;

    indicatorsComputed.spendings.total.value = Toolbox.moneyFormat(indicators.spendings.total.value);
    indicatorsComputed.spendings.total.previous.percentage.color = (indicators.spendings.total.previous.percentage > 0) ? 'danger' : 'success';
    indicatorsComputed.spendings.total.previous.percentage.icon = (indicators.spendings.total.previous.percentage > 0) ? arrowUpCircleOutline : arrowDownCircleOutline;
    indicatorsComputed.spendings.total.previous.percentage.value = `${indicators.spendings.total.previous.percentage.toFixed(0)}%`;
    indicatorsComputed.spendings.total.previous.percentage.hideValue = indicators.spendings.total.previous.percentage == Infinity || indicators.spendings.total.previous.percentage == -Infinity || isNaN(indicators.spendings.total.previous.percentage);


    indicatorsComputed.spendings.by.invoices.value = Toolbox.moneyFormat(indicators.spendings.by.invoices.value);
    indicatorsComputed.spendings.by.invoices.previous.percentage.color = (indicators.spendings.by.invoices.previous.percentage > 0) ? 'danger' : 'success';
    indicatorsComputed.spendings.by.invoices.previous.percentage.icon = (indicators.spendings.by.invoices.previous.percentage > 0) ? arrowUpCircleOutline : arrowDownCircleOutline;
    indicatorsComputed.spendings.by.invoices.previous.percentage.value = `${indicators.spendings.by.invoices.previous.percentage.toFixed(0)}%`;
    indicatorsComputed.spendings.by.invoices.previous.percentage.hideValue = indicators.spendings.by.invoices.previous.percentage == Infinity || indicators.spendings.by.invoices.previous.percentage == -Infinity || isNaN(indicators.spendings.by.invoices.previous.percentage);


    indicatorsComputed.spendings.by.workers.value = Toolbox.moneyFormat(indicators.spendings.by.workers.value);
    indicatorsComputed.spendings.by.workers.previous.percentage.color = (indicators.spendings.by.workers.previous.percentage > 0) ? 'danger' : 'success';
    indicatorsComputed.spendings.by.workers.previous.percentage.icon = (indicators.spendings.by.workers.previous.percentage > 0) ? arrowUpCircleOutline : arrowDownCircleOutline;
    indicatorsComputed.spendings.by.workers.previous.percentage.value = `${indicators.spendings.by.workers.previous.percentage.toFixed(0)}%`;
    indicatorsComputed.spendings.by.workers.previous.percentage.hideValue = indicators.spendings.by.workers.previous.percentage == Infinity || indicators.spendings.by.workers.previous.percentage == -Infinity || isNaN(indicators.spendings.by.workers.previous.percentage);

    indicatorsComputed.spendings.perDayAverage.value = Toolbox.moneyFormat(indicators.spendings.perDayAverage.value);
    indicatorsComputed.spendings.perDayAverage.previous.percentage.color = (indicators.spendings.perDayAverage.previous.percentage > 0) ? 'danger' : 'success';
    indicatorsComputed.spendings.perDayAverage.previous.percentage.icon = (indicators.spendings.perDayAverage.previous.percentage > 0) ? arrowUpCircleOutline : arrowDownCircleOutline;
    indicatorsComputed.spendings.perDayAverage.previous.percentage.value = `${indicators.spendings.perDayAverage.previous.percentage.toFixed(0)}%`;
    indicatorsComputed.spendings.perDayAverage.previous.percentage.hideValue = indicators.spendings.perDayAverage.previous.percentage == Infinity || indicators.spendings.perDayAverage.previous.percentage == -Infinity || isNaN(indicators.spendings.perDayAverage.previous.percentage);

    indicatorsComputed.workers.count.workers.value = indicators.workers.count.workers.value.toString();
    indicatorsComputed.workers.count.workers.previous.percentage.color = (indicators.workers.count.workers.previous.percentage > 0) ? 'danger' : 'success';
    indicatorsComputed.workers.count.workers.previous.percentage.icon = (indicators.workers.count.workers.previous.percentage > 0) ? arrowUpCircleOutline : arrowDownCircleOutline;
    indicatorsComputed.workers.count.workers.previous.percentage.value = `${indicators.workers.count.workers.previous.percentage.toFixed(0)}%`;
    indicatorsComputed.workers.count.workers.previous.percentage.hideValue = indicators.workers.count.workers.previous.percentage == Infinity || indicators.workers.count.workers.previous.percentage == -Infinity || isNaN(indicators.workers.count.workers.previous.percentage);

    indicatorsComputed.workers.count.attendances.value = indicators.workers.count.attendances.value.toString();
    indicatorsComputed.workers.count.attendances.previous.percentage.color = (indicators.workers.count.attendances.previous.percentage > 0) ? 'danger' : 'success';
    indicatorsComputed.workers.count.attendances.previous.percentage.icon = (indicators.workers.count.attendances.previous.percentage > 0) ? arrowUpCircleOutline : arrowDownCircleOutline;
    indicatorsComputed.workers.count.attendances.previous.percentage.value = `${indicators.workers.count.attendances.previous.percentage.toFixed(0)}%`;
    indicatorsComputed.workers.count.attendances.previous.percentage.hideValue = indicators.workers.count.attendances.previous.percentage == Infinity || indicators.workers.count.attendances.previous.percentage == -Infinity || isNaN(indicators.workers.count.attendances.previous.percentage);

    indicatorsComputed.workers.count.absences.value = indicators.workers.count.absences.value.toString();
    indicatorsComputed.workers.count.absences.previous.percentage.color = (indicators.workers.count.absences.previous.percentage > 0) ? 'danger' : 'success';
    indicatorsComputed.workers.count.absences.previous.percentage.icon = (indicators.workers.count.absences.previous.percentage > 0) ? arrowUpCircleOutline : arrowDownCircleOutline;
    indicatorsComputed.workers.count.absences.previous.percentage.value = `${indicators.workers.count.absences.previous.percentage.toFixed(0)}%`;
    indicatorsComputed.workers.count.absences.previous.percentage.hideValue = indicators.workers.count.absences.previous.percentage == Infinity || indicators.workers.count.absences.previous.percentage == -Infinity || isNaN(indicators.workers.count.absences.previous.percentage);

    indicatorsComputed.workers.percentage.attendances.value = indicators.workers.percentage.attendances.value.toString();
    indicatorsComputed.workers.percentage.attendances.previous.percentage.color = (indicators.workers.percentage.attendances.previous.percentage > 0) ? 'danger' : 'success';
    indicatorsComputed.workers.percentage.attendances.previous.percentage.icon = (indicators.workers.percentage.attendances.previous.percentage > 0) ? arrowUpCircleOutline : arrowDownCircleOutline;
    indicatorsComputed.workers.percentage.attendances.previous.percentage.value = `${indicators.workers.percentage.attendances.previous.percentage.toFixed(0)}%`;
    indicatorsComputed.workers.percentage.attendances.previous.percentage.hideValue = indicators.workers.percentage.attendances.previous.percentage == Infinity || indicators.workers.percentage.attendances.previous.percentage == -Infinity || isNaN(indicators.workers.percentage.attendances.previous.percentage);

    indicatorsComputed.workers.percentage.absences.value = indicators.workers.percentage.absences.value.toString();
    indicatorsComputed.workers.percentage.absences.previous.percentage.color = (indicators.workers.percentage.absences.previous.percentage > 0) ? 'danger' : 'success';
    indicatorsComputed.workers.percentage.absences.previous.percentage.icon = (indicators.workers.percentage.absences.previous.percentage > 0) ? arrowUpCircleOutline : arrowDownCircleOutline;
    indicatorsComputed.workers.percentage.absences.previous.percentage.value = `${indicators.workers.percentage.absences.previous.percentage.toFixed(0)}%`;
    indicatorsComputed.workers.percentage.absences.previous.percentage.hideValue = indicators.workers.percentage.absences.previous.percentage == Infinity || indicators.workers.percentage.absences.previous.percentage == -Infinity || isNaN(indicators.workers.percentage.absences.previous.percentage);

    indicatorsComputed.workers.spendings.perDayAverage.value = Toolbox.moneyFormat(indicators.workers.spendings.perDayAverage.value);
    indicatorsComputed.workers.spendings.perDayAverage.previous.percentage.color = (indicators.workers.spendings.perDayAverage.previous.percentage > 0) ? 'danger' : 'success';
    indicatorsComputed.workers.spendings.perDayAverage.previous.percentage.icon = (indicators.workers.spendings.perDayAverage.previous.percentage > 0) ? arrowUpCircleOutline : arrowDownCircleOutline;
    indicatorsComputed.workers.spendings.perDayAverage.previous.percentage.value = `${indicators.workers.spendings.perDayAverage.previous.percentage.toFixed(0)}%`;
    indicatorsComputed.workers.spendings.perDayAverage.previous.percentage.hideValue = indicators.workers.spendings.perDayAverage.previous.percentage == Infinity || indicators.workers.spendings.perDayAverage.previous.percentage == -Infinity || isNaN(indicators.workers.spendings.perDayAverage.previous.percentage);

    indicatorsComputed.invoices.count.bills.value = indicators.invoices.count.bills.value.toString();
    indicatorsComputed.invoices.count.bills.previous.percentage.color = (indicators.invoices.count.bills.previous.percentage > 0) ? 'danger' : 'success';
    indicatorsComputed.invoices.count.bills.previous.percentage.icon = (indicators.invoices.count.bills.previous.percentage > 0) ? arrowUpCircleOutline : arrowDownCircleOutline;
    indicatorsComputed.invoices.count.bills.previous.percentage.value = `${indicators.invoices.count.bills.previous.percentage.toFixed(0)}%`;
    indicatorsComputed.invoices.count.bills.previous.percentage.hideValue = indicators.invoices.count.bills.previous.percentage == Infinity || indicators.invoices.count.bills.previous.percentage == -Infinity || isNaN(indicators.invoices.count.bills.previous.percentage);

    indicatorsComputed.invoices.count.factures.value = indicators.invoices.count.factures.value.toString();
    indicatorsComputed.invoices.count.factures.previous.percentage.color = (indicators.invoices.count.factures.previous.percentage > 0) ? 'danger' : 'success';
    indicatorsComputed.invoices.count.factures.previous.percentage.icon = (indicators.invoices.count.factures.previous.percentage > 0) ? arrowUpCircleOutline : arrowDownCircleOutline;
    indicatorsComputed.invoices.count.factures.previous.percentage.value = `${indicators.invoices.count.factures.previous.percentage.toFixed(0)}%`;
    indicatorsComputed.invoices.count.factures.previous.percentage.hideValue = indicators.invoices.count.factures.previous.percentage == Infinity || indicators.invoices.count.factures.previous.percentage == -Infinity || isNaN(indicators.invoices.count.factures.previous.percentage);

    indicatorsComputed.invoices.count.total.value = indicators.invoices.count.total.value.toString();
    indicatorsComputed.invoices.count.total.previous.percentage.color = (indicators.invoices.count.total.previous.percentage > 0) ? 'danger' : 'success';
    indicatorsComputed.invoices.count.total.previous.percentage.icon = (indicators.invoices.count.total.previous.percentage > 0) ? arrowUpCircleOutline : arrowDownCircleOutline;
    indicatorsComputed.invoices.count.total.previous.percentage.value = `${indicators.invoices.count.total.previous.percentage.toFixed(0)}%`;
    indicatorsComputed.invoices.count.total.previous.percentage.hideValue = indicators.invoices.count.total.previous.percentage == Infinity || indicators.invoices.count.total.previous.percentage == -Infinity || isNaN(indicators.invoices.count.total.previous.percentage);

    indicatorsComputed.invoices.spendings.perDayAverage.value = Toolbox.moneyFormat(indicators.invoices.spendings.perDayAverage.value);
    indicatorsComputed.invoices.spendings.perDayAverage.previous.percentage.color = (indicators.invoices.spendings.perDayAverage.previous.percentage > 0) ? 'danger' : 'success';
    indicatorsComputed.invoices.spendings.perDayAverage.previous.percentage.icon = (indicators.invoices.spendings.perDayAverage.previous.percentage > 0) ? arrowUpCircleOutline : arrowDownCircleOutline;
    indicatorsComputed.invoices.spendings.perDayAverage.previous.percentage.value = `${indicators.invoices.spendings.perDayAverage.previous.percentage.toFixed(0)}%`;
    indicatorsComputed.invoices.spendings.perDayAverage.previous.percentage.hideValue = indicators.invoices.spendings.perDayAverage.previous.percentage == Infinity || indicators.invoices.spendings.perDayAverage.previous.percentage == -Infinity || isNaN(indicators.invoices.spendings.perDayAverage.previous.percentage);


    indicatorsComputed.spendings.distributions.byUsers = {
        data: {
            labels: indicators.spendings.distributions.byUsers.map((distribution) => distribution.user.name),
            datasets: [
                {
                    label: 'Gastos por Usuário',
                    data: indicators.spendings.distributions.byUsers.map((distribution) => distribution.total.value),
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
            type: 'doughnut',
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                    position: 'bottom',
                },
                title: {
                    display: false,
                    text: 'Chart.js Doughnut Chart'
                },
                tooltip: {
                    callbacks: {
                        title: function(context:any) {
                            const item = context[0];
                            return item.label
                        },
                        label: function(context:any) {
                            let label = context.dataset.label || '';
                            label = 'Gastos';
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

    indicatorsComputed.spendings.distributions.byJobs = {
        data: {
            labels: indicators.spendings.distributions.byJobs.map((distribution) => distribution.job.name),
            datasets: [
                {
                    label: 'Gastos del Job',
                    data: indicators.spendings.distributions.byJobs.map((distribution) => distribution.total.value),
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
            indexAxis: 'y',
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
                        title: function(context:any) {
                            const job = jobs.value.filter((job) => job.code == context[0].label);

                            if (job.length == 0){
                                return context[0].label;
                            }else{
                                return context[0].label + " " + job[0].name;
                            }
                        },
                        label: function(context:any) {
                            let label = context.dataset.label || '';
                            label = 'Gastos';
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


    indicatorsComputed.spendings.daily.current = {
        data: {
            labels: indicators.spendings.daily.current.map((daily) => daily.day),
            datasets: [
                {
                    fill: false,
                    label: 'Gastos del Día',
                    data: indicators.spendings.daily.current.map((daily) => daily.total),
                    backgroundColor: 'rgb(54, 162, 235)',
                    borderColor: 'rgb(54, 162, 235)',
                    tension: 0.2,
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
                        title: function(context:any) {
                            return `Día ${context[0].label}`;
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
            }
        }
    };



    indicatorsComputed.reports.time.averageHoursBetweenApprovedAndRestituted.value = indicators.reports.time.averageHoursBetweenApprovedAndRestituted.value.toFixed(0);
    indicatorsComputed.reports.time.averageHoursBetweenApprovedAndRestituted.previous.percentage.color = (indicators.reports.time.averageHoursBetweenApprovedAndRestituted.previous.percentage > 0) ? 'danger' : 'success';
    indicatorsComputed.reports.time.averageHoursBetweenApprovedAndRestituted.previous.percentage.icon = (indicators.reports.time.averageHoursBetweenApprovedAndRestituted.previous.percentage > 0) ? arrowUpCircleOutline : arrowDownCircleOutline;
    indicatorsComputed.reports.time.averageHoursBetweenApprovedAndRestituted.previous.percentage.value = `${indicators.reports.time.averageHoursBetweenApprovedAndRestituted.previous.percentage.toFixed(0)}%`;
    indicatorsComputed.reports.time.averageHoursBetweenApprovedAndRestituted.previous.percentage.hideValue = indicators.reports.time.averageHoursBetweenApprovedAndRestituted.previous.percentage == Infinity || indicators.reports.time.averageHoursBetweenApprovedAndRestituted.previous.percentage == -Infinity || isNaN(indicators.reports.time.averageHoursBetweenApprovedAndRestituted.previous.percentage);

    indicatorsComputed.reports.time.averageHoursBetweenCreatedAndSubmitted.value = indicators.reports.time.averageHoursBetweenCreatedAndSubmitted.value.toFixed(0);
    indicatorsComputed.reports.time.averageHoursBetweenCreatedAndSubmitted.previous.percentage.color = (indicators.reports.time.averageHoursBetweenCreatedAndSubmitted.previous.percentage > 0) ? 'danger' : 'success';
    indicatorsComputed.reports.time.averageHoursBetweenCreatedAndSubmitted.previous.percentage.icon = (indicators.reports.time.averageHoursBetweenCreatedAndSubmitted.previous.percentage > 0) ? arrowUpCircleOutline : arrowDownCircleOutline;
    indicatorsComputed.reports.time.averageHoursBetweenCreatedAndSubmitted.previous.percentage.value = `${indicators.reports.time.averageHoursBetweenCreatedAndSubmitted.previous.percentage.toFixed(0)}%`;
    indicatorsComputed.reports.time.averageHoursBetweenCreatedAndSubmitted.previous.percentage.hideValue = indicators.reports.time.averageHoursBetweenCreatedAndSubmitted.previous.percentage == Infinity || indicators.reports.time.averageHoursBetweenCreatedAndSubmitted.previous.percentage == -Infinity || isNaN(indicators.reports.time.averageHoursBetweenCreatedAndSubmitted.previous.percentage);

    indicatorsComputed.reports.time.averageHoursBetweenSubmittedAndApproved.value = indicators.reports.time.averageHoursBetweenSubmittedAndApproved.value.toFixed(0);
    indicatorsComputed.reports.time.averageHoursBetweenSubmittedAndApproved.previous.percentage.color = (indicators.reports.time.averageHoursBetweenSubmittedAndApproved.previous.percentage > 0) ? 'danger' : 'success';
    indicatorsComputed.reports.time.averageHoursBetweenSubmittedAndApproved.previous.percentage.icon = (indicators.reports.time.averageHoursBetweenSubmittedAndApproved.previous.percentage > 0) ? arrowUpCircleOutline : arrowDownCircleOutline;
    indicatorsComputed.reports.time.averageHoursBetweenSubmittedAndApproved.previous.percentage.value = `${indicators.reports.time.averageHoursBetweenSubmittedAndApproved.previous.percentage.toFixed(0)}%`;
    indicatorsComputed.reports.time.averageHoursBetweenSubmittedAndApproved.previous.percentage.hideValue = indicators.reports.time.averageHoursBetweenSubmittedAndApproved.previous.percentage == Infinity || indicators.reports.time.averageHoursBetweenSubmittedAndApproved.previous.percentage == -Infinity || isNaN(indicators.reports.time.averageHoursBetweenSubmittedAndApproved.previous.percentage);

    indicatorsComputed.reports.time.averageHoursBetweenSubmittedAndRestituted.value = indicators.reports.time.averageHoursBetweenSubmittedAndRestituted.value.toFixed(0);
    indicatorsComputed.reports.time.averageHoursBetweenSubmittedAndRestituted.previous.percentage.color = (indicators.reports.time.averageHoursBetweenSubmittedAndRestituted.previous.percentage > 0) ? 'danger' : 'success';
    indicatorsComputed.reports.time.averageHoursBetweenSubmittedAndRestituted.previous.percentage.icon = (indicators.reports.time.averageHoursBetweenSubmittedAndRestituted.previous.percentage > 0) ? arrowUpCircleOutline : arrowDownCircleOutline;
    indicatorsComputed.reports.time.averageHoursBetweenSubmittedAndRestituted.previous.percentage.value = `${indicators.reports.time.averageHoursBetweenSubmittedAndRestituted.previous.percentage.toFixed(0)}%`;
    indicatorsComputed.reports.time.averageHoursBetweenSubmittedAndRestituted.previous.percentage.hideValue = indicators.reports.time.averageHoursBetweenSubmittedAndRestituted.previous.percentage == Infinity || indicators.reports.time.averageHoursBetweenSubmittedAndRestituted.previous.percentage == -Infinity || isNaN(indicators.reports.time.averageHoursBetweenSubmittedAndRestituted.previous.percentage);

    return indicatorsComputed;
})


const comparisonOptions = computed(() => {
    const options = [];
    for (let year = DateTime.now().year; year >= 2023; year--){
        options.push({
            value: `${year}`,
            text: `Todo el ${DateTime.fromObject({year}).toFormat('yyyy')}`
        })

        if (year == DateTime.now().year){
            for (let month = DateTime.now().month; month >= 1; month--){
                options.push({
                    value: `${year}-${month.toString().padStart(2, '0')}`,
                    text: `‎ ‎ ‎ ‎ ${DateTime.fromObject({year, month}).toFormat('MMMM yyyy')}`
                })
            }
        }else{
            for (let month = 12; month >= 1; month--){
                options.push({
                    value: `${year}-${month.toString().padStart(2, '0')}`,
                    text: `‎ ‎ ‎ ‎ ${DateTime.fromObject({year, month}).toFormat('MMMM yyyy')}`
                })
            }
        }
    }
    return options;
})

watch(comparisonDropdownChosen, (value) => {
    if (value == null){
        return;
    }
    loadData();
})

function loadData(){
    isLoading.value = true;
    indicatorsData.value = null;

    if (comparisonDropdownChosen.value?.includes('-')){
        AccountantPeriodComparison.compareYearMonth(parseInt(comparisonDropdownChosen.value.split('-')[0]), parseInt(comparisonDropdownChosen.value.split('-')[1])).then((data) => {
            indicatorsData.value = data;
            isLoading.value = false;
        })
    }else{
        AccountantPeriodComparison.compareYear(parseInt(comparisonDropdownChosen.value)).then((data) => {
            indicatorsData.value = data;
            isLoading.value = false;
        })
    }
}


onMounted(() => {
    comparisonDropdownChosen.value = comparisonOptions.value[1].value;
    
    JobsAndExpenses.getJobs().then((jobsData) => {
        jobs.value = jobsData;
    });
    const callbackId = AppEvents.on('all:reload', () => {
        loadData()
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
