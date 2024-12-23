enum EInvoiceType {
    Bill = 'Bill',
    Facture = 'Facture'
}
interface IInvoice{
    value: any;
    id: number;
    created_at: string  
    updated_at: string,
    report_id: number,
    type: EInvoiceType,
    description: string,
    ticket_number: string,
    commerce_number: string,
    provider: string,
    date: string,
    job_code: string,
    expense_code: string,
    amount: number,
    qrcode_data: string,
    image: string|null,
    image_size: number|null,
    pdf: string|null,
    pdf_size: number|null,
}

interface INewInvoice{
    report_id: number,
    type: EInvoiceType,
    description: string,
    ticket_number: string,
    commerce_number: string,
    provider: string,
    date: string,
    job_code: string,
    expense_code: string,
    amount: number,
    qrcode_data: string,
    image: string|null,
    pdf: string|null,
}


export { EInvoiceType };
export type { IInvoice, INewInvoice };

