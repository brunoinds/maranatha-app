import { EInvoiceType } from "@/interfaces/InvoiceInterfaces";
import { TStorage } from "@/utils/Toolbox/TStorage";
import { ref } from "vue";

interface IInvoice{
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
class InvoicesPendingStore{
    public static getInvoicesFromStorage(): Promise<IInvoice[]>{
        return new Promise((resolve, reject) => {
            TStorage.load('InvoicesPendingStore', {
                invoices: []
            }).then((bucket) => {
                resolve(bucket.data.invoices);
            })
        })
    }
    public static getReportInvoicesFromStorage(reportId: number): Promise<IInvoice[]>{
        return new Promise(async (resolve, reject) => {
            const invoices = await InvoicesPendingStore.getInvoicesFromStorage();
            resolve(invoices.filter((invoice) => invoice.report_id === reportId));
        })
    }
    public static getInvoiceFromStorage(invoiceId: number): Promise<IInvoice|null>{
        return new Promise(async (resolve, reject) => {
            const invoices = await InvoicesPendingStore.getInvoicesFromStorage();
            resolve(invoices.find((invoice) => invoice.id === invoiceId) || null);
        })
    
    }
}





export function useInvoicesStore(){
    const invoices = ref<IInvoice[]>([]);
    



    return {

    }
}