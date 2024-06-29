
import { JobsAndExpenses, JobsAndExpenses } from '@/utils/Stored/JobsAndExpenses';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
import * as ExcelJS from 'exceljs';

interface IGenerateAttendancesByWorkersJobsExpensesData{
    headers: Array<{
        key: string
        name: string
    }>,
    body: Array<{[key: string]: any}>,
    footer: {[key: string]: any}
}

export class GenerateAttendancesByWorkersJobsExpenses{
    public static async render(data:IGenerateAttendancesByWorkersJobsExpensesData){
        const expenses = await JobsAndExpenses.getExpenses();
        const jobs = await JobsAndExpenses.getJobs();

        let columnsKeysToRemove:Array<string> = [];
        const getJobByCode = (code: string) => {
            return jobs.find((job) => job.code == code);
        }
        const getExpenseByCode = (code: string) => {
            return expenses.find((expense) => expense.code == code);
        }

        const mountLeftSideHeader = () => {
            const firstRow = () => {
                return data.headers.map((header) => {
                    if (header.key == 'id'){
                        return `<td rowspan="4" style="border: thin solid black; border-top: 1px solid black;border-bottom: 1px solid black; font-weight: bold; vertical-align: middle; text-align: center;" key="${header.key}">ID</td>`;
                    }else if (header.key == 'name'){
                        return `<td rowspan="4" style="border: thin solid black; border-top: 1px solid black;border-bottom: 1px solid black; font-weight: bold; vertical-align: middle; text-align: center;" key="${header.key}">Nombres y Apellidos</td>`;
                    }else if (header.key == 'dni'){
                        return `<td rowspan="4" style="border: thin solid black; border-top: 1px solid black;border-bottom: 1px solid black; font-weight: bold; vertical-align: middle; text-align: center;" key="${header.key}">DNI</td>`;
                    }else if (header.key.startsWith('worker_total_amount_in_') && !header.key.includes('division')){
                        return `<td style="border: thin solid black; border-top: 1px solid black;font-weight: bold; vertical-align: middle; text-align: center;" key="${header.key}">Sueldo</td>`;
                    }else if (header.key.startsWith('worker_daily_total_amount_in')){
                        return `<td  style="border: thin solid black; border-top: 1px solid black;font-weight: bold; vertical-align: middle; text-align: center;" key="${header.key}">Sueldo</td>`;
                    }else if (header.key.startsWith('worker_total_amount_in_division_')){
                        return `<td style="border: thin solid black; border-top: 1px solid black;font-weight: bold; vertical-align: middle; text-align: center;" key="${header.key}">Sueldo</td>`;
                    }else if (header.key.startsWith('worker_total_days_present')){
                        return `<td rowspan="4"  style="border: thin solid black; border-top: 1px solid black;border-bottom: 1px solid black; font-weight: bold; vertical-align: middle; text-align: center;" key="${header.key}">Dias presentes</td>`;
                    }else{
                        return null;
                    }
                }).filter((header) => header != null).join('');
            }
            const secondRow = () => {
                return data.headers.map((header) => {
                    if (header.key == 'id'){
                        return null;
                    }else if (header.key == 'name'){
                        return null;
                    }else if (header.key == 'dni'){
                        return null;
                    }else if (header.key.startsWith('worker_total_amount_in_')  && !header.key.includes('division')){
                        return `<td rowspan="2" style="border: thin solid black; font-weight: bold; vertical-align: middle; text-align: center;" key="${header.key}">Total</td>`;
                    }else if (header.key.startsWith('worker_daily_total_amount_in')){
                        return `<td rowspan="2"  style="border: thin solid black; font-weight: bold; vertical-align: middle; text-align: center;" key="${header.key}">Diário</td>`;
                    }else if (header.key.startsWith('worker_total_days_present')){
                        return null;
                    }else if (header.key.startsWith('worker_total_amount_in_division_')){
                        return `<td style="border: thin solid black; font-weight: bold; vertical-align: middle; text-align: center;" key="${header.key}">Parciales</td>`;
                    }else{
                        return null;
                    }
                }).filter((header) => header != null).join('');
            }
            const thirdRow = () => {
                return data.headers.map((header) => {
                    if (header.key == 'id'){
                        return null;
                    }else if (header.key == 'name'){
                        return null;
                    }else if (header.key == 'dni'){
                        return null;
                    }else if (header.key.startsWith('worker_total_amount_in_')  && !header.key.includes('division')){
                        return null;
                    }else if (header.key.startsWith('worker_daily_total_amount_in')){
                        return null;
                    }else if (header.key.startsWith('worker_total_days_present')){
                        return null;
                    }else if (header.key.startsWith('worker_total_amount_in_division_')){
                        return `<td style="border: thin solid black; font-weight: bold; vertical-align: middle; text-align: center;" key="${header.key}">${Toolbox.getStringBetweenStrings(['worker_total_amount_in_division_/~/', '_/~/_in_'], header.key)}</td>`;
                    }else{
                        return null;
                    }
                }).filter((header) => header != null).join('');
            }
            const fourthRow = () => {
                return data.headers.map((header) => {
                    if (header.key == 'id'){
                        return null;
                    }else if (header.key == 'name'){
                        return null;
                    }else if (header.key == 'dni'){
                        return null;
                    }else if (header.key.startsWith('worker_total_amount_in_')  && !header.key.includes('division')){
                        return `<td  style="border: thin solid black; border-bottom: 1px solid black; font-weight: bold; vertical-align: middle; text-align: center;" key="${header.key}">${(Toolbox.getStringBetweenStrings(['worker_total_amount_in_', '_money'], header.key))}</td>`;
                    }else if (header.key.startsWith('worker_daily_total_amount_in_')){
                        return `<td  style="border: thin solid black; border-bottom: 1px solid black; font-weight: bold; vertical-align: middle; text-align: center;" key="${header.key}">${(Toolbox.getStringBetweenStrings(['worker_daily_total_amount_in_', '_money'], header.key))}</td>`;
                    }else if (header.key.startsWith('worker_total_days_present')){
                        return null;
                    }else if (header.key.startsWith('worker_total_amount_in_division_')){
                        return `<td style="border: thin solid black; border-bottom: 1px solid black; font-weight: bold; vertical-align: middle; text-align: center;" key="${header.key}">${Toolbox.getStringBetweenStrings(['_/~/_in_', '_money'], header.key)}</td>`;
                    }else{
                        return null;
                    }
                }).filter((header) => header != null).join('');
            }

            return [
                firstRow(),
                secondRow(),
                thirdRow(),
                fourthRow()
            ];
        }

        const mountRightSideHeader = () => {
            const firstRow = () => {
                return data.headers.map((header) => {
                    if (header.key.startsWith('job_')){
                        const job = getJobByCode(Toolbox.getStringBetweenStrings(['job_', '_expense_'], header.key));
                        return `<td style="border: thin solid black; border-top: 1px solid black; background: #D6D6D6; font-weight: bold; vertical-align: middle; text-align: center;" key="${header.key}">${job?.code} - ${job?.name}</td>`;
                    }else{
                        return null;
                    }
                }).filter((header) => header != null).join('');
            }
            const secondRow = () => {
                return data.headers.map((header) => {
                    if (header.key.startsWith('job_')){
                        const expense = getExpenseByCode(Toolbox.getStringBetweenStrings(['_expense_', '_'], header.key));
                        return `<td style="border: thin solid black; font-weight: bold; vertical-align: middle; text-align: center;" key="${header.key}">${expense?.code} - ${expense?.name}</td>`;
                    }else{
                        return null;
                    }
                }).filter((header) => header != null).join('');
            }
            const thirdRow = () => {
                return data.headers.map((header) => {
                    if (header.key.startsWith('job_') && header.key.endsWith('_days_present')){
                        return `<td style="border: thin solid black; background: white; vertical-align: middle; text-align: center;" key="${header.key}">Días</td>`;
                    }else if (header.key.startsWith('job_') && header.key.endsWith('_money')){
                        return `<td style="border: thin solid black; background: white; vertical-align: middle; text-align: center;" key="${header.key}">Costo Neto</td>`;
                    }else{
                        return null;
                    }
                }).filter((header) => header != null).join('');
            }
            const fourthRow = () => {
                return data.headers.map((header) => {
                    if (header.key.startsWith('job_') && header.key.endsWith('_days_present')){
                        return `<td style="border: thin solid black;  border-bottom: 1px solid black; background: white; vertical-align: middle; text-align: center;" key="${header.key}">#</td>`;
                    }else if (header.key.startsWith('job_') && header.key.endsWith('_money')){
                        return `<td style="border: thin solid black;  border-bottom: 1px solid black; background: white; vertical-align: middle; text-align: center;" key="${header.key}">${(Toolbox.getStringBetweenStrings(['payment_', '_money'], header.key))}</td>`;
                    }else{
                        return null;
                    }
                }).filter((header) => header != null).join('');
            }
            return [
                firstRow(),
                secondRow(),
                thirdRow(),
                fourthRow()
            ];
        }

        const mountBody = () => {
            return data.body.map((row) => {
                const columns = data.headers.map((header) => {
                    const value = row[header.key];
                    if (value == undefined){
                        return `<td style="border: thin solid black; vertical-align: middle; text-align: center;" key="${header.key}"></td>`
                    }
                    return `<td style="border: thin solid black; vertical-align: middle; text-align: center;" key="${header.key}">${row[header.key]}</td>`;
                }).filter((header) => header != null).join('');

                return `<tr>${columns}</tr>`;
            }).join('');
        }

        const mountFooter = () => {
            //Create an array of 10 empty columns:
            const span = Array.from({length: 1}, () => null).map((_, index) => {
                return `<td colspan="4" style="border: thin solid black; vertical-align: middle; text-align: right; font-weight: bold;">Totales:</td>`
            }).join('');

            const columns = Object.keys(data.footer).map((key) => {
                if (!key.endsWith('_money')){
                    return `<td style="border: thin solid black; vertical-align: middle; text-align: center;"></td>`
                }
                const value = data.footer[key];
                if (value == 0){
                    columnsKeysToRemove.push(key);
                }
                return `<td style="border: thin solid black; font-weight: bold; vertical-align: middle; text-align: center;" key="${key}">${value}</td>`;
            }).join('');

            return `<tr style="border-top: 1px solid black;"></tr><tr style="background:#EBEBEB;">${span}${columns}</tr>`;
        }

        const mountTable = () => {
            const headerLeftSide = mountLeftSideHeader();
            const headerRightSide = mountRightSideHeader();
            const body = mountBody();
            const footer = mountFooter();

            let documentHeaderElements:any = [
                `<tr document-header><td style="background: white; border: 1px solid black; font-weight: bold; font-size: 18px;" colspan="4">Maranatha Perú</td></tr>`,
                `<tr document-header><td style="background: white; border: 1px solid black; font-weight: bold; font-size: 14px;" colspan="4">Pago Personal de Taller y Construcción en Planilla</td></tr>`,
                `<tr document-header><td></td></tr>`,
                `<tr document-header><td></td></tr>`,
            ];

            let headerElements:any = [
                `<tr header style="background: #EBEBEB;">${headerLeftSide[0]}${headerRightSide[0]}</tr>`,
                `<tr header style="background: #EBEBEB;">${headerLeftSide[1]}${headerRightSide[1]}</tr>`,
                `<tr header style="background: #EBEBEB;">${headerLeftSide[2]}${headerRightSide[2]}</tr>`,
                `<tr header style="background: #EBEBEB;">${headerLeftSide[3]}${headerRightSide[3]}</tr>`
            ];

            


            const table = `<table border="1" style="border-collapse: collapse;"><thead>${documentHeaderElements.join('')}</thead><tbody>${headerElements.join('')}${body}${footer}</tbody></table>`

            //Create element for table on document, inject on dom, and get the element outerHTML:
            const tableElement = document.createElement('table');
            tableElement.innerHTML = table;


            tableElement.querySelectorAll('td').forEach((td) => {
                //Check if the key is in the columnsKeysToRemove array:
                if (columnsKeysToRemove.includes(td.getAttribute('key') as any)){
                    td.parentElement?.removeChild(td);
                }
            })

            tableElement.querySelectorAll('[header]').forEach((tr) => {
                const newTr = GenerateAttendancesByWorkersJobsExpenses.mergeColumnsWithSameValue(tr)
                tr.parentElement?.replaceChild(newTr, tr);
            })

            

            document.body.appendChild(tableElement);
            const tableHTML = tableElement.outerHTML;
            document.body.removeChild(tableElement);

            const context = {
                worksheet: 'Worksheet',
                table: tableHTML
            };
            function format(s, c) {
                return s.replace(/{(\w+)}/g, (m, p) => c[p]);
            }
            const template =
                '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-mic' +
                'rosoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta cha' +
                'rset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:Exce' +
                "lWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/>" +
                "</x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></" +
                "xml><![endif]--></head><body>{table}</body></html>";

            const base64 = window.btoa(unescape(encodeURIComponent(format(template, context))));
            return base64;
        }
        

        return new Promise((resolve, reject) => {
            const base64 = mountTable();
            resolve(base64);
        })
        
    }

    private static mergeColumnsWithSameValue(row: HTMLTableRowElement): HTMLTableRowElement {
        const cells = Array.from(row.cells);
        
        function mergeCellsRecursive(index: number): void {
          if (index >= cells.length - 1) return;
      
          const currentCell = cells[index];
          const nextCell = cells[index + 1];
      
          if (currentCell.textContent === nextCell.textContent) {
            // Merge cells
            currentCell.colSpan += nextCell.colSpan;
            row.removeChild(nextCell);
            cells.splice(index + 1, 1);
      
            // Continue checking from the same index
            mergeCellsRecursive(index);
          } else {
            // Move to the next cell
            mergeCellsRecursive(index + 1);
          }
        }
      
        mergeCellsRecursive(0);
        
        return row;
    }
}