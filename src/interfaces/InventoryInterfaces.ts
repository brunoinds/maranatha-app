import { ECountryType, EMoneyType } from "@/interfaces/ReportInterfaces";
import { IUser } from "@/interfaces/UserInterfaces";


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
    Loaned = 'Loaned',
    InRepair = 'InRepair',
    WriteOff = 'WriteOff'
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
    inventory_warehouse_outcome_id?: number|null,
    origin_inventory_product_item_id?: number|null,


    product?: IProduct
    loans?: Array<IWarehouseProductItemLoan>,
    warehouse?: IWarehouse,
    income?: IWarehouseIncome,
    outcome?: IWarehouseOutcome
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
    inventory_warehouse_id: number,
    origin_inventory_warehouse_income_id?: number|null,
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


export interface IWarehouseProductItemLoan{
    id: number,
    created_at: string,
    updated_at: string,
    loaned_to_user_id: number,
    loaned_by_user_id: number,
    loaned_at: string|null,
    received_at: string|null,
    returned_at: string|null,
    confirm_returned_at: string|null,
    status: EInventoryWarehouseProductItemLoanStatus,
    loaned_by?: IUser,
    loaned_to?: IUser,
    movements: Array<{
        id: string,
        user_id: number,
        job_code: string,
        expense_code: string,
        date: string,
        description: string,
        user?: IUser
    }>,
    intercurrences: Array<{
        id: string,
        user_id: number,
        date: string,
        description: string,
        user?: IUser
    }>,
    inventory_product_item_id: number,
    inventory_warehouse_id: number,
    inventory_warehouse_outcome_request_id?: number|null,
    product_item?: IInventoryProductItem extends {product: IProduct} ? IInventoryProductItem : IInventoryProductItem & {product: IProduct}
}
export interface INewWarehouseProductItemLoan extends Omit<IWarehouseProductItemLoan, 'id' | 'created_at' | 'updated_at' |  'received_at' | 'returned_at' | 'confirm_returned_at' | 'status' | 'movements' | 'intercurrences' | 'loaned_by_user_id' | 'inventory_product_item_id'> {
    job_code: string,
    expense_code: string,
    products_items_ids: Array<number>
}



export enum EInventoryWarehouseProductItemLoanStatus{
    SendingToLoan = 'SendingToLoan',
    OnLoan = 'OnLoan',
    ReturningToWarehouse = 'ReturningToWarehouse',
    Returned = 'Returned'
}


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
    value: any;
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
    sub_category?: string,
    brand?: string,
    presentation?: string,
    unit: EInventoryProductUnitType,
    code?: string,
    status: EInventoryProductStatus,
    image?: string,
    is_loanable: boolean,
}

export interface IProductWithWarehouseStock extends IProduct {
    stock: {
        in_stock_count: number,
        sold_count: number,
        all_count: number,
        average_buy_price: { [key in EMoneyType]: string },
        average_sell_price: { [key in EMoneyType]: string },
    }
}

export interface IOutcomeResumeAnalisys{
    products: Array<{
        product_id: number
        quantity: number
        do_loan: boolean
        items_ids: Array<number>
        items_aggregated: Array<{
            currency: string
            unit_amount: number
            count: number
            total_amount: number
        }>
        prices: Array<{
            currency: string
            amount: number
            count: number
        }>
    }>
    summary: {
        prices: Array<{
            currency: string
            amount: number
            count: number
        }>
        items_to_loan: Array<any>
        items_to_sell: Array<number>
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