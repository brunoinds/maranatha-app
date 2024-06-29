export interface IWorker {
    id: number;
    created_at: Date;
    updated_at: Date;
    dni: string;
    name: string;
    is_active: boolean;
    supervisor: string;
    team: string;
    country: string;
    role: string;
    history: any[];
}

export interface IWorkerPayment {
    id: number;
    created_at: Date;
    updated_at: Date;
    worker_id: number;
    month: number;
    year: number;
    amount: number;
    currency: string;
    description?: string;
    divisions: IWorkerPaymentDivision[];
}

export interface IWorkerPaymentDivision{
    id: string;
    name: string;
    amount: number;
}


export const generateWorkersPaymentDefaultDivisions = () => {
    return [
        {
            id: Math.random().toString(36).substring(7),
            name: "Mano de obra",
            amount: 0
        },
        {
            id: Math.random().toString(36).substring(7),
            name: "EsSalud",
            amount: 0
        },
        {
            id: Math.random().toString(36).substring(7),
            name: "AFP",
            amount: 0
        },
        {
            id: Math.random().toString(36).substring(7),
            name: "Gratificación",
            amount: 0
        }
    ]
}