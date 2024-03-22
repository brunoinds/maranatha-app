enum EReportStatus {
    Draft = 'Draft',
    Submitted = 'Submitted',
    Approved = 'Approved',
    Rejected = 'Rejected',
    Restituted = 'Restituted'
}
enum EReportType {
    Bill = 'Bill',
    Facture = 'Facture'
}
enum EMoneyType{
    USD = 'USD',
    PEN = 'PEN',
    BRL = 'BRL',
    PYG = 'PYG'
}
interface IReport{
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
}

export { EReportStatus, EReportType, EMoneyType };
export type { IReport };

