import SyncingChanges from "@/dialogs/SyncingChanges/SyncingChanges.vue";
import { EInvoiceType } from "@/interfaces/InvoiceInterfaces";
import { Dialog } from "@/utils/Dialog/Dialog";
import { RequestAPI } from "@/utils/Requests/RequestAPI";
import { StoredReports } from "@/utils/Stored/StoredReports";
import { TStorage } from "@/utils/Toolbox/TStorage";
import { ref } from "vue";

interface IInvoiceResponse{
    id: number;
    created_at: string,
    updated_at: string,
    report_id: number,
    type: EInvoiceType,
    description: string,
    ticket_number: string,
    commerce_number: string,
    date: string,
    job_code: string,
    expense_code: string,
    amount: number,
    qrcode_data: string,
    image: string|null,
    image_size: number|null,
}

class StoredInvoices{
    public static isUpdatingPending = ref(false);
    private static disableShowUpdatingDialog = false;
    private static disableShowUpdatingDialogTimeout: any = null;
    public static getInvoices(reportId: number): Promise<IInvoiceResponse[]>{
        return new Promise((resolve, reject) => {
            if (StoredInvoices.isOnline()){
                StoredInvoices.uploadPending().then(() => {
                    StoredInvoices.fetchInvoices(reportId).then((invoices) => {
                        resolve(invoices);
                    }).catch(() => {
                        StoredInvoices.getInvoicesFromStorage(reportId).then((invoices) => {
                            resolve(invoices);
                        })
                    })
                })
            }else{
                StoredInvoices.getInvoicesFromStorage(reportId).then((invoices) => {
                    resolve(invoices);
                })
            }
        })
    }
    public static getInvoice(reportId: number, id: number): Promise<IInvoiceResponse>{
        return new Promise((resolve, reject) => {
            if (StoredInvoices.isOnline()){
                StoredInvoices.uploadPending().then(() => {
                    StoredInvoices.fetchInvoice(id).then((invoice) => {
                        resolve(invoice);
                    }).catch(() => {
                        StoredInvoices.getInvoiceFromStorage(reportId, id).then((invoice) => {
                            resolve(invoice);
                        })
                    })
                })
            }else{
                StoredInvoices.getInvoiceFromStorage(reportId, id).then((invoice) => {
                    resolve(invoice);
                })
            }
        })
    }
    public static addInvoice(invoice: IInvoiceResponse, options: {asAsync: boolean} = {asAsync: true}): Promise<IInvoiceResponse>{
        return new Promise((resolve, reject) => {
            TStorage.load('StoredInvoices', {
                invoices: []
            }).then((bucket) => {
                if (invoice.id < 10000){
                    invoice.id = Math.floor(Math.random() * 1000000);
                }
                bucket.data.invoices.push(invoice);
                bucket.save().then(() => {
                    if (options.asAsync){
                        resolve(invoice);

                        if (StoredInvoices.disableShowUpdatingDialogTimeout){
                            clearTimeout(StoredInvoices.disableShowUpdatingDialogTimeout);
                        }
                        StoredInvoices.disableShowUpdatingDialog = true;
                        StoredInvoices.disableShowUpdatingDialogTimeout = setTimeout(() => {
                            StoredInvoices.disableShowUpdatingDialog = false;
                        }, 50 * 1000); // 50 seconds

                        return;
                    }
                    if (StoredInvoices.isOnline()){
                        StoredInvoices.uploadPending().then((updates) => {
                            const invoiceUpdated = updates.find((update) => {
                                return update.previousId === invoice.id;
                            }) as any;
                            if (invoice){
                                resolve(invoiceUpdated.updatedInvoiceData);
                            }
                        })
                    }else{
                        resolve(invoice);
                    }
                })
            })
        })
    }
    public static removeLocalInvoice(id: number): Promise<boolean>{
        return new Promise((resolve, reject) => {
            TStorage.load('StoredInvoices', {
                invoices: []
            }).then((bucket) => {
                bucket.data.invoices = bucket.data.invoices.filter((invoice:IInvoiceResponse) => {
                    return invoice.id !== id;
                })
                bucket.save().then(() => {
                    resolve(true);
                })
            })
        })
    }
    private static fetchInvoices(reportId: number): Promise<Array<IInvoiceResponse>>{
        return new Promise(async (resolve, reject) => {
            const invoicesFetched = await RequestAPI.get(`/reports/${reportId}/invoices`);
            TStorage.load('StoredInvoices', {
                invoices: []
            }).then((bucket) => {
                bucket.data.invoices = invoicesFetched;
                bucket.save().then(() => {
                    resolve(bucket.data.invoices);
                })
            })
        })
    }
    private static fetchInvoice(id: number): Promise<IInvoiceResponse>{
        return new Promise(async (resolve, reject) => {
            const invoiceFetched = await RequestAPI.get('/invoices/' + id);
            TStorage.load('StoredInvoices', {
                invoices: []
            }).then((bucket) => {
                bucket.data.invoices = bucket.data.invoices.filter((invoice:IInvoiceResponse) => {
                    return invoice.id !== id;
                })
                bucket.data.invoices.push(invoiceFetched);
                bucket.save().then(() => {
                    resolve(invoiceFetched);
                })
            })
        })
    }

    private static getInvoicesFromStorage(reportId: number): Promise<IInvoiceResponse[]>{
        return new Promise((resolve, reject) => {
            TStorage.load('StoredInvoices', {
                invoices: []
            }).then((bucket) => {
                const invoices = bucket.data.invoices.filter((invoice: IInvoiceResponse) => {
                    return invoice.report_id === reportId;
                });
                resolve(invoices);
            })
        })
    }
    private static getInvoiceFromStorage(reportId: number, id: number): Promise<IInvoiceResponse>{
        return new Promise((resolve, reject) => {
            TStorage.load('StoredInvoices', {
                invoices: []
            }).then((bucket) => {
                const invoice = bucket.data.invoices.find((invoice: IInvoiceResponse) => {
                    return invoice.report_id === reportId && invoice.id === id;
                });
                resolve(invoice);
            })
        })
    }
    private static uploadPending(): Promise<Array<{previousId: number, updatedInvoiceData: IInvoiceResponse}>>{
        return new Promise(async (resolve, reject) => {
            await StoredInvoices.waitUpdatePending();
            const reportsUpdates = await StoredReports.uploadPending();
            
            TStorage.load('StoredInvoices', {
                invoices: []
            }).then((bucket) => {
                let dialog: Dialog|null = null;
                let completed = 0;
                let invoicesCandidates = bucket.data.invoices.filter((invoice:IInvoiceResponse) => {
                    return invoice.id >= 10000;
                });
                const listInvoicesToUpdate = invoicesCandidates.map((invoice:IInvoiceResponse) => {
                    return new Promise(async (resolve, reject) => {
                        const invoiceResponse = await RequestAPI.post("/invoices", {
                            ...invoice,
                            report_id: (() => {
                                const reportUpdated = reportsUpdates.find((update) => {
                                    return update.previousId === invoice.report_id;
                                }) as any;
                                if (reportUpdated){
                                    return reportUpdated.updatedReportData.id;
                                }
                                return invoice.report_id;
                            })()
                        }) as unknown as {invoice: IInvoiceResponse, message: string};
                        completed++;

                        //Get progress:
                        const total = invoicesCandidates.length;
                        const progressInPercentage = Math.round((completed * 100) / total);
                        if (dialog){
                            dialog.emit('progress', progressInPercentage);
                        }
                        resolve({
                            previousId: invoice.id,
                            updatedInvoiceData: invoiceResponse
                        });
                    })
                })
                
                if (listInvoicesToUpdate.length === 0){
                    resolve([]);
                    return;
                }

                const performPromises = (dialog:any) => {
                    return new Promise((resolve, reject) => {
                        let listOfUpdates:Array<{previousId: number, updatedInvoiceData: IInvoiceResponse}> = [];
                        StoredInvoices.isUpdatingPending.value = true;
                        Promise.all(listInvoicesToUpdate).then((listInvoicesToUpdate) => {
                            listInvoicesToUpdate.forEach((invoiceToUpdate) => {
                                listOfUpdates.push({
                                    previousId: invoiceToUpdate.previousId,
                                    updatedInvoiceData: invoiceToUpdate.updatedInvoiceData
                                })
                                bucket.data.invoices = bucket.data.invoices.map((invoice:IInvoiceResponse) => {
                                    if(invoice.id == invoiceToUpdate.previousId){
                                        return invoiceToUpdate.updatedInvoiceData;
                                    }
                                    return invoice;
                                })
                            })
                            bucket.save().then(() => {
                                if (dialog){
                                    dialog?.close();
                                }
                                StoredInvoices.isUpdatingPending.value = false;
                                resolve(listOfUpdates);
                            }).catch(() => {
                                reject();
                            })
                        })
                    })
                    
                }

                if (StoredInvoices.disableShowUpdatingDialog){
                    performPromises(null).then((listOfUpdates:any) => {
                        resolve(listOfUpdates);
                    }).catch((err) => {
                        reject(err);
                    })
                    return;
                }
                Dialog.show(SyncingChanges, {
                    onLoaded($this) {
                        dialog = $this;
                        performPromises(dialog).then((listOfUpdates:any) => {
                            resolve(listOfUpdates);
                        }).catch((err) => {
                            reject(err);
                        })
                    }
                })
            })
        })
    }
    private static waitUpdatePending():Promise<void>{
        return new Promise((resolve, reject) => {
            if (StoredInvoices.isUpdatingPending.value){
                setTimeout(() => {
                    StoredInvoices.waitUpdatePending().then(() => {
                        resolve();
                    })
                }, 1000);
            }else{
                resolve();
            }
        })
    }
    private static isOnline(): boolean{
        return navigator.onLine;
    }
}


export { StoredInvoices };
export type { IInvoiceResponse };
