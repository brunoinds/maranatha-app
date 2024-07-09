import { IJob, IExpense } from "@/interfaces/JobsAndExpensesInterfaces";
import { RequestAPI } from "@/utils/Requests/RequestAPI";
import { TStorage } from "@/utils/Toolbox/TStorage";

class JobsAndExpenses{
    private static jobs: Array<IJob>|null = null;
    private static expenses: Array<IExpense>|null = null
    
    public static getJobs(): Promise<Array<IJob>>{
        return new Promise((resolve, reject) => {
            if (JobsAndExpenses.jobs){
                resolve(JobsAndExpenses.jobs);
            }else{
                JobsAndExpenses.getContents().then(() => {
                    resolve(JobsAndExpenses.jobs as Array<IJob>);
                }).catch(() => {
                    reject();
                })
            }
        })
    }
    public static getExpenses(): Promise<Array<IExpense>>{
        return new Promise((resolve, reject) => {
            if (JobsAndExpenses.expenses){
                resolve(JobsAndExpenses.expenses);
            }else{
                JobsAndExpenses.getContents().then(() => {
                    resolve(JobsAndExpenses.expenses as Array<IExpense>);
                }).catch(() => {
                    reject();
                })
            }
        })
    }

    public static getJobsAndExpenses(): Promise<{jobs: Array<IJob>, expenses: Array<IExpense>}>{
        return new Promise((resolve, reject) => {
            if (JobsAndExpenses.jobs && JobsAndExpenses.expenses){
                resolve({
                    jobs: JobsAndExpenses.jobs,
                    expenses: JobsAndExpenses.expenses
                });
            }else{
                JobsAndExpenses.getContents().then(() => {
                    resolve({
                        jobs: JobsAndExpenses.jobs as Array<IJob>,
                        expenses: JobsAndExpenses.expenses as Array<IExpense>
                    });
                }).catch(() => {
                    reject();
                })
            }
        })
    }

    private static getContents(): Promise<void>{
        return new Promise((resolve, reject) => {
            if (navigator.onLine){
                JobsAndExpenses.getContentsFromServer().then(() => {
                    resolve();
                }).catch(() => {
                    reject();
                })
            }else{
                JobsAndExpenses.getContentsFromLocalStorage().then(() => {
                    resolve();
                }).catch(() => {
                    reject();
                })
            }
        })
    }

    private static getContentsFromLocalStorage(): Promise<void>{
        return new Promise((resolve) => {
            TStorage.load('JobsAndExpenses', {
                jobs: [],
                expenses: []
            }).then((bucket) => {
                JobsAndExpenses.jobs = bucket.data.jobs.sort((a, b) => {
                    //Rules, in first place, all the jobs that starts with code 000 (asc), then the codes that starts with "2" (desc) and then all the others in desc order:
                    if (a.code.startsWith("000") && !b.code.startsWith("000")){
                        return -1;
                    }else if (!a.code.startsWith("000") && b.code.startsWith("000")){
                        return 1;
                    }else if (a.code.startsWith("000") && b.code.startsWith("000")){
                        return a.code > b.code ? 1 : -1;
                    }
                    if (a.code.startsWith("2") && !b.code.startsWith("2")){
                        return -1;
                    }else if (!a.code.startsWith("2") && b.code.startsWith("2")){
                        return 1;
                    }else if (a.code.startsWith("2") && b.code.startsWith("2")){
                        return a.code < b.code ? 1 : -1;
                    }
                    return a.code < b.code ? 1 : -1;
                });;
                JobsAndExpenses.expenses = bucket.data.expenses.sort((a, b) => {
                    return a.code < b.code ? -1 : 1;
                });
                resolve();
            })
        })
    }

    private static getContentsFromServer(): Promise<void>{
        return new Promise(async (resolve, reject) => {
            const jobs = await RequestAPI.get("/jobs") as unknown as Array<IJob>;
            const expenses = await RequestAPI.get("/expenses") as unknown as Array<IExpense>;

            TStorage.load('JobsAndExpenses', {
                jobs: [],
                expenses: []
            }).then((bucket) => {
                bucket.data.jobs = jobs;
                bucket.data.expenses = expenses;
                bucket.save().then(() => {
                    JobsAndExpenses.getContentsFromLocalStorage().then(() => {
                        resolve();
                    })
                })
            })
        })
    }

    public static getJob(code: string): Promise<IJob>{
        return new Promise((resolve, reject) => {
            JobsAndExpenses.getJobs().then((jobs) => {
                const job = jobs.find((job) => job.code === code);
                if (job){
                    resolve(job);
                }else{
                    reject();
                }
            }).catch(() => {
                reject();
            })
        })
    }
    public static getExpense(code: string): Promise<IExpense>{
        return new Promise((resolve, reject) => {
            JobsAndExpenses.getExpenses().then((expenses) => {
                const expense = expenses.find((expense) => expense.code === code);
                if (expense){
                    resolve(expense);
                }else{
                    reject();
                }
            }).catch(() => {
                reject();
            })
        })
    }

    public static refresh(): Promise<void>{
        return new Promise((resolve, reject) => {
            JobsAndExpenses.getContentsFromServer().then(() => {
                resolve();
            }).catch(() => {
                reject();
            })
        })
    }
}


export { JobsAndExpenses }