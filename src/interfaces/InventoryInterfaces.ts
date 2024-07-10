import { ECountryType, EMoneyType } from "@/interfaces/ReportInterfaces";


export const productUnitTypes = {
    Units: 'Unidades',
    Liters: 'Litros',
    Kilograms: 'Kilogramos',
    Meters: 'Metros',
    Boxes: 'Cajas',
    Buckets: 'Baldes',
    Bags: 'Bolsas',
    Gallons: 'Galones',
    Packs: 'Paquetes'
}

export enum EInventoryProductUnitType{
    Units = 'Units',
    Liters = 'Liters',
    Kilograms = 'Kilograms',
    Meters = 'Meters',
    Boxes = 'Boxes',
    Buckets = 'Buckets',
    Bags = 'Bags',
    Gallons = 'Gallons',
    Packs = 'Packs',
}
export enum EInventoryProductStatus{
    Active = 'Active',
    Inactive = 'Inactive'
}
export enum EInventoryProductItemStatus{
    InStock = 'InStock',
    Sold = 'Sold',
}

export interface IWarehouse{
    id: number,
    created_at: string,
    updated_at: string,
    name: string,
    zone: string,
    country: ECountryType,
    owners: Array<number>,
}

export interface IInventoryProductItem{
    id: number,
    created_at: string,
    updated_at: string,
    order: number,
    batch?: string|null,
    buy_amount: number,
    sell_amount: number,
    buy_currency: EMoneyType,
    sell_currency: EMoneyType,
    status: EInventoryProductItemStatus,
    inventory_product_id: number,
    inventory_warehouse_id: number,
    inventory_warehouse_income_id: number,
    inventory_warehouse_outcome_id?: number|null
}



export interface IWarehouseIncome{
    id: number,
    created_at: string,
    updated_at: string,
    description: string,
    date: string,
    ticket_type: string,
    ticket_number: string,
    commerce_number: string,
    qrcode_data?: string,
    image?: string,
    currency: string,
    job_code?: string,
    expense_code?: string,
    inventory_warehouse_id: number
}
export interface INewWarehouseIncome extends Omit<IWarehouseIncome, 'id' | 'created_at' | 'updated_at'> {}



export interface IWarehouseOutcome{
    id: number,
    created_at: string,
    updated_at: string,
    description: string,
    date: string,
    job_code?: string|null,
    expense_code?: string|null,
    user_id?: number|null,
    inventory_warehouse_id: number
}
export interface INewWarehouseOutcome extends Omit<IWarehouseOutcome, 'id' | 'created_at' | 'updated_at' | 'user_id'> {}



export enum EInventoryWarehouseOutcomeRequestStatus{
    Draft = 'Draft',
    Requested = 'Requested',
    Rejected = 'Rejected',
    Approved = 'Approved',
    Dispatched = 'Dispatched',
    OnTheWay = 'OnTheWay',
    Delivered = 'Delivered',
    Finished = 'Finished'
}
export interface IWarehouseOutcomeRequest{
    id: number,
    created_at: string,
    updated_at: string,
    inventory_warehouse_id: number,
    inventory_warehouse_outcome_id: number|null,
    user_id: number,
    description?: string,
    requested_products: Array<{
        product_id: number,
        quantity: number
    }>,
    received_products: Array<{
        product_id: number,
        quantity: number
    }>,
    messages: Array<IOutcomeChatMessage>,
    requested_at: string|null,
    rejected_at: string|null,
    approved_at: string|null,
    dispatched_at: string|null,
    on_the_way_at: string|null,
    delivered_at: string|null,
    finished_at: string|null,
    job_code?: string|null,
    expense_code?: string|null,
    status: EInventoryWarehouseOutcomeRequestStatus
}

export interface INewWarehouseOutcomeRequest extends Omit<IWarehouseOutcomeRequest, 'id' | 'created_at' | 'updated_at' | 'requested_at' | 'rejected_at' | 'approved_at' | 'dispatched_at' | 'delivered_at' | 'finished_at' | 'on_the_way_at' | 'received_products' | 'status' | 'messages' | 'inventory_warehouse_outcome_id' | 'user_id'> {}

export interface IOutcomeChatMessage{
    id: string;
    text: string|null;
    image?: {
        data: string;
        size: number;
        type: string;
    }|null;
    document?: {
        data: string;
        size: number;
        type: string;
        name: string;
    }|null;
    video?: {
        data: string;
        size: number;
        duration: number;
        type: string;
    }|null;
    audio?: {
        data: string;
        size: number;
        duration: number;
        type: string;
    }|null;
    location?: string|null;
    reply_to?: string;
    react_to?: string;

    written_at: string;
    sent_at: string|null;
    received_at: string|null;
    read_at: string|null;
    user_id: number;
}

export interface IProduct{
    id: number,
    created_at: string,
    updated_at: string,
    name: string,
    description?: string,
    category?: string,
    brand?: string,
    presentation?: string,
    unit: EInventoryProductUnitType,
    code?: string,
    status: EInventoryProductStatus,
    image?: string
}

export interface IProductWithWarehouseStock extends IProduct {
    stock: {
        in_stock_count: number,
        sold_count: number,
        average_buy_price: { [key in EMoneyType]: string },
        average_sell_price: { [key in EMoneyType]: string },
        items: Array<IInventoryProductItem>
    }
}


export interface IProductsPack{
    id: number,
    created_at: string,
    updated_at: string,
    name: string,
    products: Array<{
        product_id: number,
        quantity: number
    }>
}

export interface INewProductsPack extends Omit<IProductsPack, 'id' | 'created_at' | 'updated_at'> {}