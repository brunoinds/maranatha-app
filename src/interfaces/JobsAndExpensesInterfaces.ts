interface IJob{
    name: string;
    code: string;
    zone: string;
    state: 'Active' | 'Inactive';
    country: string;
    location?: {latitude: number, longitude: number} | null;
}
export enum EExpenseUses{
    Reports = 'Reports',
    Attendances = 'Attendances',
    Inventory = 'Inventory',
}
interface IExpense{
    name: string;
    code: string;
    uses: Array<EExpenseUses>;
}

export type { IJob, IExpense };