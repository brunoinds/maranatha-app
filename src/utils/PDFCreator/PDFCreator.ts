import { IInvoice } from "@/interfaces/InvoiceInterfaces";
import { IReport } from "@/interfaces/ReportInterfaces";
import { RequestAPI } from "@/utils/Requests/RequestAPI";
import { Session } from "@/utils/Session/Session";
import { JobsAndExpenses } from "@/utils/Stored/JobsAndExpenses";
import { Toolbox } from "@/utils/Toolbox/Toolbox";
import imageCompression from "browser-image-compression";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { DateTime } from "luxon";


interface PDFCreatorOptions{
    report: IReport,
    invoices: Array<IInvoice>,
    textContents: {
        submittedBy: string,
        fromDateToDate: string,
        currency: string
    },
    listenTo: {
        onProgress: (progress: {
            percentage: number,
            stage: {
                percentage: number,
                name: string,
            },
            iddle?: boolean
        }) => void,
    }
}
class PDFCreator{
    private doc: jsPDF;
    private canvasItems: Array<{
        invoice: IInvoice,
        imageBase64: string|null,
        canvas: HTMLCanvasElement,
        canvasBase64: string|null,
    }>;
    private report: IReport;
    private textContents: {
        submittedBy: string,
        fromDateToDate: string,
        currency: string,
    }
    private invoices: Array<IInvoice>;
    private progress: {
        percentage: number,
        stage: {
            percentage: number,
            name: string,
        },
        iddle?: boolean
    } | null = null;
    private options: PDFCreatorOptions;
    
    constructor(options: PDFCreatorOptions){
        this.doc = new jsPDF();
        this.canvasItems = [];
        this.invoices = options.invoices;
        this.report = options.report;
        this.textContents = options.textContents;
        this.options = options;
    }


    public async create(){
        await this.loadImages();
        await this.generateTableOnPDF();
        await this.generateImagesPagesOnPDF();
        
        return this.doc.output('datauristring');
    }


    private generateTableOnPDF(){
        return new Promise(async (resolve, reject) => {
            this.updateProgress(`Generando tabla (0/28)...`, {current: 0, total: 28}, 2, 3);

            const pageWidth = this.doc.internal.pageSize.getWidth() as unknown as number;
            this.doc.setFontSize(13).setFont('helvetica', 'bold');
            this.doc.text("MARANATHA", pageWidth / 2, 10, { align: 'center'});
            this.doc.setFontSize(10);
            this.doc.text("EXPENSE REPORT", pageWidth / 2, 17, { align: 'center'});
            this.doc.setFontSize(9).setFont('helvetica', 'normal');
            this.doc.text("Country - Peru", pageWidth / 2, 24, { align: 'center' });
            
            this.doc.setFontSize(8).setFont('helvetica', 'normal');
            this.doc.text("Report Dates: ", (pageWidth / 2) - 22, 29, { align: 'center' });
            this.doc.text("Submitted by: ", (pageWidth / 2) - 22.05, 34, { align: 'center' });
            this.doc.text("Currency: ", (pageWidth / 2) - 19, 39, { align: 'center' });


            this.doc.text(this.textContents.fromDateToDate, (pageWidth / 2) - 12, 29, { align: 'left' });
            this.doc.text(this.textContents.submittedBy, (pageWidth / 2) - 12, 34, { align: 'left' });
            this.doc.text((this.textContents.currency), (pageWidth / 2) - 12, 39, { align: 'left' });


            (this.doc as any).autoTable({
                startY: 45,
                theme: 'grid',
                headStyles: {
                    fillColor: [235, 235, 235],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    lineColor: [0, 0, 0],
                    lineWidth: 0.1,
                    fontSize: 8
                },
                bodyStyles: {lineColor: [0, 0, 0], fontSize: 8},
                head: [['DATE', 'INVOICE/TICKET', 'INVOICE/TICKET DESCRIPTION', 'JOB', 'EXPENSE CODE', '#', 'TOTAL'].map((item) => {
                    return {content: item, styles: { valign: 'middle', halign: 'center' }}
                })],
                body: (() => {
                    const listRows:any = [];
                    //Generate array of 28 items:
                    Array.from(Array(28).keys()).forEach((index) => {
                        if (this.canvasItems[index]){
                            const invoice = this.canvasItems[index].invoice;
                            const date = DateTime.fromISO(invoice.date).toFormat('dd/MM/yyyy');
                            listRows.push([date,invoice.ticket_number, invoice.description, invoice.job_code, invoice.expense_code, index + 1, Toolbox.moneyPrefix(this.report.money_type) + " " + invoice.amount.toFixed(2)].map((item, i) => {
                                if (i == 2){
                                    return {content: item, styles: { valign: 'middle', halign: 'left' }}
                                }else{
                                    return {content: item, styles: { valign: 'middle', halign: 'center' }}
                                }
                            }))
                        }else{
                            listRows.push(['', '', '', '', '', index + 1, ''].map((item) => {
                                return {content: item, styles: { valign: 'middle', halign: 'center' }}
                            }));
                        }
                        this.updateProgress(`Generando tabla (${index}/28)...`, {current: index, total: 28}, 2, 3);
                    })
                    return listRows;
                })(),
                foot: [
                    [
                        
                        {
                            content: 'Total',
                            dataKey: 'total-amount-label',
                            colSpan: 6,
                            styles: {
                                fillColor: [255, 255, 255],
                                textColor: 'black',
                                lineColor: 'black',
                                lineWidth: 0.1,
                                halign: 'right'
                            },
                        },
                        {
                            content: Toolbox.moneyPrefix(this.report.money_type) + " " + (() => {
                                let accumulator = 0;
                                this.invoices.forEach((invoice) => {
                                    accumulator += invoice.amount;
                                })
                                return accumulator.toFixed(2);
                            })(),
                            dataKey: 'total-amount-value',
                            styles: {
                                fillColor: [255, 255, 255],
                                textColor: 'black',
                                lineColor: 'black',
                                lineWidth: 0.1,
                                valign: 'middle', 
                                halign: 'right'
                            },
                        },
                    ],
                ],
                tableLineColor: [0, 0, 0],
                tableLineWidth: 0.5
            })

            this.updateProgress(`Generando tabla (28/28)...`, {current: 28, total: 28}, 2, 3);
            resolve(this.doc);
        })
        
    }
    private generateImagesPagesOnPDF(){
        return new Promise(async (resolve, reject) => {
            const jobs = await JobsAndExpenses.getJobs();
            //Add each image from this.canvasItems.canvasBase64 to a new page on this.doc:
            this.canvasItems.forEach((canvasItem, i) => {
                const totalInvoices = this.canvasItems.length;
                this.doc.addPage();

                const pageHeight = this.doc.internal.pageSize.getHeight();
                const pageWidth = this.doc.internal.pageSize.getWidth();
                const textPadding = {
                    x: 5,
                    y: 5
                }

                const pageTexting = [
                    {text: `${canvasItem.invoice.description}`},
                    {text: `${jobs.find((item) => item.code == canvasItem.invoice.job_code) ? jobs.find((item) => item.code == canvasItem.invoice.job_code)?.name : ""} ${canvasItem.invoice.job_code}-${canvasItem.invoice.expense_code}`},
                ]

                //If canvas is portrait, fit it to page:
                if (canvasItem.canvas.height > canvasItem.canvas.width){
                    //Fit canvas to page:
                    const pageWidth = this.doc.internal.pageSize.getWidth() as unknown as number;
                    const pageHeight = this.doc.internal.pageSize.getHeight() as unknown as number;
                    const canvasRatio = canvasItem.canvas.width / canvasItem.canvas.height;
                    const pageRatio = pageWidth / pageHeight;
                    if (canvasRatio > pageRatio){
                        //Fit canvas to page width:
                        const newCanvasHeight = canvasItem.canvas.height * (pageWidth / canvasItem.canvas.width);
                        this.doc.addImage(canvasItem.canvas, 'JPEG', 0, (pageHeight - newCanvasHeight) / 2, pageWidth, newCanvasHeight);
                    }else{
                        //Fit canvas to page height:
                        const newCanvasWidth = canvasItem.canvas.width * (pageHeight / canvasItem.canvas.height);
                        this.doc.addImage(canvasItem.canvas, 'JPEG', (pageWidth - newCanvasWidth) / 2, 0, newCanvasWidth, pageHeight);
                    }
                }else if (canvasItem.canvas.height <= canvasItem.canvas.width){
                    //Fit canvas to page:
                    const pageWidth = this.doc.internal.pageSize.getWidth() as unknown as number;
                    const pageHeight = this.doc.internal.pageSize.getHeight() as unknown as number;
                    const canvasRatio = canvasItem.canvas.width / canvasItem.canvas.height;
                    const pageRatio = pageWidth / pageHeight;
                    if (canvasRatio > pageRatio){
                        //Fit canvas to page width:
                        const newCanvasHeight = canvasItem.canvas.height * (pageWidth / canvasItem.canvas.width);
                        this.doc.addImage(canvasItem.canvas, 'JPEG', 0, (pageHeight - newCanvasHeight) / 2, pageWidth, newCanvasHeight);
                    }else{
                        //Fit canvas to page height:
                        const newCanvasWidth = canvasItem.canvas.width * (pageHeight / canvasItem.canvas.height);
                        this.doc.addImage(canvasItem.canvas, 'JPEG', (pageWidth - newCanvasWidth) / 2, 0, newCanvasWidth, pageHeight);
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = 500;
                canvas.height = this.doc.internal.pageSize.getHeight() as unknown as number;
                const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;

                ctx.font = '18px Arial'; 
                ctx.fillStyle = 'yellow';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 3;
                

                pageTexting.reverse().forEach((textItem, index) => {
                    ctx.strokeText(textItem.text, textPadding.x + 10, 30 + ((index * 20)));
                    ctx.fillText(textItem.text, textPadding.x + 10, 30 + ((index * 20)));
                });
                this.doc.addImage(canvas, 'PNG', 0, 0); 
                this.updateProgress(`Agregando fotos (${i}/${totalInvoices})...`, {current: i, total: totalInvoices}, 3, 3);
            })
            resolve(this.doc);
        })
    }

    private async loadImages(){
        const totalInvoices = this.invoices.length;
        let countInvoicesImagesLoaded = 0;
        return new Promise((resolve, reject) => {
            const promises = this.invoices.map((invoice, i) => {
                return new Promise((resolve, reject) => {
                    RequestAPI.get('/invoices/' + invoice.id + "/image").then((response) => {
                        const imageBase64 = "data:image/png;base64," + response.image;
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
                        const image = new Image();
                        image.src = imageBase64;
                        image.onload = () => {
                            canvas.width = image.width;
                            canvas.height = image.height;
                            context.drawImage(image, 0, 0);

                            const canvasItem = {
                                invoice: invoice,
                                imageBase64: imageBase64,
                                canvas: canvas,
                                canvasBase64: null
                            }
                            this.canvasItems.push(canvasItem);
                            countInvoicesImagesLoaded++;
                            this.updateProgress(`Descargando fotos (${countInvoicesImagesLoaded}/${totalInvoices})...`, {current: countInvoicesImagesLoaded, total: totalInvoices}, 1, 3);
                            resolve(canvasItem);
                        }
                    })
                })
            })
            this.updateProgress(`Descargando fotos (0/${totalInvoices})...`, {current: 0, total: totalInvoices, iddle: true}, 1, 3);
            Promise.all(promises).then((canvasItems) => {
                this.canvasItems = canvasItems;
                resolve(this.canvasItems);
            })
        })
    }


    private updateProgress(stageName: string, stageProgress: {
        current: number, 
        total: number,
        iddle?: boolean
    }, currentStage: number, numberOfStages: number){
        if (numberOfStages == 0){
            throw new Error("numberOfStages can't be 0");
        }

        const currentStageProgress = (stageProgress.current / stageProgress.total) * 100;

        //Overall progress 
        const overallProgress = (100 * (((currentStage - 1) * 100) + currentStageProgress)) /  (numberOfStages * 100)

        this.progress = {
            percentage: overallProgress,
            stage: {
                percentage: currentStageProgress,
                name: stageName,
            },
            iddle: stageProgress.iddle ? true : false,
        }
        this.options.listenTo.onProgress(this.progress);
    }
}

export { PDFCreator };
export type { PDFCreatorOptions };

