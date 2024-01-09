import { RequestAPI } from "@/utils/Requests/RequestAPI"
import { DateTime } from "luxon"


interface AccountantPeriodSpendingDistributionByUserIndicators{
    user: {
        id: number,
        name: string,
    },
    total: number,
    by: {
        invoices: number,
        workers: number
    }
}
interface AccountantPeriodSpendingDistributionByJobIndicators{
    job: {
        code: string,
        name: string,
    },
    total: number,
    by: {
        invoices: number,
        workers: number
    }
}
interface AccountantPeriodIndicators{
    spendings: {
        total: number,
        by: {
            invoices: number,
            workers: number
        },
        distributions: {
            byJobs: AccountantPeriodSpendingDistributionByJobIndicators[],
            byUsers: AccountantPeriodSpendingDistributionByUserIndicators[]
        },
        perDayAverage: number,
        daily: {
            day: number,
            total: number,
            by: {
                invoices: number,
                workers: number
            }
        }[]
    },
    workers: {
        count: {
            workers: number,
            attendances: number,
            absences: number,
        },
        percentage: {
            attendances: number,
            absences: number,
        },
        spendings: {
            perDayAverage: number
        }
    },
    invoices: {
        count: {
            bills: number,
            factures: number,
            total: number
        },
        spendings: {
            perDayAverage: number
        }
    }
}
class AccountantPeriodGraph{
    private startDate: string;
    private endDate: string;

    public constructor(startDate: string, endDate: string){
        this.startDate = startDate;
        this.endDate = endDate;
    }
    public indicators: AccountantPeriodIndicators = {
        spendings: {
            total: 0,
            by: {
                invoices: 0,
                workers: 0
            },
            distributions: {
                byJobs: [],
                byUsers: []
            },
            daily: [],
            perDayAverage: 0
        },
        workers: {
            count: {
                workers: 0,
                attendances: 0,
                absences: 0,
            },
            percentage: {
                attendances: 0,
                absences: 0,
            },
            spendings: {
                perDayAverage: 0
            }
        },
        invoices: {
            count: {
                bills: 0,
                factures: 0,
                total: 0
            },
            spendings: {
                perDayAverage: 0
            }
        }
    }

    private loadData(): Promise<void>{
        const attendancesByWorker = (async () => {
            const response = await RequestAPI.get('/management/records/attendances/by-worker', {
                start_date: this.startDate,
                end_date: this.endDate
            })
            
            response.data.body.forEach((worker:any) => {
                if (worker.attendances > 0 || worker.absences > 0){
                    this.indicators.workers.count.workers += 1;
                }
                this.indicators.workers.count.attendances += worker.attendances;
                this.indicators.workers.count.absences += worker.absences;
            })

            const totalCallings = this.indicators.workers.count.attendances + this.indicators.workers.count.absences;

            if (totalCallings === 0) {
                this.indicators.workers.percentage.attendances = 0;
                this.indicators.workers.percentage.absences = 0;
                return;
            }
            this.indicators.workers.percentage.attendances = (this.indicators.workers.count.attendances * 100) / totalCallings;
            this.indicators.workers.percentage.absences = (this.indicators.workers.count.absences * 100) / totalCallings;
        })();
        const attendancesByJobs = (async () => {
            const response = await RequestAPI.get('/management/records/attendances/by-jobs', {
                start_date: this.startDate,
                end_date: this.endDate
            })
            
            let sumPerDayAverageSpendingInDollars = 0;
            response.data.body.forEach((workerJobExpense:any) => {
                sumPerDayAverageSpendingInDollars += workerJobExpense.day_work_amount_in_dollars
            })

            if (response.data.body.length == 0){
                this.indicators.workers.spendings.perDayAverage = 0;
                return;
            }
            this.indicators.workers.spendings.perDayAverage = sumPerDayAverageSpendingInDollars / response.data.body.length;
        })();
        const jobsByCosts = (async () => {
            const response = await RequestAPI.get('/management/records/jobs/by-costs', {
                start_date: this.startDate,
                end_date: this.endDate
            })
            
            
            this.indicators.spendings.distributions.byJobs = response.data.body.map((jobCost:any) => {
                return {
                    job: {
                        code: jobCost.job_code,
                        name: jobCost.job_code,
                    },
                    total: jobCost.total_dollars,
                    by: {
                        invoices: jobCost.invoices,
                        workers: jobCost.workers
                    }
                }
            })
        })();
        const usersByCosts = (async () => {
            const response = await RequestAPI.get('/management/records/users/by-costs', {
                start_date: this.startDate,
                end_date: this.endDate
            })

            const spendingsItems:{
                date: string,
                type: string,
                amount: number
            }[] = [];

            const users:AccountantPeriodSpendingDistributionByUserIndicators[] = [];
            response.data.body.forEach((userCost:any) => {
                spendingsItems.push({
                    date: userCost.date,
                    type: userCost.type === 'Worker' ? 'Invoice' : 'Worker',
                    amount: userCost.amount_in_dollars,
                })


                const user = users.find((user:any) => {
                    return user.user.id == userCost.user.id
                });
                if (user){
                    user.total += userCost.amount_in_dollars;
                    if (userCost.type == 'Bill'){
                        user.by.invoices += userCost.amount_in_dollars;
                        this.indicators.invoices.count.bills++;
                        this.indicators.invoices.count.total++;
                        this.indicators.spendings.by.invoices += userCost.amount_in_dollars;
                        this.indicators.spendings.total += userCost.amount_in_dollars;
                    }else if (userCost.type == 'Facture'){
                        user.by.invoices += userCost.amount_in_dollars;
                        this.indicators.invoices.count.factures++;
                        this.indicators.invoices.count.total++;
                        this.indicators.spendings.by.invoices += userCost.amount_in_dollars;
                        this.indicators.spendings.total += userCost.amount_in_dollars;
                    }else if (userCost.type == 'Worker'){
                        user.by.workers += userCost.amount_in_dollars;
                        this.indicators.spendings.by.workers += userCost.amount_in_dollars;
                        this.indicators.spendings.total += userCost.amount_in_dollars;
                    }
                }else{
                    const item = {
                        user: {
                            id: userCost.user.id,
                            name: userCost.user.name,
                        },
                        total: userCost.amount_in_dollars,
                        by: {
                            invoices: 0,
                            workers: 0
                        }
                    };

                    if (userCost.type == 'Bill'){
                        item.by.invoices += userCost.amount_in_dollars;
                        this.indicators.invoices.count.bills++;
                        this.indicators.invoices.count.total++;
                        this.indicators.spendings.by.invoices += userCost.amount_in_dollars;
                        this.indicators.spendings.total += userCost.amount_in_dollars;
                    }else if (userCost.type == 'Facture'){
                        item.by.invoices += userCost.amount_in_dollars;
                        this.indicators.invoices.count.factures++;
                        this.indicators.invoices.count.total++;
                        this.indicators.spendings.by.invoices += userCost.amount_in_dollars;
                        this.indicators.spendings.total += userCost.amount_in_dollars;
                    }else if (userCost.type == 'Worker'){
                        item.by.workers += userCost.amount_in_dollars;
                        this.indicators.spendings.by.workers += userCost.amount_in_dollars;
                        this.indicators.spendings.total += userCost.amount_in_dollars;
                    }

                    users.push(item)
                }
            })
            this.indicators.spendings.distributions.byUsers = users;

            const totalDays = DateTime.fromISO(this.endDate).diff(DateTime.fromISO(this.startDate), 'days').days as number;

            if (totalDays === 0){
                this.indicators.invoices.spendings.perDayAverage = 0;
                return;
            }
            this.indicators.invoices.spendings.perDayAverage = this.indicators.invoices.count.total / totalDays;
            this.indicators.spendings.perDayAverage = this.indicators.spendings.total / totalDays;


            Array.from(Array(totalDays + 1).keys()).map((day) => day + 1).forEach((day) => {
                const daySpendingItems = spendingsItems.filter((spendingItem) => {
                    const date = DateTime.fromISO(spendingItem.date);
                    return date.day === day;
                })
                const daySpendings = daySpendingItems.reduce((accumulator, spendingItem) => {
                    accumulator.total += spendingItem.amount;
                    if (spendingItem.type === 'Invoice'){
                        accumulator.by.invoices += spendingItem.amount;
                    }else if (spendingItem.type === 'Worker'){
                        accumulator.by.workers += spendingItem.amount;
                    }
                    return accumulator;
                }, {
                    day: day,
                    total: 0,
                    by: {
                        invoices: 0,
                        workers: 0
                    }
                })
                this.indicators.spendings.daily.push(daySpendings);
            })
        })();

        return new Promise((resolve) => {
            Promise.all([attendancesByWorker, attendancesByJobs, jobsByCosts, usersByCosts]).then(() => {
                resolve();
            });
        })
    }

    public async generate(): Promise<AccountantPeriodIndicators>{
        await this.loadData();
        return this.indicators;
    }
}





interface AccountantCurrentYearSpendingDistributionByUserIndicators{
    user: {
        id: number,
        name: string,
    },
    total: number,
    by: {
        invoices: number,
        workers: number
    }
}
interface AccountantCurrentYearSpendingDistributionByJobIndicators{
    job: {
        code: string,
        name: string,
    },
    total: number,
    by: {
        invoices: number,
        workers: number
    }
}
interface AccountantCurrentYearIndicators{
    spendings: {
        total: number,
        by: {
            invoices: number,
            workers: number
        },
        distributions: {
            byJobs: AccountantCurrentYearSpendingDistributionByJobIndicators[],
            byUsers: AccountantCurrentYearSpendingDistributionByUserIndicators[]
        },
        inYearMonths: {
            month: number,
            total: number,
            by: {
                invoices: number,
                workers: number
            }
        }[]
    },
    workers: {
        count: {
            workers: number,
            attendances: number,
            absences: number,
        },
        percentage: {
            attendances: number,
            absences: number,
        },
        spendings: {
            perDayAverage: number
        }
    },
    reports: {
        pendingApproval: {
            amount: number,
            count: number,
            items: any[]
        },
        pendingRestitution: {
            amount: number,
            count: number,
            items: any[]
        }
    },
    invoices: {
        count: {
            bills: number,
            factures: number,
            total: number
        },
        spendings: {
            perDayAverage: number
        }
    },
    wallets: {
        pettyCash: {
            givenAmount: {
                average: number,
                sum: number,
                lowest: {
                    user: {
                        id: number,
                        name: string
                    },
                    amount: number
                },
                highest: {
                    user: {
                        id: number,
                        name: string
                    },
                    amount: number
                }
            },
            usagePercentage: {
                average: number,
                lowest: {
                    user: {
                        id: number,
                        name: string
                    },
                    amount: number
                },
                highest: {
                    user: {
                        id: number,
                        name: string
                    },
                    amount: number
                }
            },
            balance: {
                average: number,
                lowest: {
                    user: {
                        id: number,
                        name: string
                    },
                    amount: number
                },
                highest: {
                    user: {
                        id: number,
                        name: string
                    },
                    amount: number
                }
            },
            alerts: {
                count: number,
                users: any[]
            }
        }
    }
}
class AccountantCurrentYearState{
    private year:number;
    private startDate: string;
    private endDate: string;

    public constructor(year: number){
        this.year = year;

        const startDate = DateTime.fromObject({year: this.year, month: 1, day: 1}).toISO() as string;
        const endDate = DateTime.fromObject({year: this.year, month: 12, day: 31}).toISO() as string;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public indicators: AccountantCurrentYearIndicators = {
        spendings: {
            total: 0,
            by: {
                invoices: 0,
                workers: 0
            },
            distributions: {
                byJobs: [],
                byUsers: []
            },
            inYearMonths: []
        },
        workers: {
            count: {
                workers: 0,
                attendances: 0,
                absences: 0,
            },
            percentage: {
                attendances: 0,
                absences: 0,
            },
            spendings: {
                perDayAverage: 0
            }
        },
        reports: {
            pendingApproval: {
                amount: 0,
                count: 0,
                items: [],
            },
            pendingRestitution: {
                amount: 0,
                count: 0,
                items: [],
            }
        },
        wallets: {
            pettyCash: {
                givenAmount: {
                    average: 0,
                    sum: 0,
                    lowest: {
                        user: {
                            id: 0,
                            name: ''
                        },
                        amount: 0
                    },
                    highest: {
                        user: {
                            id: 0,
                            name: ''
                        },
                        amount: 0
                    }
                },
                usagePercentage: {
                    average: 0,
                    lowest: {
                        user: {
                            id: 0,
                            name: 0
                        },
                        amount: 0
                    },
                    highest: {
                        user: {
                            id: 0,
                            name: 0
                        },
                        amount: 0
                    }
                },
                balance: {
                    average: 0,
                    lowest: {
                        user: {
                            id: 0,
                            name: 0
                        },
                        amount: 0
                    },
                    highest: {
                        user: {
                            id: 0,
                            name: 0
                        },
                        amount: 0
                    }
                },
                alerts: {
                    count: 0,
                    users: []
                }
            }
        },
        invoices: {
            count: {
                bills: 0,
                factures: 0,
                total: 0
            },
            spendings: {
                perDayAverage: 0
            }
        }
    }

    private loadData(): Promise<void>{
        const attendancesByWorker = (async () => {
            const response = await RequestAPI.get('/management/records/attendances/by-worker', {
                start_date: this.startDate,
                end_date: this.endDate
            })
            
            response.data.body.forEach((worker:any) => {
                this.indicators.workers.count.workers += 1;
                this.indicators.workers.count.attendances += worker.attendances;
                this.indicators.workers.count.absences += worker.absences;
            })

            const totalCallings = this.indicators.workers.count.attendances + this.indicators.workers.count.absences;

            if (totalCallings === 0) {
                this.indicators.workers.percentage.attendances = 0;
                this.indicators.workers.percentage.absences = 0;
                return;
            }
            this.indicators.workers.percentage.attendances = (this.indicators.workers.count.attendances * 100) / totalCallings;
            this.indicators.workers.percentage.absences = (this.indicators.workers.count.absences * 100) / totalCallings;
        })();
        const attendancesByJobs = (async () => {
            const response = await RequestAPI.get('/management/records/attendances/by-jobs', {
                start_date: this.startDate,
                end_date: this.endDate
            })
            
            let sumPerDayAverageSpendingInDollars = 0;
            response.data.body.forEach((workerJobExpense:any) => {
                sumPerDayAverageSpendingInDollars += workerJobExpense.day_work_amount_in_dollars
            })

            if (response.data.body.length == 0){
                this.indicators.workers.spendings.perDayAverage = 0;
                return;
            }
            this.indicators.workers.spendings.perDayAverage = sumPerDayAverageSpendingInDollars / response.data.body.length;
        })();
        const jobsByCosts = (async () => {
            const response = await RequestAPI.get('/management/records/jobs/by-costs', {
                start_date: this.startDate,
                end_date: this.endDate
            })
            
            
            this.indicators.spendings.distributions.byJobs = response.data.body.map((jobCost:any) => {
                return {
                    job: {
                        code: jobCost.job_code,
                        name: jobCost.job_code,
                    },
                    total: jobCost.total_dollars,
                    by: {
                        invoices: jobCost.invoices,
                        workers: jobCost.workers
                    }
                }
            })
        })();
        const usersByCosts = (async () => {
            const response = await RequestAPI.get('/management/records/users/by-costs', {
                start_date: this.startDate,
                end_date: this.endDate
            })

            const spendingsItems:{
                date: string,
                type: string,
                amount: number
            }[] = [];

            const users:AccountantCurrentYearSpendingDistributionByUserIndicators[] = [];
            response.data.body.forEach((userCost:any) => {

                spendingsItems.push({
                    date: userCost.date,
                    type: userCost.type === 'Worker' ? 'Invoice' : 'Worker',
                    amount: userCost.amount_in_dollars,
                })

                const user = users.find((user:any) => user.id === userCost.user.id);
                if (user){
                    user.total += userCost.amount_in_dollars;
                    if (userCost.type == 'Bill'){
                        user.by.invoices += userCost.amount_in_dollars;
                        this.indicators.invoices.count.bills++;
                        this.indicators.invoices.count.total++;
                        this.indicators.spendings.by.invoices += userCost.amount_in_dollars;
                        this.indicators.spendings.total += userCost.amount_in_dollars;
                    }else if (userCost.type == 'Facture'){
                        user.by.invoices += userCost.amount_in_dollars;
                        this.indicators.invoices.count.factures++;
                        this.indicators.invoices.count.total++;
                        this.indicators.spendings.by.invoices += userCost.amount_in_dollars;
                        this.indicators.spendings.total += userCost.amount_in_dollars;
                    }else if (userCost.type == 'Worker'){
                        user.by.workers += userCost.amount_in_dollars;
                        this.indicators.spendings.by.workers += userCost.amount_in_dollars;
                        this.indicators.spendings.total += userCost.amount_in_dollars;
                    }
                }else{
                    const item = {
                        user: {
                            id: userCost.user.id,
                            name: userCost.user.name,
                        },
                        total: userCost.amount_in_dollars,
                        by: {
                            invoices: 0,
                            workers: 0
                        }
                    };

                    if (userCost.type == 'Bill'){
                        item.by.invoices += userCost.amount_in_dollars;
                        this.indicators.invoices.count.bills++;
                        this.indicators.invoices.count.total++;
                        this.indicators.spendings.by.invoices += userCost.amount_in_dollars;
                        this.indicators.spendings.total += userCost.amount_in_dollars;
                    }else if (userCost.type == 'Facture'){
                        item.by.invoices += userCost.amount_in_dollars;
                        this.indicators.invoices.count.factures++;
                        this.indicators.invoices.count.total++;
                        this.indicators.spendings.by.invoices += userCost.amount_in_dollars;
                        this.indicators.spendings.total += userCost.amount_in_dollars;
                    }else if (userCost.type == 'Worker'){
                        item.by.workers += userCost.amount_in_dollars;
                        this.indicators.spendings.by.workers += userCost.amount_in_dollars;
                        this.indicators.spendings.total += userCost.amount_in_dollars;
                    }

                    users.push(item)
                }
            })
            this.indicators.spendings.distributions.byUsers = users;

            const totalDays = DateTime.fromISO(this.endDate).diff(DateTime.fromISO(this.startDate), 'days').days;

            if (totalDays === 0){
                this.indicators.invoices.spendings.perDayAverage = 0;
                return;
            }
            this.indicators.invoices.spendings.perDayAverage = this.indicators.invoices.count.total / totalDays;


            Array.from(Array(12).keys()).map((month) => month + 1).forEach((month) => {
                const monthSpendingsItems = spendingsItems.filter((spendingItem) => {
                    const date = DateTime.fromISO(spendingItem.date);
                    return date.month === month;
                })
                const monthSpendings = monthSpendingsItems.reduce((accumulator, spendingItem) => {
                    accumulator.total += spendingItem.amount;
                    if (spendingItem.type === 'Invoice'){
                        accumulator.by.invoices += spendingItem.amount;
                    }else if (spendingItem.type === 'Worker'){
                        accumulator.by.workers += spendingItem.amount;
                    }
                    return accumulator;
                }, {
                    month: month,
                    total: 0,
                    by: {
                        invoices: 0,
                        workers: 0
                    }
                })
                this.indicators.spendings.inYearMonths.push(monthSpendings);
            })
        })();
        const balances = (async () => {
            const usersBalances = await RequestAPI.get('/management/balances/users', {
                year: this.year
            });


            const calculatorAverage = {
                pettyCash: {
                    givenAmount: {
                        average: 0,
                        sum: 0,
                    },
                    usagePercentage: {
                        average: 0,
                    },
                    balance: {
                        average: 0,
                    }
                }
            }
            usersBalances.balances.forEach((userBalance:any) => {
                const wallet = userBalance.balance;

                wallet.petty_cash.reports.not_approved.items.forEach((report:any) => {
                    this.indicators.reports.pendingApproval.items.push(report);
                })
                this.indicators.reports.pendingApproval.amount += wallet.petty_cash.reports.not_approved.amount_in.dollars;
                this.indicators.reports.pendingApproval.count += wallet.petty_cash.reports.not_approved.items.length;



                wallet.petty_cash.reports.pending_reposition.items.forEach((report:any) => {
                    this.indicators.reports.pendingRestitution.items.push(report);
                })
                this.indicators.reports.pendingRestitution.amount += wallet.petty_cash.reports.pending_reposition.amount_in.dollars;
                this.indicators.reports.pendingRestitution.count += wallet.petty_cash.reports.pending_reposition.items.length;



                calculatorAverage.pettyCash.givenAmount.average += wallet.petty_cash.given_amount;
                calculatorAverage.pettyCash.givenAmount.sum += wallet.petty_cash.given_amount;
                calculatorAverage.pettyCash.usagePercentage.average += wallet.petty_cash.usage_percentage;
                calculatorAverage.pettyCash.balance.average += wallet.petty_cash.balance;

                if (this.indicators.wallets.pettyCash.givenAmount.lowest.amount === 0 || wallet.petty_cash.given_amount < this.indicators.wallets.pettyCash.givenAmount.lowest.amount){
                    this.indicators.wallets.pettyCash.givenAmount.lowest.amount = wallet.petty_cash.given_amount;
                    this.indicators.wallets.pettyCash.givenAmount.lowest.user.id = userBalance.user.id;
                    this.indicators.wallets.pettyCash.givenAmount.lowest.user.name = userBalance.user.name;
                }
                if (this.indicators.wallets.pettyCash.givenAmount.highest.amount === 0 || wallet.petty_cash.given_amount > this.indicators.wallets.pettyCash.givenAmount.highest.amount){
                    this.indicators.wallets.pettyCash.givenAmount.highest.amount = wallet.petty_cash.given_amount;
                    this.indicators.wallets.pettyCash.givenAmount.highest.user.id = userBalance.user.id;
                    this.indicators.wallets.pettyCash.givenAmount.highest.user.name = userBalance.user.name;
                }

                //Set alerts. The alert is based on the usage percentage, if is above 80%, the alert is set.
                if (wallet.petty_cash.usage_percentage >= 80){
                    this.indicators.wallets.pettyCash.alerts.count++;
                    this.indicators.wallets.pettyCash.alerts.users.push({
                        id: userBalance.user.id,
                        name: userBalance.user.name,
                        percentage: wallet.petty_cash.usage_percentage
                    })
                }
            })




            if (usersBalances.balances.length == 0){
                return;
            }
            this.indicators.wallets.pettyCash.givenAmount.average = calculatorAverage.pettyCash.givenAmount.average / usersBalances.balances.length;
            this.indicators.wallets.pettyCash.givenAmount.sum = calculatorAverage.pettyCash.givenAmount.sum;
            this.indicators.wallets.pettyCash.usagePercentage.average = calculatorAverage.pettyCash.usagePercentage.average / usersBalances.balances.length;
            this.indicators.wallets.pettyCash.balance.average = calculatorAverage.pettyCash.balance.average / usersBalances.balances.length;
        })();



        return new Promise((resolve) => {
            Promise.all([attendancesByWorker, attendancesByJobs, jobsByCosts, usersByCosts, balances]).then(() => {
                resolve();
            });
        })
    }



    public async generate(): Promise<AccountantCurrentYearIndicators>{
        await this.loadData();
        return this.indicators;
    }


    public static async getIndicators(year: number): Promise<AccountantCurrentYearIndicators>{
        const graph = new AccountantCurrentYearState(year);
        return await graph.generate();
    }
}



interface AccountantPeriodSpendingDistributionByUserComparisonIndicators{
    user: {
        id: number,
        name: string,
    },
    total: {
        value: number,
        previous: {
            value: number,
            percentage: number
        }
    },
    by: {
        invoices: {
            value: number,
            previous: {
                value: number,
                percentage: number
            }
        },
        workers: {
            value: number,
            previous: {
                value: number,
                percentage: number
            }
        }
    }
}
interface AccountantPeriodSpendingDistributionByJobComparisonIndicators{
    job: {
        code: string,
        name: string,
    },
    total: {
        value: number,
        previous: {
            value: number,
            percentage: number
        }
    },
    by: {
        invoices: {
            value: number,
            previous: {
                value: number,
                percentage: number
            }
        },
        workers: {
            value: number,
            previous: {
                value: number,
                percentage: number
            }
        }
    }
}
interface AccountantPeriodComparisonIndicators{
    spendings: {
        total: {
            value: number,
            previous: {
                value: number,
                percentage: number
            }
        },
        by: {
            invoices: {
                value: number,
                previous: {
                    value: number,
                    percentage: number
                }
            },
            workers: {
                value: number,
                previous: {
                    value: number,
                    percentage: number
                }
            }
        },
        distributions: {
            byJobs: AccountantPeriodSpendingDistributionByJobComparisonIndicators[],
            byUsers: AccountantPeriodSpendingDistributionByUserComparisonIndicators[]
        },
        perDayAverage: {
            value: number,
            previous: {
                value: number,
                percentage: number
            }
        },
        daily: {
            current: { day: number; total: number; by: { invoices: number; workers: number; }; }[],
            previous: { day: number; total: number; by: { invoices: number; workers: number; }; }[]
        }
    },
    workers: {
        count: {
            workers: {
                value: number,
                previous: {
                    value: number,
                    percentage: number
                }
            },
            attendances: {
                value: number,
                previous: {
                    value: number,
                    percentage: number
                }
            },
            absences: {
                value: number,
                previous: {
                    value: number,
                    percentage: number
                }
            },
        },
        percentage: {
            attendances: {
                value: number,
                previous: {
                    value: number,
                    percentage: number
                }
            },
            absences: {
                value: number,
                previous: {
                    value: number,
                    percentage: number
                }
            },
        },
        spendings: {
            perDayAverage: {
                value: number,
                previous: {
                    value: number,
                    percentage: number
                }
            }
        }
    },
    invoices: {
        count: {
            bills: {
                value: number,
                previous: {
                    value: number,
                    percentage: number
                }
            },
            factures: {
                value: number,
                previous: {
                    value: number,
                    percentage: number
                }
            },
            total: {
                value: number,
                previous: {
                    value: number,
                    percentage: number
                }
            }
        },
        spendings: {
            perDayAverage: {
                value: number,
                previous: {
                    value: number,
                    percentage: number
                }
            }
        }
    }
}
class AccountantPeriodComparison{
    private currentPeriod: AccountantPeriodGraph;
    private previousPeriod: AccountantPeriodGraph;

    public constructor(currentPeriod: AccountantPeriodGraph, previousPeriod: AccountantPeriodGraph){
        this.currentPeriod = currentPeriod;
        this.previousPeriod = previousPeriod;
    }


    private loadPeriods():Promise<void>{
        return new Promise((resolve) => {
            Promise.all([this.currentPeriod.generate(), this.previousPeriod.generate()]).then(() => {
                resolve();
            })
        })
    }

    public async generate(): Promise<AccountantPeriodComparisonIndicators>{
        return new Promise(async (resolve) => {
            await this.loadPeriods();
            
            const indicators:AccountantPeriodComparisonIndicators = {
                spendings: {
                    total: {
                        value: this.currentPeriod.indicators.spendings.total,
                        previous: {
                            value: this.previousPeriod.indicators.spendings.total,
                            percentage: this.previousPeriod.indicators.spendings.total >= 0 ? ((this.currentPeriod.indicators.spendings.total - this.previousPeriod.indicators.spendings.total) / this.previousPeriod.indicators.spendings.total) * 100 : 0
                        }
                    },
                    by: {
                        invoices: {
                            value: this.currentPeriod.indicators.spendings.by.invoices,
                            previous: {
                                value: this.previousPeriod.indicators.spendings.by.invoices,
                                percentage: this.previousPeriod.indicators.spendings.by.invoices >= 0 ? ((this.currentPeriod.indicators.spendings.by.invoices - this.previousPeriod.indicators.spendings.by.invoices) / this.previousPeriod.indicators.spendings.by.invoices) * 100 : 0
                            }
                        },
                        workers: {
                            value: this.currentPeriod.indicators.spendings.by.workers,
                            previous: {
                                value: this.previousPeriod.indicators.spendings.by.workers,
                                percentage: this.previousPeriod.indicators.spendings.by.workers >= 0 ? ((this.currentPeriod.indicators.spendings.by.workers - this.previousPeriod.indicators.spendings.by.workers) / this.previousPeriod.indicators.spendings.by.workers) * 100 : 0
                            }
                        }
                    },
                    distributions: {
                        byJobs: this.currentPeriod.indicators.spendings.distributions.byJobs.map((jobCost:AccountantPeriodSpendingDistributionByJobIndicators) => {
                            const previousJobCost = this.previousPeriod.indicators.spendings.distributions.byJobs.find((previousJobCost:any) => previousJobCost.job.code === jobCost.job.code) as unknown as AccountantPeriodSpendingDistributionByJobIndicators;
                            return {
                                job: {
                                    code: jobCost.job.code,
                                    name: jobCost.job.code,
                                },
                                total: {
                                    value: jobCost.total,
                                    previous: {
                                        value: previousJobCost ? previousJobCost.total : 0,
                                        percentage: previousJobCost ? (previousJobCost.total >= 0 ? ((jobCost.total - previousJobCost.total) / previousJobCost.total) * 100 : 0) : 0
                                    }
                                },
                                by: {
                                    invoices: {
                                        value: jobCost.by.invoices,
                                        previous: {
                                            value: previousJobCost ? previousJobCost.by.invoices : 0,
                                            percentage: previousJobCost ? (previousJobCost.by.invoices >= 0 ? ((jobCost.by.invoices - previousJobCost.by.invoices) / previousJobCost.by.invoices) * 100 : 0) : 0
                                        }
                                    },
                                    workers: {
                                        value: jobCost.by.workers,
                                        previous: {
                                            value: previousJobCost ? previousJobCost.by.workers : 0,
                                            percentage: previousJobCost ? (previousJobCost.by.workers >= 0 ? ((jobCost.by.workers - previousJobCost.by.workers) / previousJobCost.by.workers) * 100 : 0) : 0
                                        }
                                    }
                                }
                            }
                        }),
                        byUsers: this.currentPeriod.indicators.spendings.distributions.byUsers.map((userCost:AccountantPeriodSpendingDistributionByUserIndicators) => {
                            const previousUserCost = this.previousPeriod.indicators.spendings.distributions.byUsers.find((previousUserCost:any) => previousUserCost.user.id === userCost.user.id) as unknown as AccountantPeriodSpendingDistributionByUserIndicators;
                            return {
                                user: {
                                    id: userCost.user.id,
                                    name: userCost.user.name,
                                },
                                total: {
                                    value: userCost.total,
                                    previous: {
                                        value: previousUserCost ? previousUserCost.total : 0,
                                        percentage: previousUserCost ? (previousUserCost.total >= 0 ? ((userCost.total - previousUserCost.total) / previousUserCost.total) * 100 : 0) : 0
                                    }
                                },
                                by: {
                                    invoices: {
                                        value: userCost.by.invoices,
                                        previous: {
                                            value: previousUserCost ? previousUserCost.by.invoices : 0,
                                            percentage: previousUserCost ? (previousUserCost.by.invoices >= 0 ? ((userCost.by.invoices - previousUserCost.by.invoices) / previousUserCost.by.invoices) * 100 : 0) : 0
                                        }
                                    },
                                    workers: {
                                        value: userCost.by.workers,
                                        previous: {
                                            value: previousUserCost ? previousUserCost.by.workers : 0,
                                            percentage: previousUserCost ? (previousUserCost.by.workers >= 0 ? ((userCost.by.workers - previousUserCost.by.workers) / previousUserCost.by.workers) * 100 : 0) : 0
                                        }
                                    }
                                }
                            }
                        })
                    },
                    perDayAverage: {
                        value: this.currentPeriod.indicators.spendings.perDayAverage,
                        previous: {
                            value: this.previousPeriod.indicators.spendings.perDayAverage,
                            percentage: this.previousPeriod.indicators.spendings.perDayAverage >= 0 ? ((this.currentPeriod.indicators.spendings.perDayAverage - this.previousPeriod.indicators.spendings.perDayAverage) / this.previousPeriod.indicators.spendings.perDayAverage) * 100 : 0
                        }
                    },
                    daily: {
                        current: this.currentPeriod.indicators.spendings.daily,
                        previous: this.previousPeriod.indicators.spendings.daily
                    }
                },
                workers: {
                    count: {
                        workers: {
                            value: this.currentPeriod.indicators.workers.count.workers,
                            previous: {
                                value: this.previousPeriod.indicators.workers.count.workers,
                                percentage: this.previousPeriod.indicators.workers.count.workers >= 0 ? ((this.currentPeriod.indicators.workers.count.workers - this.previousPeriod.indicators.workers.count.workers) / this.previousPeriod.indicators.workers.count.workers) * 100 : 0
                            }
                        },
                        attendances: {
                            value: this.currentPeriod.indicators.workers.count.attendances,
                            previous: {
                                value: this.previousPeriod.indicators.workers.count.attendances,
                                percentage: this.previousPeriod.indicators.workers.count.attendances >= 0 ? ((this.currentPeriod.indicators.workers.count.attendances - this.previousPeriod.indicators.workers.count.attendances) / this.previousPeriod.indicators.workers.count.attendances) * 100 : 0
                            }
                        },
                        absences: {
                            value: this.currentPeriod.indicators.workers.count.absences,
                            previous: {
                                value: this.previousPeriod.indicators.workers.count.absences,
                                percentage: this.previousPeriod.indicators.workers.count.absences >= 0 ? ((this.currentPeriod.indicators.workers.count.absences - this.previousPeriod.indicators.workers.count.absences) / this.previousPeriod.indicators.workers.count.absences) * 100 : 0
                            }
                        },
                    },
                    percentage: {
                        attendances: {
                            value: this.currentPeriod.indicators.workers.percentage.attendances,
                            previous: {
                                value: this.previousPeriod.indicators.workers.percentage.attendances,
                                percentage: this.previousPeriod.indicators.workers.percentage.attendances >= 0 ? ((this.currentPeriod.indicators.workers.percentage.attendances - this.previousPeriod.indicators.workers.percentage.attendances) / this.previousPeriod.indicators.workers.percentage.attendances) * 100 : 0
                            }
                        },
                        absences: {
                            value: this.currentPeriod.indicators.workers.percentage.absences,
                            previous: {
                                value: this.previousPeriod.indicators.workers.percentage.absences,
                                percentage: this.previousPeriod.indicators.workers.percentage.absences >= 0 ? ((this.currentPeriod.indicators.workers.percentage.absences - this.previousPeriod.indicators.workers.percentage.absences) / this.previousPeriod.indicators.workers.percentage.absences) * 100 : 0
                            }
                        },
                    },
                    spendings: {
                        perDayAverage: {
                            value: this.currentPeriod.indicators.workers.spendings.perDayAverage,
                            previous: {
                                value: this.previousPeriod.indicators.workers.spendings.perDayAverage,
                                percentage: this.previousPeriod.indicators.workers.spendings.perDayAverage >= 0 ? ((this.currentPeriod.indicators.workers.spendings.perDayAverage - this.previousPeriod.indicators.workers.spendings.perDayAverage) / this.previousPeriod.indicators.workers.spendings.perDayAverage) * 100 : 0
                            }
                        }
                    }
                },
                invoices: {
                    count: {
                        bills: {
                            value: this.currentPeriod.indicators.invoices.count.bills,
                            previous: {
                                value: this.previousPeriod.indicators.invoices.count.bills,
                                percentage: this.previousPeriod.indicators.invoices.count.bills >= 0 ? ((this.currentPeriod.indicators.invoices.count.bills - this.previousPeriod.indicators.invoices.count.bills) / this.previousPeriod.indicators.invoices.count.bills) * 100 : 0
                            }
                        },
                        factures: {
                            value: this.currentPeriod.indicators.invoices.count.factures,
                            previous: {
                                value: this.previousPeriod.indicators.invoices.count.factures,
                                percentage: this.previousPeriod.indicators.invoices.count.factures >= 0 ? ((this.currentPeriod.indicators.invoices.count.factures - this.previousPeriod.indicators.invoices.count.factures) / this.previousPeriod.indicators.invoices.count.factures) * 100 : 0
                            }
                        },
                        total: {
                            value: this.currentPeriod.indicators.invoices.count.total,
                            previous: {
                                value: this.previousPeriod.indicators.invoices.count.total,
                                percentage: this.previousPeriod.indicators.invoices.count.total >= 0 ? ((this.currentPeriod.indicators.invoices.count.total - this.previousPeriod.indicators.invoices.count.total) / this.previousPeriod.indicators.invoices.count.total) * 100 : 0
                            }
                        }
                    },
                    spendings: {
                        perDayAverage: {
                            value: this.currentPeriod.indicators.invoices.spendings.perDayAverage,
                            previous: {
                                value: this.previousPeriod.indicators.invoices.spendings.perDayAverage,
                                percentage: this.previousPeriod.indicators.invoices.spendings.perDayAverage >= 0 ? ((this.currentPeriod.indicators.invoices.spendings.perDayAverage - this.previousPeriod.indicators.invoices.spendings.perDayAverage) / this.previousPeriod.indicators.invoices.spendings.perDayAverage) * 100 : 0
                            }
                        }
                    }
                }
            }

            resolve(indicators);
        })
    }

    public static async compareYearMonth(year: number, month: number): Promise<AccountantPeriodComparisonIndicators>{
        const currentPeriodData = {
            startDate: DateTime.fromObject({year: year, month: month, day: 1}),
            endDate: DateTime.fromObject({year: year, month: month, day: DateTime.fromObject({year: year, month: month}).daysInMonth})
        }
        const previousPeriodData = {
            startDate: currentPeriodData.startDate.minus({months: 1}),
            endDate: currentPeriodData.endDate.minus({months: 1})
        }
        const currentPeriod = new AccountantPeriodGraph(currentPeriodData.startDate.toISO() as string, currentPeriodData.endDate.toISO() as string);
        const previousPeriod = new AccountantPeriodGraph(previousPeriodData.startDate.toISO() as string, previousPeriodData.endDate.toISO() as string);
        return await new AccountantPeriodComparison(currentPeriod, previousPeriod).generate();
    }
    public static async compareYear(year: number): Promise<AccountantPeriodComparisonIndicators>{
        const currentPeriodData = {
            startDate: DateTime.fromObject({year: year, month: 1, day: 1}),
            endDate: DateTime.fromObject({year: year, month: 12, day: 31})
        }
        const previousPeriodData = {
            startDate: currentPeriodData.startDate.minus({years: 1}),
            endDate: currentPeriodData.endDate.minus({years: 1})
        }
        const currentPeriod = new AccountantPeriodGraph(currentPeriodData.startDate.toISO() as string, currentPeriodData.endDate.toISO() as string);
        const previousPeriod = new AccountantPeriodGraph(previousPeriodData.startDate.toISO() as string, previousPeriodData.endDate.toISO() as string);
        return await new AccountantPeriodComparison(currentPeriod, previousPeriod).generate();
    }
}

export {  AccountantCurrentYearState, AccountantPeriodComparison }
export type { AccountantPeriodComparisonIndicators, AccountantCurrentYearIndicators }