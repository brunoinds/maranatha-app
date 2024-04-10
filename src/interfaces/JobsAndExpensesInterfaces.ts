interface IJob{
    name: string;
    code: string;
    zone: string;
    state: 'Active' | 'Inactive';
}
interface IExpense{
    name: string;
    code: string;
}

export type { IJob, IExpense };