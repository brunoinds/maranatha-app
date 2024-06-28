import { ECountryType } from "@/interfaces/ReportInterfaces";


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

export interface IWarehouse{
    id: number,
    created_at: string,
    updated_at: string,
    name: string,
    zone: string,
    country: ECountryType
}




export interface IWarehouseIncome{
    id: number,
    created_at: string,
    updated_at: string,
    description: string,
    date: string,
    ticket_number: string,
    commerce_number: string,
    qrcode_data?: string,
    image?: string,
    amount: number,
    currency: string,
    job_code?: string,
    expense_code?: string,
    inventory_warehouse_id: number
}
export interface INewWarehouseIncome extends Omit<IWarehouseIncome, 'id' | 'created_at' | 'updated_at'> {}


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