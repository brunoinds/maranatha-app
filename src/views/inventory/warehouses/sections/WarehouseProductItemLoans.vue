<template>
    <section class="content">
        <ion-progress-bar v-if="isLoading" type="indeterminate"></ion-progress-bar>

        <div class="ion-padding">
            <ion-segment v-model="selectedView">
                <ion-segment-button value="ByUsers">
                    <ion-label>Por Usuarios</ion-label>
                </ion-segment-button>
                <ion-segment-button value="ByJobs">
                    <ion-label>Por Jobs</ion-label>
                </ion-segment-button>
            </ion-segment>
        </div>
        

        <article v-if="selectedView == 'ByUsers'">
            <ion-accordion-item v-for="item in loansGroupedByRequestUI" :key="item.user.id" :value="item.user.id">
                <template v-slot:head>
                    <ion-item button>
                        <ion-icon :icon="personOutline" slot="start"></ion-icon>
                        <ion-label>
                            <h2><b>{{ item.user.name }}</b></h2>
                            <p>@{{ item.user.username }}</p>
                        </ion-label>
                    </ion-item>
                </template>
                
                <template #body>
                    <div class="ion-padding">
                        <DynamicScroller
                            :items="item.loansGrouped"
                            :min-item-size="70"
                            class="scroller"
                            :buffer="15"
                        >
                            <template v-slot="{ item, index, active }">
                                <DynamicScrollerItem
                                    :item="item"
                                    :active="active"
                                    :data-index="index"
                                >
                                    <ion-item button @click="(item.isGrouped) ? openWarehouseLoans(item.loans) : openWarehouseLoan(item.main)">
                                        <ion-avatar slot="start" v-if="item.main.product_item?.product.image">
                                            <img :src="item.main.product_item.product.image" />
                                        </ion-avatar>
                                        <ion-label>
                                            <h2><b>{{ item.main.product_item?.product.name }}</b></h2>
                                            <p>{{ item.main.product_item?.product.description }}</p>
                                            <p>{{ item.main.product_item?.product.brand }}</p>
                                            <h3>{{ (new Date(item.main.loaned_at || '').toLocaleDateString()) }}</h3>
                                            <p><b>Pedido:</b> #00{{item.main.inventory_warehouse_outcome_request_id }}</p>

                                            <p><b>Job:</b> {{ item.main.job.code }} - {{ item.main.job.name }}</p>
                                            <p><b>Expense:</b> {{ item.main.expense.code }} - {{ item.main.expense.name }}</p>
                                            <div class="grouped-status-chip" v-if="item.isGrouped">
                                                <ProductItemLoanStatusChip v-for="request in item.statuses" :request="request" slot="end" />
                                            </div>
                                        </ion-label>
                                        <ProductItemLoanStatusChip v-if="!item.isGrouped" v-for="request in item.statuses" :request="request" slot="end" />

                                        <ion-note v-if="item.isGrouped" slot="end" color="primary">x{{ item.loans.length }}</ion-note>
                                    </ion-item>
                                </DynamicScrollerItem>
                            </template>
                        </DynamicScroller>
                    </div>
                </template>
            </ion-accordion-item>
        </article>
        <article v-if="selectedView == 'ByJobs'">
            <ion-accordion-item v-for="job in loansGroupedByJobsUI" :key="job.job?.code" :value="job.job?.code">
                <template v-slot:head>
                    <ion-item button>
                        <ion-label>
                            <h2><b>{{ job.job?.code }} - {{ job.job?.name }}</b></h2>
                            <p>{{ job.loans.length }} préstamos</p>
                        </ion-label>
                    </ion-item>
                </template>
                
                <template #body>
                    <div class="ion-padding">
                        <DynamicScroller
                            :items="job.loans"
                            :min-item-size="70"
                            class="scroller"
                            :buffer="15"
                        >
                            <template v-slot="{ item, index, active }">
                                <DynamicScrollerItem
                                    :item="item"
                                    :active="active"
                                    :data-index="index"
                                >
                                    <ion-item button @click="openWarehouseLoan(item)">
                                        <ion-avatar slot="start" v-if="item.product_item?.product.image">
                                            <img :src="item.product_item.product.image" />
                                        </ion-avatar>
                                        <ion-label>
                                            <h2><b>{{ item.product_item?.product.name }}</b></h2>
                                            <p>{{ item.product_item?.product.description }}</p>
                                            <p>{{ item.product_item?.product.brand }}</p>
                                            <h3>{{ (new Date(item.loaned_at || '').toLocaleDateString()) }}</h3>
                                            <p><b>Pedido:</b> #00{{item.inventory_warehouse_outcome_request_id }}</p>

                                            <p><b>Para:</b> {{ item.loaned_to?.name }}</p>

                                            <p><b>Job:</b> {{ item.job.code }} - {{ item.job.name }}</p>
                                            <p><b>Expense:</b> {{ item.expense.code }} - {{ item.expense.name }}</p>
                                        </ion-label>
                                        <ProductItemLoanStatusChip :request="item" slot="end" />
                                    </ion-item>
                                </DynamicScrollerItem>
                            </template>
                        </DynamicScroller>
                    </div>
                </template>
            </ion-accordion-item>
        </article>
    </section>


    <ion-fab slot="fixed" vertical="bottom" horizontal="end" :edge="false" v-if="false">
        <ion-fab-button @click="createWarehouseLoan">
            <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
    </ion-fab>
</template>


<script setup lang="ts">

import IonAccordionItem from '@/components/IonAccordionItem/IonAccordionItem.vue';
import ProductItemLoanStatusChip from '@/components/ProductItemLoanStatusChip/ProductItemLoanStatusChip.vue';
import CreateInventoryWarehouseLoan from '@/dialogs/CreateInventoryWarehouseLoan/CreateInventoryWarehouseLoan.vue';
import EditInventoryWarehouseLoan from '@/dialogs/EditInventoryWarehouseLoan/EditInventoryWarehouseLoan.vue';
import ShowListLoans from '@/dialogs/ShowListLoans/ShowListLoans.vue';
import { IWarehouse, IWarehouseProductItemLoan } from '@/interfaces/InventoryInterfaces';
import { IExpense, IJob } from '@/interfaces/JobsAndExpensesInterfaces';
import { IUser } from '@/interfaces/UserInterfaces';
import { AppEvents } from '@/utils/AppEvents/AppEvents';
import { Dialog } from '@/utils/Dialog/Dialog';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { JobsAndExpenses } from '@/utils/Stored/JobsAndExpenses';
import { Viewport } from '@/utils/Viewport/Viewport';
import { IonAvatar, IonFab, IonFabButton, IonIcon, IonItem, IonSearchbar, IonLabel, IonProgressBar, IonAccordion, IonAccordionGroup, IonList, IonNote, IonSegment, IonSegmentButton } from '@ionic/vue';
import { addOutline, personOutline } from 'ionicons/icons';
import _ from 'lodash';
import { DateTime } from 'luxon';
import { PropType, computed, onMounted, onUnmounted, ref } from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';

const isLoading = ref<boolean>(false);
const props = defineProps({
    warehouse: {
        type: Object as PropType<IWarehouse>,
        required: true
    }
});


const selectedView = ref<'ByUsers'|'ByJobs'>('ByUsers');


const dynamicData = ref({
    query: ''
})
const jobsAndExpenses = ref<{jobs: Array<IJob>, expenses: Array<IExpense>}>({
    jobs: [],
    expenses: []
});
const loansData = ref<IWarehouseProductItemLoan[]>([]);
const loansByUsersData = ref<Array<{
    user: IUser,
    loans: IWarehouseProductItemLoan[]
}>>([]);

/* const loansUI = computed(() => {
    return loansData.value.filter((loan) => {
        if (dynamicData.value.query.trim().length == 0) return true;

        return loan.product_item?.product.name.toLowerCase().includes(dynamicData.value.query.toLowerCase())
    }).map((loan) => {
        return {
            ...loan,
            date: new Date(loan.loaned_at || '').toLocaleDateString(),
            original: loan
        }
    }).sort((a, b) => b.id - a.id);
});
 */
const openWarehouseLoans = async (loans: IWarehouseProductItemLoan[]) => {
    Dialog.show(ShowListLoans, {
        props: {
            productsItemsLoans: loans,
        },
        onLoaded($this) {
            
        }
    })
} 
const openWarehouseLoan = (loan: IWarehouseProductItemLoan) => {
    Dialog.show(EditInventoryWarehouseLoan, {
        props: {
            productItemLoanId: loan.id,
        },
        onLoaded($this) {
            
        },
        modalControllerOptions: {

        }
    })
}

const loansGroupedByRequestUI = computed(() => {
    return loansByUsersData.value.map((item) => {
        return {
            ...item,
            loansGrouped: (() => {
                const loansData = item.loans;
                const grouped = _.groupBy(loansData.map((loan) => {
                    return {
                        ...loan,
                        grouper: loan.inventory_warehouse_outcome_request_id + '/-/' + loan.product_item?.inventory_product_id,
                        original: loan
                    }
                }), 'grouper')

                return Object.keys(grouped).map((group) => {
                    const loans = grouped[group].map(item => item.original).map((loan) => {
                        return {
                            ...loan,
                            job: jobsAndExpenses.value.jobs.find((job) => job.code == loan.job_code),
                            expense: jobsAndExpenses.value.expenses.find((expense) => expense.code == loan.expense_code),
                        }
                    });

                    return {
                        id: group,
                        group: group,
                        main: loans[0],
                        loans: loans,
                        isGrouped: loans.length > 1,
                        statuses: _.uniq(loans.map((loan) => loan.status)).map((status) => {
                            return loans.find((loan) => loan.status == status)
                        })
                    }
                })
            })()
        }
    })
})

const loansGroupedByJobsUI = computed(() => {
    let loans:IWarehouseProductItemLoan[] = [];
    loansByUsersData.value.forEach((user) => {
        loans.push(...user.loans)
    })

    return Object.keys(_.groupBy(loans, 'job_code')).map((jobCode) => {
        return {
            job: jobsAndExpenses.value.jobs.find((job) => job.code == jobCode),
            loans: loans.filter((loan) => loan.job_code == jobCode).map((loan) => {
                return {
                    ...loan,
                    job: jobsAndExpenses.value.jobs.find((job) => job.code == loan.job_code),
                    expense: jobsAndExpenses.value.expenses.find((expense) => expense.code == loan.expense_code)
                }
            })
        }
    });
})

const loadLoans = async () => {
    isLoading.value = true;
    const response = await RequestAPI.get(`/inventory/warehouses/${props.warehouse.id}/loans`);
    loansData.value = response;
    isLoading.value = false;
}
const loadLoansByUsers = async () => {
    isLoading.value = true;
    const response = await RequestAPI.get(`/inventory/warehouses/${props.warehouse.id}/loans-by-users`);
    loansByUsersData.value = response;
    isLoading.value = false;
}
const loadJobsAndExpenses = async () => {
    const jobs =  await JobsAndExpenses.getJobs() as unknown as Array<IJob>;
    jobsAndExpenses.value.jobs = jobs

    const expenses = await JobsAndExpenses.getExpenses() as unknown as Array<IExpense>;
    jobsAndExpenses.value.expenses = expenses;
}
const createWarehouseLoan = () => {
    Dialog.show(CreateInventoryWarehouseLoan, {
        props: {
            warehouseId: props.warehouse.id
        },
        onLoaded($this) {
            $this.on('created', (event:any) => {
                loadLoans()
            })
        },
        modalControllerOptions: {
            //presentingElement: props.page,
            //showBackdrop: true,
        }
    })
}

onMounted(() => {
    loadLoansByUsers();
    loadJobsAndExpenses();
    const callbackId = AppEvents.on('inventory:reload', () => {
        loadLoansByUsers()
    })
    onUnmounted(() => {
        AppEvents.off('inventory:reload', callbackId);
    })
});
</script>

<style scoped lang="scss">

.grouped-status-chip{
    display: flex;
    align-items: center;
    gap: 5px;
    padding-top: 5px;
    > article{
        :deep(ion-chip){
            margin: 0;
        }
    }
    
}
.content{
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
}
ion-fab[slot="fixed"]{
    position: fixed;
}

.scroller {
    height: calc(92vh - 198px);
}
</style>

