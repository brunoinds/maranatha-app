enum EReportStatus {
    Draft = 'Draft',
    Submitted = 'Submitted',
    Approved = 'Approved',
    Rejected = 'Rejected',
}
enum EReportType {
    Bill = 'Bill',
    Facture = 'Facture'
}
interface IReport{
    id: number;
    created_at: string;
    updated_at: string;
    user_id: number;
    title: string;
    from_date: string;
    to_date: string;
    project_code: string;
    status: EReportStatus;
    exported_pdf: string|null;
    type: EReportType;
    rejection_reason: string|null;
    rejected_at: string|null;
    approved_at: string|null;
    submitted_at: string|null;
}

export { EReportStatus, EReportType };
export type { IReport };

