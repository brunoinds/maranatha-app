interface IJob{
    name: string;
    code: string;
    zone: string;
    state: 'Active' | 'Inactive';
}
export enum EExpenseUses{
    Reports = 'Reports',
    Attendances = 'Attendances',
}
interface IExpense{
    name: string;
    code: string;
    uses: Array<EExpenseUses>;
}

export type { IJob, IExpense };