interface IJob{
    name: string;
    code: string;
    zone: string;
}
interface IExpense{
    name: string;
    code: string;
}

export type { IJob, IExpense };