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
                JobsAndExpenses.jobs = bucket.data.jobs;
                JobsAndExpenses.expenses = bucket.data.expenses;
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
}


export { JobsAndExpenses }