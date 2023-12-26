import { EMoneyType, EReportStatus, EReportType } from "@/interfaces/ReportInterfaces";
import { RequestAPI } from "@/utils/Requests/RequestAPI";
import { Session } from "@/utils/Session/Session";
import { TStorage } from "@/utils/Toolbox/TStorage";


interface IReportResponse{
    id: number;
    created_at: string;
    updated_at: string;
    user_id: number;
    title: string;
    from_date: string;
    to_date: string;
    status: EReportStatus;
    exported_pdf: string|null;
    type: EReportType;
    money_type: EMoneyType;
    rejection_reason: string|null;
    rejected_at: string|null;
    approved_at: string|null;
    submitted_at: string|null;
    invoices: {
        count: number;
        total_amount: number;
    }
}

class StoredReports{
    private static isUpdatingPending: boolean = false;
    public static getReports(): Promise<Array<IReportResponse>>{
        return new Promise((resolve, reject) => {
            if (StoredReports.isOnline()){
                StoredReports.uploadPending().then(() => {
                    StoredReports.fetchReports().then((reports) => {
                        resolve(reports);
                    }).catch(() => {
                        StoredReports.getReportsFromStorage().then((reports) => {
                            resolve(reports);
                        })
                    })
                })
            }else{
                StoredReports.getReportsFromStorage().then((reports) => {
                    resolve(reports);
                })
            }
        })
    }
    public static getReport(id: number): Promise<IReportResponse>{
        return new Promise((resolve, reject) => {
            if (StoredReports.isOnline()){
                StoredReports.uploadPending().then(() => {
                    StoredReports.fetchReport(id).then((report) => {
                        resolve(report);
                    }).catch(() => {
                        StoredReports.getReportFromStorage(id).then((report) => {
                            resolve(report);
                        })
                    })
                })
            }else{
                StoredReports.getReportFromStorage(id).then((report) => {
                    resolve(report);
                })
            }
        })
    }
    public static addReport(report: IReportResponse): Promise<IReportResponse>{
        return new Promise((resolve, reject) => {
            TStorage.load('StoredReports', {
                reports: []
            }).then((bucket) => {
                if (report.id < 10000){
                    report.id = Math.floor(Math.random() * 1000000);
                }
                bucket.data.reports.push(report);
                bucket.save().then(() => {
                    if (StoredReports.isOnline()){
                        StoredReports.uploadPending().then((updates) => {
                            const reportUpdated = updates.find((update) => {
                                return update.previousId === report.id;
                            }) as any;
                            if (report){
                                resolve(reportUpdated.updatedReportData);
                            }
                        });
                    }else{
                        resolve(report);
                    }
                }).catch(() => {
                    reject();
                })
            })
        })
    }
    public static updateLocalReport(report: IReportResponse): Promise<IReportResponse>{
        return new Promise((resolve, reject) => {
            TStorage.load('StoredReports', {
                reports: []
            }).then((bucket) => {
                bucket.data.reports = bucket.data.reports.map((storedReport:IReportResponse) => {
                    if (storedReport.id === report.id){
                        return report;
                    }
                    return storedReport;
                })
                bucket.save().then(() => {
                    resolve(report);
                }).catch(() => {
                    reject();
                })
            })
        })
    }
    private static fetchReports(): Promise<Array<IReportResponse>>{
        return new Promise(async (resolve, reject) => {
            const reportsFetched = await RequestAPI.get('/me/reports');
            TStorage.load('StoredReports', {
                reports: []
            }).then((bucket) => {
                bucket.data.reports = reportsFetched;
                bucket.save().then(() => {
                    resolve(bucket.data.reports);
                }).catch(() => {
                    reject();
                })
            })
        })
    }
    private static fetchReport(id: number): Promise<IReportResponse>{
        return new Promise(async (resolve, reject) => {
            const reportFetched = {...await RequestAPI.get('/reports/' + id), invoices:{count: 0, total_amount: 0}};
            TStorage.load('StoredReports', {
                reports: []
            }).then((bucket) => {
                bucket.data.reports = bucket.data.reports.filter((report:IReportResponse) => {
                    return report.id !== id;
                })
                bucket.data.reports.push(reportFetched);
                bucket.save().then(() => {
                    resolve(reportFetched);
                }).catch(() => {
                    reject();
                })
            })
        })
    }
    private static getReportsFromStorage(): Promise<Array<IReportResponse>>{
        return new Promise((resolve, reject) => {
            TStorage.load('StoredReports', {
                reports: []
            }).then((bucket) => {
                resolve(bucket.data.reports);
            })
        })
    }
    private static getReportFromStorage(id: number): Promise<IReportResponse>{
        return new Promise((resolve, reject) => {
            TStorage.load('StoredReports', {
                reports: []
            }).then((bucket) => {
                const report = bucket.data.reports.find((report:IReportResponse) => {
                    return report.id === id;
                })
                if (report){
                    resolve(report);
                }else{
                    reject();
                }
            })
        })
    }
    public static uploadPending():Promise<Array<{previousId: number, updatedReportData: IReportResponse}>>{
        return new Promise(async (resolve, reject) => {
            await StoredReports.waitUpdatePending();
            TStorage.load('StoredReports', {
                reports: []
            }).then((bucket) => {
                const listReportsToUpdate = bucket.data.reports.filter((report:IReportResponse) => {
                    if (report.id > 10000){
                        return true;
                    }else{
                        return false;
                    }
                }).map((report:IReportResponse) => {
                    return new Promise(async (resolve, reject) => {
                        RequestAPI.post('/reports', {
                            user_id: report.user_id,
                            title: report.title,
                            type: report.type,
                            from_date: report.from_date,
                            to_date:report.to_date,
                            status: report.status,
                            money_type: report.money_type,
                        }).then((response) => {
                            resolve({
                                previousId: report.id,
                                updatedReportData: response.report
                            })
                        }).catch((error) => {
                            reject(error);
                        });
                    })
                })

                let listOfUpdates:Array<{previousId: number, updatedReportData: IReportResponse}> = [];

                Promise.all(listReportsToUpdate).then(async (listReportsToUpdate) => {
                    listReportsToUpdate.forEach((reportToUpdate) => {
                        listOfUpdates.push({
                            previousId: reportToUpdate.previousId,
                            updatedReportData: reportToUpdate.updatedReportData
                        })
                        bucket.data.reports = bucket.data.reports.map((report:IReportResponse) => {
                            if(report.id === reportToUpdate.previousId){
                                return reportToUpdate.updatedReportData;
                            }
                            return report;
                        })
                    })

                    const bucketInvoices = await TStorage.load('StoredInvoices', {
                        invoices: []
                    })
                    bucket.data.invoices = bucketInvoices.data.invoices.map((invoice:IReportResponse) => {
                        const reportUpdated = listOfUpdates.find((update) => {
                            return update.previousId === invoice.report_id;
                        }) as any;
                        if (reportUpdated){
                            invoice.report_id = reportUpdated.updatedReportData.id;
                        }
                        return invoice;
                    })
                    await bucketInvoices.save();
                    bucket.save().then(() => {
                        resolve(listOfUpdates);
                    }).catch(() => {
                        reject();
                    })
                })
            })
        })
    }

    private static waitUpdatePending():Promise<void>{
        return new Promise((resolve, reject) => {
            if (StoredReports.isUpdatingPending){
                setTimeout(() => {
                    StoredReports.waitUpdatePending().then(() => {
                        resolve();
                    })
                }, 1000);
            }else{
                resolve();
            }
        })
    }


    private static isOnline():boolean{
        return navigator.onLine;
    }
}


export { StoredReports };
export type { IReportResponse };
