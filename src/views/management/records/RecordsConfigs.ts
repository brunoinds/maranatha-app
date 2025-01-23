import { IProduct } from "@/interfaces/InventoryInterfaces";
import { ECountryType, EMoneyType } from "@/interfaces/ReportInterfaces";
import { RequestAPI } from "@/utils/Requests/RequestAPI";
import { InventoryStore } from "@/utils/Stored/InventoryStore";
import { JobsAndExpenses } from "@/utils/Stored/JobsAndExpenses";
import { Toolbox } from "@/utils/Toolbox/Toolbox";
import { DateTime } from "luxon";


const contents:any = {
    jobsDropdownOptions: null,
    expensesDropdownOptions: null,
    usersDropdownOptions: null,
    jobsZonesDropdownOptions: null,
    moneyTypesDropdownOptions: null,
    warehousesDropdownOptions: null,
    productsDropdownOptions: null,
}
let isLoadingContents:boolean = false;
let isLoadedContents:boolean = false;

const load = async () => {
    isLoadingContents = true;

    const jobs = await JobsAndExpenses.getJobs();
    const expenses = await JobsAndExpenses.getExpenses();
    const warehouses = await InventoryStore.getWarehouses();
    const products = await InventoryStore.getProducts();

    const users = await (async () => {
        const users = await RequestAPI.get('/users');
        return users.map((user:any) => {
            return {
                id: user.id,
                name: user.name
            }
        })
    })()

    const jobsDropdownOptions = jobs.map((job) => {
        return {
            id: job.code,
            name: job.code + ' - ' + job.name,
            value: job.code
        }
    })

    const jobsZonesDropdownOptions = jobs.map((job) => {
        return {
            id: job.zone,
            name: job.zone,
            value: job.zone
        }
    }).filter((zone:any, index:number, self:any) => {
        return index === self.findIndex((t:any) => (
            t.id === zone.id
        ))
    })

    const expensesDropdownOptions = expenses.map((expense) => {
        return {
            id: expense.code,
            name: expense.code + ' - ' + expense.name,
            value: expense.code
        }
    })

    const usersDropdownOptions = users.map((user:any) => {
        return {
            id: user.id,
            name: user.name,
            value: user.id
        }
    })

    const moneyTypesDropdownOptions = (() => {
        //Iterate enum items:


        let items:any = [];
        Object.keys(EMoneyType).forEach((key) => {
            items.push({
                id: key,
                name: key,
                value: EMoneyType[key]
            })
        })

        return items;
    })();

    const countryTypesDropdownOptions = (() => {
        //Iterate enum items:


        let items:any = [];
        Object.keys(ECountryType).forEach((key) => {
            items.push({
                id: key,
                name: key,
                value: ECountryType[key]
            })
        })

        return items;
    })();

    const warehousesDropdownOptions = (() => {
        return warehouses.map((warehouse:any) => {
            return {
                id: warehouse.id,
                name: warehouse.name,
                value: warehouse.id
            }
        })
    })();

    const productsDropdownOptions = (() => {
        return products.map((product:any) => {
            return {
                id: product.id,
                name: product.name,
                value: product.id
            }
        })
    })();

    const productsCategoriesDropdownOptions = (() => {
        let categories:Array<string> = [];
        products.forEach((product:IProduct) => {
            if (product.category && !categories.includes(product.category)){
                categories.push(product.category);
            }
        })

        return categories.map((category:string) => {
            return {
                id: category,
                name: category,
                value: category
            }
        })
    })();

    const productsSubCategoriesDropdownOptions = (() => {
        let subcategories:Array<string> = [];
        products.forEach((product:IProduct) => {
            if (product.sub_category && !subcategories.includes(product.sub_category)){
                subcategories.push(product.sub_category);
            }
        })

        return subcategories.map((subcategory:string) => {
            return {
                id: subcategory,
                name: subcategory,
                value: subcategory
            }
        })
    })();


    contents.jobsDropdownOptions = jobsDropdownOptions;
    contents.expensesDropdownOptions = expensesDropdownOptions;
    contents.usersDropdownOptions = usersDropdownOptions;
    contents.jobsZonesDropdownOptions = jobsZonesDropdownOptions;
    contents.moneyTypesDropdownOptions = moneyTypesDropdownOptions;
    contents.countryTypesDropdownOptions = countryTypesDropdownOptions;
    contents.warehousesDropdownOptions = warehousesDropdownOptions;
    contents.productsDropdownOptions = productsDropdownOptions;
    contents.productsCategoriesDropdownOptions = productsCategoriesDropdownOptions;
    contents.productsSubCategoriesDropdownOptions = productsSubCategoriesDropdownOptions

    isLoadingContents = false;
    isLoadedContents = true;
}

const waitToLoadContents = async () => {
    return new Promise((resolve) => {
        if (isLoadedContents){
            resolve({});
        }else{
            if (!isLoadedContents && !isLoadingContents){
                load();
            }
            const interval = setInterval(() => {
                if (isLoadedContents){
                    clearInterval(interval);
                    resolve({});
                }
            }, 100);
        }
    })
    
}

const RecordsConfigs = {
    getConfigurations: async () => {
        await waitToLoadContents();

        const { jobsDropdownOptions, expensesDropdownOptions, usersDropdownOptions, jobsZonesDropdownOptions, moneyTypesDropdownOptions, countryTypesDropdownOptions, warehousesDropdownOptions, productsDropdownOptions, productsCategoriesDropdownOptions, productsSubCategoriesDropdownOptions } = contents;

        return [
            {
                id: 'general-records',
                title: 'Consolidado General',
                filters: [
                    {
                        id: 'start_date',
                        name: 'Fecha Inicio',
                        isRequired: true,
                        type: 'date',
                        value: DateTime.now().startOf('month').toFormat('yyyy-MM-dd')
                    },
                    {
                        id: 'end_date',
                        name: 'Fecha Fin',
                        isRequired: true,
                        type: 'date',
                        value: DateTime.now().toFormat('yyyy-MM-dd')
                    },
                    {
                        id: 'job_code',
                        name: 'Job',
                        isRequired: false,
                        type: 'dropdown',
                        options: jobsDropdownOptions
                    },
                    {
                        id: 'expense_code',
                        name: 'Expense Code',
                        isRequired: false,
                        type: 'dropdown',
                        options: expensesDropdownOptions
                    },
                    {
                        id: 'country',
                        name: 'País',
                        isRequired: false,
                        type: 'dropdown',
                        options: countryTypesDropdownOptions
                    },
                    {
                        id: 'job_region',
                        name: 'Zona de Job',
                        isRequired: false,
                        type: 'dropdown',
                        options: jobsZonesDropdownOptions
                    },
                    {
                        id: 'type',
                        name: 'Tipo',
                        isRequired: false,
                        type: 'dropdown',
                        options: [
                            {
                                id: 'Reporte',
                                name: 'Reporte',
                                value: 'Reports'
                            },
                            {
                                id: 'Asistencia',
                                name: 'Asistencia',
                                value: 'Attendances'
                            },
                            {
                                id: 'Inventario',
                                name: 'Inventario',
                                value: 'Inventory'
                            },
                        ]
                    },
                    {
                        id: 'money_type',
                        name: 'Moneda',
                        isRequired: false,
                        type: 'dropdown',
                        options: moneyTypesDropdownOptions
                    }
                ],
                endpoint: 'general/general-records',
                data: {
                    body: {
                        formatData: (item:any) => {
                            return {
                                ...item,
                            }
                        }
                    }
                }
            },
            {
                id: 'invoices-by-items',
                title: 'Boletas/Facturas',
                filters: [
                    {
                        id: 'date_range',
                        name: 'Rango Fechas',
                        isRequired: true,
                        type: 'daterange',
                        value: {
                            start: DateTime.now().startOf('month').toFormat('yyyy-MM-dd'),
                            end: DateTime.now().toFormat('yyyy-MM-dd')
                        }
                    },
                    {
                        id: 'job_code',
                        name: 'Job',
                        isRequired: false,
                        type: 'dropdown',
                        options: jobsDropdownOptions
                    },
                    {
                        id: 'expense_code',
                        name: 'Expense Code',
                        isRequired: false,
                        type: 'dropdown',
                        options: expensesDropdownOptions
                    },
                    {
                        id: 'country',
                        name: 'País',
                        isRequired: false,
                        type: 'dropdown',
                        options: countryTypesDropdownOptions
                    },
                    {
                        id: 'invoice_type',
                        name: 'Tipo',
                        isRequired: false,
                        type: 'dropdown',
                        options: [
                            {
                                id: 'Bills',
                                name: 'Boletas',
                                value: 'Bill'
                            },
                            {
                                id: 'Factures',
                                name: 'Facturas',
                                value: 'Facture'
                            },
                        ]
                    },
                    {
                        id: 'job_region',
                        name: 'Zona de Job',
                        isRequired: false,
                        type: 'dropdown',
                        options: jobsZonesDropdownOptions
                    },
                    {
                        id: 'money_type',
                        name: 'Moneda',
                        isRequired: false,
                        type: 'dropdown',
                        options: moneyTypesDropdownOptions
                    }
                ],
                endpoint: 'invoices/by-items',
                data: {
                    body: {
                        formatData: (item:any) => {
                            return {
                                ...item,
                            }
                        }
                    }
                }
            },
            {
                id: 'jobs-by-costs',
                title: 'Gastos x Jobs',
                filters: [
                    {
                        id: 'date_range',
                        name: 'Rango Fechas',
                        isRequired: true,
                        type: 'daterange',
                        value: {
                            start: DateTime.now().startOf('month').toFormat('yyyy-MM-dd'),
                            end: DateTime.now().toFormat('yyyy-MM-dd')
                        }
                    },
                    {
                        id: 'country',
                        name: 'País',
                        isRequired: false,
                        type: 'dropdown',
                        options: countryTypesDropdownOptions
                    },
                    {
                        id: 'job_region',
                        name: 'Zona de Job',
                        isRequired: false,
                        type: 'dropdown',
                        options: jobsZonesDropdownOptions
                    },
                    {
                        id: 'expense_code',
                        name: 'Expense Code',
                        isRequired: false,
                        type: 'dropdown',
                        options: expensesDropdownOptions
                    }
                ],
                endpoint: 'jobs/by-costs',
                data: {
                    body: {
                        formatData: (item:any) => {
                            return {
                                ...item,
                                workers: Toolbox.moneyFormat(item.workers, EMoneyType.USD),
                                invoices: Toolbox.moneyFormat(item.invoices, EMoneyType.USD),
                                total_dollars: Toolbox.moneyFormat(item.total_dollars, EMoneyType.USD),
                                total_soles: Toolbox.moneyFormat(item.total_soles, EMoneyType.PEN)
                            }
                        }
                    }
                }
            },
            {
                id: 'users-by-costs',
                title: 'Gastos x Usuário',
                filters: [
                    {
                        id: 'date_range',
                        name: 'Rango Fechas',
                        isRequired: true,
                        type: 'daterange',
                        value: {
                            start: DateTime.now().startOf('month').toFormat('yyyy-MM-dd'),
                            end: DateTime.now().toFormat('yyyy-MM-dd')
                        }
                    },
                    {
                        id: 'country',
                        name: 'País',
                        isRequired: false,
                        type: 'dropdown',
                        options: countryTypesDropdownOptions
                    },
                    {
                        id: 'job_region',
                        name: 'Zona de Job',
                        isRequired: false,
                        type: 'dropdown',
                        options: jobsZonesDropdownOptions
                    },
                    {
                        id: 'job_code',
                        name: 'Job',
                        isRequired: false,
                        type: 'dropdown',
                        options: jobsDropdownOptions
                    },
                    {
                        id: 'expense_code',
                        name: 'Expense Code',
                        isRequired: false,
                        type: 'dropdown',
                        options: expensesDropdownOptions
                    },
                    {
                        id: 'type',
                        name: 'Tipo',
                        isRequired: false,
                        type: 'dropdown',
                        options: [
                            {
                                id: 'Invoices',
                                name: 'Boletas y Facturas',
                                value: 'Invoices'
                            },
                            {
                                id: 'Bills',
                                name: 'Boletas',
                                value: 'Bills'
                            },
                            {
                                id: 'Factures',
                                name: 'Facturas',
                                value: 'Factures'
                            },
                            {
                                id: 'Workers',
                                name: 'Trabajadores',
                                value: 'Workers'
                            },
                        ]
                    },
                    {
                        id: 'user_id',
                        name: 'Usuario',
                        isRequired: false,
                        type: 'dropdown',
                        options: usersDropdownOptions
                    },
                ],
                endpoint: 'users/by-costs',
                data: {
                    body: {
                        formatData: (item:any) => {
                            return {
                                ...item,
                                date: DateTime.fromISO(item.date).toFormat('dd/MM/yyyy'),
                                amount_in_soles: Toolbox.moneyFormat(item.amount_in_soles, EMoneyType.PEN),
                                amount_in_dollars: Toolbox.moneyFormat(item.amount_in_dollars, EMoneyType.USD),
                            }
                        }
                    }
                }
            },
            {
                id: 'attendances-by-jobs',
                title: 'Asistencias x Jobs',
                filters: [
                    {
                        id: 'date_range',
                        name: 'Rango Fechas',
                        isRequired: true,
                        type: 'daterange',
                        value: {
                            start: DateTime.now().startOf('month').toFormat('yyyy-MM-dd'),
                            end: DateTime.now().toFormat('yyyy-MM-dd')
                        }
                    },
                    {
                        id: 'job_code',
                        name: 'Job',
                        isRequired: false,
                        type: 'dropdown',
                        options: jobsDropdownOptions
                    },
                    {
                        id: 'country',
                        name: 'País',
                        isRequired: false,
                        type: 'dropdown',
                        options: countryTypesDropdownOptions
                    },
                    {
                        id: 'job_zone',
                        name: 'Zona de Job',
                        isRequired: false,
                        type: 'dropdown',
                        options: jobsZonesDropdownOptions
                    },
                    {
                        id: 'expense_code',
                        name: 'Expense Code',
                        isRequired: false,
                        type: 'dropdown',
                        options: expensesDropdownOptions
                    },
                    {
                        id: 'supervisor',
                        name: 'Supervisor',
                        isRequired: false,
                        type: 'textbox',
                        value: null
                    },
                    {
                        id: 'worker_dni',
                        name: 'DNI Trabajador',
                        isRequired: false,
                        type: 'textbox',
                        value: null
                    }
                ],
                endpoint: 'attendances/by-jobs',
                data: {
                    body: {
                        formatData: (item:any) => {
                            return {
                                ...item,
                                attendance_created_at: DateTime.fromFormat(item.attendance_created_at, 'yyyy-MM-dd HH:mm:ss').toFormat('dd/MM/yyyy'),
                                amount_in_soles: item.amount_in_soles.toFixed(2),
                                amount_in_dollars: item.amount_in_dollars.toFixed(2),
                                day_work_amount_in_dollars: item.day_work_amount_in_dollars.toFixed(2),
                                day_work_amount_in_soles: item.day_work_amount_in_soles.toFixed(2),
                            }
                        }
                    }
                }
            },
            {
                id: 'attendances-by-jobs-expenses',
                title: 'Asistencias x Jobs x Expenses',
                filters: [
                    {
                        id: 'date_range',
                        name: 'Rango Fechas',
                        isRequired: true,
                        type: 'daterange',
                        value: {
                            start: DateTime.now().startOf('month').toFormat('yyyy-MM-dd'),
                            end: DateTime.now().toFormat('yyyy-MM-dd')
                        }
                    },
                    {
                        id: 'job_code',
                        name: 'Job',
                        isRequired: false,
                        type: 'dropdown',
                        options: jobsDropdownOptions
                    },
                    {
                        id: 'country',
                        name: 'País',
                        isRequired: false,
                        type: 'dropdown',
                        options: countryTypesDropdownOptions
                    },
                    {
                        id: 'job_zone',
                        name: 'Zona de Job',
                        isRequired: false,
                        type: 'dropdown',
                        options: jobsZonesDropdownOptions
                    },
                    {
                        id: 'expense_code',
                        name: 'Expense Code',
                        isRequired: false,
                        type: 'dropdown',
                        options: expensesDropdownOptions
                    },
                    {
                        id: 'supervisor',
                        name: 'Supervisor',
                        isRequired: false,
                        type: 'textbox',
                        value: null
                    },
                    {
                        id: 'worker_dni',
                        name: 'DNI Trabajador',
                        isRequired: false,
                        type: 'textbox',
                        value: null
                    }
                ],
                endpoint: 'attendances/by-jobs-expenses',
                data: {
                    body: {
                        formatData: (item:any) => {
                            return {
                                ...item,
                                amount_in_soles: item.amount_in_soles.toFixed(2),
                                amount_in_dollars: item.amount_in_dollars.toFixed(2),
                            }
                        }
                    }
                }
            },
            {
                id: 'attendances-by-workers-jobs-expenses',
                title: 'Gastos por Trabajadores en Planilla',
                filters: [
                    {
                        id: 'date_range',
                        name: 'Rango Fechas',
                        isRequired: true,
                        type: 'daterangemonth',
                        value: {
                            start: DateTime.now().startOf('month').toFormat('yyyy-MM-dd'),
                            end: DateTime.now().toFormat('yyyy-MM-dd')
                        }
                    },
                    {
                        id: 'job_code',
                        name: 'Job',
                        isRequired: false,
                        type: 'dropdown',
                        options: jobsDropdownOptions
                    },
                    {
                        id: 'country',
                        name: 'País',
                        isRequired: false,
                        type: 'dropdown',
                        options: countryTypesDropdownOptions
                    },
                    {
                        id: 'job_zone',
                        name: 'Zona de Job',
                        isRequired: false,
                        type: 'dropdown',
                        options: jobsZonesDropdownOptions
                    },
                    {
                        id: 'expense_code',
                        name: 'Expense Code',
                        isRequired: false,
                        type: 'dropdown',
                        options: expensesDropdownOptions
                    },
                    {
                        id: 'supervisor',
                        name: 'Supervisor',
                        isRequired: false,
                        type: 'textbox',
                        value: null
                    },
                    {
                        id: 'worker_dni',
                        name: 'DNI Trabajador',
                        isRequired: false,
                        type: 'textbox',
                        value: null
                    }
                ],
                endpoint: 'attendances/by-workers-jobs-expenses',
                data: {
                    body: {
                        formatData: (item:any) => {
                            Object.keys(item).forEach((key) => {
                                if (key.endsWith('_money')){
                                    item[key] = item[key].toFixed(2);
                                }
                            })
                            return {
                                ...item,
                            }
                        }
                    }
                }
            },
            {
                id: 'attendances-by-workers',
                title: 'Asistencias x Trabajadores',
                filters: [
                    {
                        id: 'date_range',
                        name: 'Rango Fechas',
                        isRequired: true,
                        type: 'daterange',
                        value: {
                            start: DateTime.now().startOf('month').toFormat('yyyy-MM-dd'),
                            end: DateTime.now().toFormat('yyyy-MM-dd')
                        }
                    },
                    {
                        id: 'team',
                        name: 'Equipo',
                        isRequired: false,
                        type: 'textbox',
                        value: null
                    },
                    {
                        id: 'function',
                        name: 'Función',
                        isRequired: false,
                        type: 'textbox',
                        value: null
                    },
                    {
                        id: 'supervisor',
                        name: 'Supervisor',
                        isRequired: false,
                        type: 'textbox',
                        value: null
                    },
                    {
                        id: 'worker_dni',
                        name: 'DNI Trabajador',
                        isRequired: false,
                        type: 'textbox',
                        value: null
                    }
                ],
                endpoint: 'attendances/by-worker',
                data: {
                    body: {
                        formatData: (item:any) => {
                            return {
                                ...item,
                                
                            }
                        }
                    }
                }
            },
            {
                id: 'inventory-by-products-kardex',
                title: 'Kardex de Productos en Inventario',
                filters: [
                    {
                        id: 'date_range',
                        name: 'Rango Fechas',
                        isRequired: true,
                        type: 'daterange',
                        value: {
                            start: DateTime.now().startOf('month').toFormat('yyyy-MM-dd'),
                            end: DateTime.now().toFormat('yyyy-MM-dd')
                        }
                    },
                    {
                        id: 'warehouse_ids',
                        name: 'Almacén',
                        isRequired: false,
                        type: 'dropdown',
                        multiple: true,
                        options: warehousesDropdownOptions
                    },
                    {
                        id: 'job_code',
                        name: 'Job',
                        isRequired: false,
                        type: 'dropdown',
                        options: jobsDropdownOptions
                    },
                    {
                        id: 'expense_code',
                        name: 'Expense Code',
                        isRequired: false,
                        type: 'dropdown',
                        options: expensesDropdownOptions
                    },
                    {
                        id: 'product_id',
                        name: 'Producto',
                        isRequired: false,
                        type: 'dropdown',
                        options: productsDropdownOptions
                    },
                    {
                        id: 'money_type',
                        name: 'Moneda',
                        isRequired: false,
                        type: 'dropdown',
                        options: moneyTypesDropdownOptions
                    },
                    {
                        id: 'categories',
                        name: 'Categorías',
                        isRequired: false,
                        type: 'dropdown',
                        multiple: true,
                        options: productsCategoriesDropdownOptions
                    },
                    {
                        id: 'sub_categories',
                        name: 'Subcategorías',
                        isRequired: false,
                        type: 'dropdown',
                        multiple: true,
                        options: productsSubCategoriesDropdownOptions
                    }
                ],
                endpoint: 'inventory/by-products-kardex',
                data: {
                    body: {
                        formatData: (item:any) => {
                            return {
                                ...item,
                                ticket_type: (item.ticket_type) ? item.ticket_type === 'Bill' ? 'Boleta' : 'Factura' : '',
                            }
                        }
                    }
                }
            },
            {
                id: 'inventory-by-products-loans-kardex',
                title: 'Kardex de Préstamos en Inventario',
                filters: [
                    {
                        id: 'warehouse_ids',
                        name: 'Almacén',
                        isRequired: false,
                        type: 'dropdown',
                        multiple: true,
                        options: warehousesDropdownOptions
                    },
                    {
                        id: 'product_id',
                        name: 'Producto',
                        isRequired: false,
                        type: 'dropdown',
                        options: productsDropdownOptions
                    },
                    {
                        id: 'date_range',
                        name: 'Rango Fechas',
                        isRequired: true,
                        type: 'daterange',
                        value: {
                            start: DateTime.now().startOf('month').toFormat('yyyy-MM-dd'),
                            end: DateTime.now().toFormat('yyyy-MM-dd')
                        }
                    },
                    {
                        id: 'categories',
                        name: 'Categorías',
                        isRequired: false,
                        type: 'dropdown',
                        multiple: true,
                        options: productsCategoriesDropdownOptions
                    },
                    {
                        id: 'sub_categories',
                        name: 'Subcategorías',
                        isRequired: false,
                        type: 'dropdown',
                        multiple: true,
                        options: productsSubCategoriesDropdownOptions
                    }
                ],
                endpoint: 'inventory/by-products-loans-kardex',
                data: {
                    body: {
                        
                    }
                }
            },
            {
                id: 'inventory-by-products-balance',
                title: 'Saldo de Productos en Inventario',
                filters: [
                    {
                        id: 'warehouse_ids',
                        name: 'Almacén',
                        isRequired: false,
                        type: 'dropdown',
                        multiple: true,
                        options: warehousesDropdownOptions
                    },
                    {
                        id: 'product_id',
                        name: 'Producto',
                        isRequired: false,
                        type: 'dropdown',
                        options: productsDropdownOptions
                    },
                    {
                        id: 'money_type',
                        name: 'Moneda',
                        isRequired: false,
                        type: 'dropdown',
                        options: moneyTypesDropdownOptions
                    },
                    {
                        id: 'categories',
                        name: 'Categorías',
                        isRequired: false,
                        type: 'dropdown',
                        multiple: true,
                        options: productsCategoriesDropdownOptions
                    },
                    {
                        id: 'sub_categories',
                        name: 'Subcategorías',
                        isRequired: false,
                        type: 'dropdown',
                        multiple: true,
                        options: productsSubCategoriesDropdownOptions
                    }
                ],
                endpoint: 'inventory/by-products-balance',
                data: {
                    body: {
                        
                    }
                }
            },
            {
                id: 'inventory-by-products-stock',
                title: 'Stock de Productos en Inventario',
                filters: [
                    {
                        id: 'warehouse_ids',
                        name: 'Almacén',
                        isRequired: false,
                        type: 'dropdown',
                        multiple: true,
                        options: warehousesDropdownOptions
                    },
                    {
                        id: 'product_id',
                        name: 'Producto',
                        isRequired: false,
                        type: 'dropdown',
                        options: productsDropdownOptions
                    },
                    {
                        id: 'status',
                        name: 'Activación',
                        isRequired: false,
                        type: 'dropdown',
                        options: [
                            {
                                id: 'Active',
                                name: 'Activo',
                                value: 'Active'
                            },
                            {
                                id: 'Inactive',
                                name: 'Inactivo',
                                value: 'Inactive'
                            }
                        ]
                    },
                    {
                        id: 'brand',
                        name: 'Marca',
                        isRequired: false,
                        type: 'textbox',
                        value: null
                    },
                    {
                        id: 'categories',
                        name: 'Categorías',
                        isRequired: false,
                        type: 'dropdown',
                        multiple: true,
                        options: productsCategoriesDropdownOptions
                    },
                    {
                        id: 'sub_categories',
                        name: 'Subcategorías',
                        isRequired: false,
                        type: 'dropdown',
                        multiple: true,
                        options: productsSubCategoriesDropdownOptions
                    }
                ],
                endpoint: 'inventory/by-products-stock',
                data: {
                    body: {
                        
                    }
                }
            },
            {
                id: 'inventory-by-products',
                title: 'Productos en Inventario',
                filters: [
                    {
                        id: 'categories',
                        name: 'Categorías',
                        isRequired: false,
                        type: 'dropdown',
                        multiple: true,
                        options: productsCategoriesDropdownOptions
                    },
                    {
                        id: 'sub_categories',
                        name: 'Subcategorías',
                        isRequired: false,
                        type: 'dropdown',
                        multiple: true,
                        options: productsSubCategoriesDropdownOptions
                    }
                ],
                endpoint: 'inventory/by-products',
                data: {
                    body: {
                        
                    }
                }
            },
        ];
    }
}



export default RecordsConfigs;