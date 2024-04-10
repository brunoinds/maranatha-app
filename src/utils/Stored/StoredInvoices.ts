import SyncingChanges from "@/dialogs/SyncingChanges/SyncingChanges.vue";
import { EInvoiceType } from "@/interfaces/InvoiceInterfaces";
import { Dialog } from "@/utils/Dialog/Dialog";
import { RequestAPI } from "@/utils/Requests/RequestAPI";
import { IReportUploadResponse, StoredReports } from "@/utils/Stored/StoredReports";
import { TStorage } from "@/utils/Toolbox/TStorage";
import { Toolbox } from "@/utils/Toolbox/Toolbox";
import { alertController } from "@ionic/vue";
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

export interface IInvoiceResponseUploading extends IInvoiceResponse{
    uploading: {
        isUploading: boolean,
        progress: number,
        text: string,
        error?: {
            nativeError?: any | null,
            requestError?: any | null
        }
    }
}

export interface IInvoiceUploadResponse{
    previousId: number, 
    updatedInvoiceData: IInvoiceResponse
}
export interface IInvoiceUploadError{
    invoiceId: number,
    error: {
        nativeError?: any | null,
        requestError?: any | null
    }
}

class StoredInvoices{
    public static uploadPendingInfo = ref<{
        isUploading: boolean,
        progress: number,
        text: string,
        invoices: IInvoiceResponseUploading[]
    }>({
        isUploading: false,
        progress: 0,
        text: '',
        invoices: []
    });
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
    public static removeLocalInvoices(): Promise<boolean>{
        return new Promise((resolve, reject) => {
            TStorage.load('StoredInvoices', {
                invoices: []
            }).then((bucket) => {
                bucket.data.invoices = bucket.data.invoices.filter((invoice:IInvoiceResponse) => {
                    return invoice.id < 10000;
                })
                bucket.save().then(() => {
                    resolve(true);
                })
            })
        })
    }
    public static replaceLocalInvoiceToServerInvoice(invoice: IInvoiceResponse): Promise<IInvoiceResponse>{
        return new Promise((resolve, reject) => {
            TStorage.load('StoredInvoices', {
                invoices: []
            }).then((bucket) => {
                bucket.data.invoices = bucket.data.invoices.map((invoiceStored:IInvoiceResponse) => {
                    if (invoiceStored.id === invoice.id){
                        return invoice;
                    }
                    return invoiceStored;
                })
                bucket.save().then(() => {
                    resolve(invoice);
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
    public static uploadPending(): Promise<Array<{previousId: number, updatedInvoiceData: IInvoiceResponse}>>{
        return new Promise(async (resolve, reject) => {
            await StoredInvoices.waitUpdatePending();
            let reportsUpdates:Array<IReportUploadResponse> = [];
            try {
                StoredInvoices.uploadPendingInfo.value.isUploading = true;

                reportsUpdates = await StoredReports.uploadPending();
            } catch (error: any) {
                TStorage.load('StoredReports', {
                    reports: []
                }).then((bucket) => {
                    alertController.create({
                        header: 'Error',
                        message: 'Error al subir los cambios de los reportes',
                        buttons: [
                            {
                                text: 'Descargar informe de error',
                                role: 'ok',
                                handler: () => {
                                    const errorData = JSON.stringify({error, bucket});
                                    const errorDataBase64 = btoa(errorData);
                                    Toolbox.share('error-report.json', errorDataBase64);
                                }
                            },
                            {
                                text: 'Cerrar',
                                role: 'cancel'
                            }
                        ]
                    }).then((alert) => {
                        alert.present();
                    })
                })
                return;
            }
            const bucket = await TStorage.load('StoredInvoices', {invoices: []});

            let dialog: Dialog|null = null;
            let completed: number = 0;

            let invoicesToUpload = bucket.data.invoices.filter((invoice:IInvoiceResponse) => {
                return invoice.id >= 10000;
            })

            StoredInvoices.uploadPendingInfo.value.invoices = invoicesToUpload.map((invoice:IInvoiceResponse) => {
                return {
                    ...invoice,
                    uploading: {
                        isUploading: true,
                        progress: 0,
                        text: '',
                        error: null
                    }
                }
            })

            const listInvoicesToUpdate = invoicesToUpload.map((invoice:IInvoiceResponse) => {
                return new Promise(async (resolve, reject) => {
                    try {
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
                        }, {
                            onUploadProgress: (percentage: number) => {
                                StoredInvoices.uploadPendingInfo.value.invoices = StoredInvoices.uploadPendingInfo.value.invoices.map((invoiceUploading:IInvoiceResponseUploading) => {
                                    if (invoiceUploading.id === invoice.id){
                                        invoiceUploading.uploading.progress = percentage;
                                        invoiceUploading.uploading.text = `Subiendo documento ${percentage.toFixed(2)}%...`;
                                    }
                                    return invoiceUploading;
                                })
                            }
                        }) as unknown as {invoice: IInvoiceResponse, message: string};
                        completed++;
                        await StoredInvoices.replaceLocalInvoiceToServerInvoice(invoiceResponse.invoice);

                        StoredInvoices.uploadPendingInfo.value.invoices = StoredInvoices.uploadPendingInfo.value.invoices.map((invoiceUploading:IInvoiceResponseUploading) => {
                            if (invoiceUploading.id === invoice.id){
                                invoiceUploading.uploading.progress = 100;
                                invoiceUploading.uploading.text = `Documento subido correctamente`;
                                invoiceUploading.uploading.isUploading = false;
                            }
                            return invoiceUploading;
                        })

                        

                        const total = invoicesToUpload.length;
                        const progressInPercentage = Math.round((completed * 100) / total);

                        StoredInvoices.uploadPendingInfo.value.progress = progressInPercentage;
                        StoredInvoices.uploadPendingInfo.value.text = `Subiendo documento (${completed}/${total})... ${progressInPercentage}%`;

                        if (dialog){
                            dialog.emit('progress', progressInPercentage);
                        }

                        resolve({
                            previousId: invoice.id,
                            updatedInvoiceData: invoiceResponse
                        });
                    } catch (error: any) {
                        const bundledError:any = {
                            nativeError: null,
                            requestError: null
                        }
                        if (error.response){
                            bundledError.requestError = error;
                        }else{
                            bundledError.nativeError = {
                                message: error.message || undefined,
                                stack: error.stack || undefined,
                                error: error
                            };
                        }

                        StoredInvoices.uploadPendingInfo.value.invoices = StoredInvoices.uploadPendingInfo.value.invoices.map((invoiceUploading:IInvoiceResponseUploading) => {
                            if (invoiceUploading.id === invoice.id){
                                invoiceUploading.uploading.error = bundledError;
                                invoiceUploading.uploading.text = `Error al subir documento`;
                            }
                            return invoiceUploading;
                        })


                        resolve({
                            invoiceId: invoice.id,
                            hasError: true,
                            error: error
                        });
                    }
                })
            })
            
            if (listInvoicesToUpdate.length === 0){
                StoredInvoices.uploadPendingInfo.value.isUploading = false;
                resolve([]);
                return;
            }

            const runUploading = (dialog: Dialog|null = null): Promise<{listOfErrorUploads: Array<IInvoiceUploadError>, listOfUpdates: Array<IInvoiceUploadResponse>}> => {
                return new Promise((resolve, reject) => {
                    let listOfErrorUploads:Array<IInvoiceUploadError> = [];
                    let listOfUpdates:Array<IInvoiceUploadResponse> = [];

                    StoredInvoices.uploadPendingInfo.value.isUploading = true;

                    Promise.all(listInvoicesToUpdate).then((listInvoicesToUpdate) => {
                        listInvoicesToUpdate.forEach((invoiceToUpdate) => {
                            if (invoiceToUpdate.hasError){
                                listOfErrorUploads.push({
                                    invoiceId: invoiceToUpdate.invoiceId,
                                    error: invoiceToUpdate.error
                                })
                                return;
                            }

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
                            StoredInvoices.uploadPendingInfo.value.isUploading = false;
                            resolve({listOfUpdates, listOfErrorUploads});
                        }).catch(() => {
                        })
                    })
                })
                
            }

            const startUploading = async () => {
                const {listOfUpdates, listOfErrorUploads} = await runUploading();

                const hasErrors = listOfErrorUploads.length > 0;

                if (hasErrors){
                    if (StoredInvoices.disableShowUpdatingDialog){
                        Dialog.show(SyncingChanges, {})
                    }

                    console.error('Error uploading invoices:', listOfErrorUploads);
                    return;
                }
                resolve(listOfUpdates)
            };

            if (StoredInvoices.disableShowUpdatingDialog){
                startUploading();
            }else{
                Dialog.show(SyncingChanges, {
                    onLoaded($this) {
                        dialog = $this;
                        startUploading();
                    }
                })
            }
        })
    }




    private static waitUpdatePending():Promise<void>{
        return new Promise((resolve, reject) => {
            if (StoredInvoices.uploadPendingInfo.value.isUploading){
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
