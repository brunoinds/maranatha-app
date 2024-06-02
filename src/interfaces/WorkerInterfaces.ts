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
}