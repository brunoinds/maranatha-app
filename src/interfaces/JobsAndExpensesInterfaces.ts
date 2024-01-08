interface IJob{
    name: string;
    code: string;
    zone: 'North' | 'South' | 'NoZone';
}
interface IExpense{
    name: string;
    code: string;
}

export type { IJob, IExpense };