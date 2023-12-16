import { IReport } from "@/interfaces/ReportInterfaces";
import { TStorage } from "@/utils/Toolbox/TStorage";

class ReportsPendingSync{
    public static getReports(): Promise<Array<IReport>>{
        return new Promise((resolve, reject) => {
            TStorage.load('ReportsPendingSync', {
                reports: []
            }).then((bucket) => {
                resolve(bucket.data.reports);
            })
        })
    }
    public static addReport(report: IReport): Promise<void>{
        return new Promise((resolve, reject) => {
            TStorage.load('ReportsPendingSync', {
                reports: []
            }).then((bucket) => {
                bucket.data.reports.push(report);
                bucket.save().then(() => {
                    resolve();
                }).catch(() => {
                    reject();
                })
            })
        })
    }
    public static removeReport(id: number): Promise<void>{
        return new Promise((resolve, reject) => {
            TStorage.load('ReportsPendingSync', {
                reports: []
            }).then((bucket) => {
                bucket.data.reports = bucket.data.reports.filter((report: IReport) => {
                    return report.id !== id;
                })
                bucket.save().then(() => {
                    resolve();
                }).catch(() => {
                    reject();
                })
            })
        })
    }


    public static sync(): Promise<void>{
        return new Promise((resolve, reject) => {
            
        })
    }
}