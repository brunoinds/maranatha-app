import { IProduct, IProductsPack, IWarehouse } from "@/interfaces/InventoryInterfaces";
import { RequestAPI } from "@/utils/Requests/RequestAPI";



export class InventoryStore{
    private static warehouses: Array<IWarehouse> | null = null;
    private static products: Array<IProduct> | null = null;
    private static productsPacks: Array<IProductsPack> | null = null;


    public static async getWarehouses() : Promise<Array<IWarehouse>>{
        if (InventoryStore.warehouses){
            return InventoryStore.warehouses;
        }else{
            await InventoryStore.getWarehousesFromServer();
            return InventoryStore.warehouses as unknown as Array<IWarehouse>;
        }
    }
    public static async getProducts(): Promise<Array<IProduct>>{
        if (InventoryStore.products){
            return InventoryStore.products;
        }else{
            await InventoryStore.getProductsFromServer();
            return InventoryStore.products as unknown as Array<IProduct>;
        }
    }
    public static async getProductsPacks() : Promise<Array<IProductsPack>>{
        if (InventoryStore.productsPacks){
            return InventoryStore.productsPacks;
        }else{
            await InventoryStore.getProductsPacksFromServer();
            return InventoryStore.productsPacks as unknown as Array<IProductsPack>;
        }
    }

    private static async getWarehousesFromServer(){
        const response = await RequestAPI.get('/inventory/warehouses');
        InventoryStore.warehouses = response;
    }
    private static async getProductsFromServer(){
        const response = await RequestAPI.get('/inventory/products');
        InventoryStore.products = response;
    }
    private static async getProductsPacksFromServer(){
        const response = await RequestAPI.get('/inventory/products-packs');
        InventoryStore.productsPacks = response;
    }

    public static async refreshWarehouses()
    {
        await InventoryStore.getWarehousesFromServer();
    }
    public static async refreshProducts()
    {
        await InventoryStore.getProductsFromServer();
    }
    public static async refreshProductsPacks()
    {
        await InventoryStore.getProductsPacksFromServer();
    }
}