import { EMoneyType } from "@/interfaces/ReportInterfaces";
import { RequestAPI } from "@/utils/Requests/RequestAPI";
import { JobsAndExpenses } from "@/utils/Stored/JobsAndExpenses";
import { Toolbox } from "@/utils/Toolbox/Toolbox";
import { DateTime } from "luxon";


const jobs = await JobsAndExpenses.getJobs();
const expenses = await JobsAndExpenses.getExpenses();

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

const RecordsConfigs = [
    {
        id: 'jobs-by-costs',
        title: 'Gastos x Jobs',
        filters: [
            {
                id: 'start_date',
                name: 'Fecha de Início',
                isRequired: true,
                type: 'date',
                value: DateTime.now().minus({years: 2}).toISO()
            },
            {
                id: 'end_date',
                name: 'Fecha de Fin',
                isRequired: true,
                type: 'date',
                value: DateTime.now().toISO()
            },
            {
                id: 'job_region',
                name: 'Zona de Job',
                isRequired: false,
                type: 'dropdown',
                options: [
                    {
                        id: 'North',
                        name: 'Zona Norte',
                        value: 'North'
                    },
                    {
                        id: 'South',
                        name: 'Zona Sur',
                        value: 'South'
                    },
                    {
                        id: 'NoZone',
                        name: 'Sin Zona',
                        value: 'NoZone'
                    },
                ]
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
        id: 'attendances-by-jobs',
        title: 'Asistencias x Jobs',
        filters: [
            {
                id: 'start_date',
                name: 'Fecha de Início',
                isRequired: true,
                type: 'date',
                value: DateTime.now().minus({years: 2}).toISO()
            },
            {
                id: 'end_date',
                name: 'Fecha de Fin',
                isRequired: true,
                type: 'date',
                value: DateTime.now().toISO()
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
                        amount_in_soles: Toolbox.moneyFormat(item.amount_in_soles, EMoneyType.PEN),
                        amount_in_dollars: Toolbox.moneyFormat(item.amount_in_dollars, EMoneyType.USD),
                        day_work_amount_in_dollars: Toolbox.moneyFormat(item.day_work_amount_in_dollars, EMoneyType.USD),
                        day_work_amount_in_soles: Toolbox.moneyFormat(item.day_work_amount_in_soles, EMoneyType.PEN),
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
                id: 'start_date',
                name: 'Fecha de Início',
                isRequired: true,
                type: 'date',
                value: DateTime.now().minus({years: 2}).toISO()
            },
            {
                id: 'end_date',
                name: 'Fecha de Fin',
                isRequired: true,
                type: 'date',
                value: DateTime.now().toISO()
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
        id: 'users-by-costs',
        title: 'Gastos x Usuário',
        filters: [
            {
                id: 'start_date',
                name: 'Fecha de Início',
                isRequired: true,
                type: 'date',
                value: DateTime.now().minus({years: 2}).toISO()
            },
            {
                id: 'end_date',
                name: 'Fecha de Fin',
                isRequired: true,
                type: 'date',
                value: DateTime.now().toISO()
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
    }
];



export default RecordsConfigs;