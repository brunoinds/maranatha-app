import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { DateTime } from 'luxon';
import { Session } from '@/utils/Session/Session';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface IRecordFilter {
    id: string;
    name: string;
    isRequired: boolean;
    type: string;
    options?: any[];
    value?: any;
}

interface IRecordData {
    headers: any[];
    footer?: any | null;
    rules?: any | null;
    body: any[];
    query: any;
}

class PdfGenerator {
    public static generatePdfFrom(options: { filters: IRecordFilter[], data: IRecordData, title: string }) {
        return new Promise((resolve, reject) => {
            try {
                // Create PDF in landscape mode
                const doc = new jsPDF('landscape', 'mm', 'a4');
                
                // Get page dimensions
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                const margin = 10;
                const contentWidth = pageWidth - (margin * 2);
                
                // Calculate dynamic font size based on number of columns
                const maxColumns = options.data.headers.length;
                const baseFontSize = 12;
                const minFontSize = 6;
                const maxFontSize = 14;
                
                // Calculate optimal font size to fit table horizontally
                let fontSize = Math.max(minFontSize, Math.min(maxFontSize, baseFontSize - (maxColumns - 5) * 0.5));
                
                // Add master header rows
                let currentY = margin;
                
                // MARANATHA header
                doc.setFontSize(20);
                doc.setFont('helvetica', 'bold');
                doc.text('MARANATHA', pageWidth / 2, currentY, { align: 'center' });
                currentY += 8;
                
                // Title
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text(options.title, pageWidth / 2, currentY, { align: 'center' });
                currentY += 6;
                
                // Empty line
                currentY += 4;
                
                const masterHeaderHeight = currentY - margin;
                
                // Add filter rows
                let validFilters = 0;
                options.filters.forEach((filter) => {
                    const filterValue = (filter.value?.value) ? filter.value : filter;



                    if (filterValue && filterValue.value != null) {
                        let value = filterValue.value;
                        
                        if (filterValue.type === 'daterange') {
                            if (DateTime.fromISO(value.start).isValid && DateTime.fromISO(value.end).isValid) {
                                value = DateTime.fromISO(value.start).toFormat("dd/MM/yyyy") + " - " + DateTime.fromISO(value.end).toFormat("dd/MM/yyyy");
                            }
                        } else {
                            if (DateTime.fromISO(filterValue.value).isValid) {
                                value = DateTime.fromISO(filterValue.value).toFormat("dd/MM/yyyy");
                            }
                        }
                        
                        doc.setFontSize(fontSize - 2);
                        doc.setFont('helvetica', 'normal');
                        doc.text(`${filterValue.name}: ${value}`, pageWidth / 2, currentY, { align: 'center' });
                        currentY += 4;
                        validFilters++;
                    }
                });
                
                // Add some space before table
                currentY += 5;
                
                // Prepare table data
                const headers = options.data.headers.map(header => header.title);
                const bodyData = options.data.body.map(row => {
                    const orderObjectKeys = (obj: any, keyOrder: any) => {
                        const ordered: any = {};
                        keyOrder.forEach((key: any) => {
                            if (obj.hasOwnProperty(key)) {
                                ordered[key] = obj[key];
                            }
                        });
                        return ordered;
                    };
                    
                    const getObjectValues = (obj: any) => {
                        return Object.keys(obj).map(key => obj[key]);
                    };
                    
                    return getObjectValues(orderObjectKeys(row, options.data.headers.map((header) => header.key))).map((item) => {
                        if (item == null) {
                            return "";
                        }
                        return item;
                    });
                });
                
                // Calculate table width and adjust font size if needed
                const estimatedCellWidth = contentWidth / maxColumns;
                const minCellWidth = 12; // Minimum cell width in mm
                
                if (estimatedCellWidth < minCellWidth) {
                    fontSize = Math.max(minFontSize, fontSize * (estimatedCellWidth / minCellWidth));
                }
                
                // Ensure we don't go below minimum font size
                fontSize = Math.max(minFontSize, fontSize);
                
                // Prepare footer data
                let footerData: any[] = [];
                if (options.data.footer && options.data.footer.totals) {
                    const footerRow = new Array(maxColumns).fill('');
                    options.data.footer.totals.items.forEach((item: any) => {
                        const headerIndex = options.data.headers.findIndex((header: any) => header.key === item.key);
                        if (headerIndex >= 0) {
                            footerRow[headerIndex] = item.value;
                        }
                    });
                    footerData = [footerRow];
                }

                // Generate table with better column width handling
                const columnWidths = this.calculateColumnWidths(headers, bodyData, contentWidth, fontSize);
                
                (doc as any).autoTable({
                    startY: currentY,
                    theme: 'grid',
                    headStyles: {
                        fillColor: [235, 235, 235],
                        textColor: [0, 0, 0],
                        fontStyle: 'bold',
                        lineColor: [0, 0, 0],
                        lineWidth: 0.1,
                        fontSize: fontSize
                    },
                    bodyStyles: {
                        lineColor: [0, 0, 0],
                        lineWidth: 0.1,
                        fontSize: fontSize
                    },
                    footStyles: {
                        fillColor: [255, 255, 255],
                        textColor: [0, 0, 0],
                        fontStyle: 'bold',
                        lineColor: [0, 0, 0],
                        lineWidth: 0.1,
                        fontSize: fontSize
                    },
                    head: [headers.map((header) => ({
                        content: header,
                        styles: { valign: 'middle', halign: 'center' }
                    }))],
                    body: bodyData.map(row => 
                        row.map((cell, index) => ({
                            content: this.formatCellContent(cell, fontSize),
                            styles: { 
                                valign: 'middle', 
                                halign: 'center',
                                cellWidth: 'wrap'
                            }
                        }))
                    ),
                    foot: footerData.length > 0 ? [footerData[0].map((cell: any, index: number) => ({
                        content: this.formatCellContent(cell, fontSize),
                        styles: { 
                            valign: 'middle', 
                            halign: index === footerData[0].length - 1 ? 'right' : 'center',
                            fontStyle: 'bold'
                        }
                    }))] : undefined,
                    columnStyles: this.generateColumnStyles(columnWidths),
                    tableLineColor: [0, 0, 0],
                    tableLineWidth: 0.1,
                    margin: { left: margin, right: margin },
                    pageBreak: 'auto',
                    showHead: 'everyPage',
                    showFoot: 'lastPage',
                    didDrawPage: (data: any) => {
                        // Add page numbers and footer info
                        const pageNumber = doc.getNumberOfPages();
                        doc.setFontSize(8);
                        doc.setFont('helvetica', 'normal');
                        
                        // Get current datetime in America/Lima timezone
                        const currentDateTime = DateTime.now().setZone('America/Lima').toFormat('dd/MM/yyyy hh:mma');
                        
                        // Get current username
                        const username = Session.getCurrentSessionSync()?.username() || 'Unknown User';
                        
                        // Add left side info: datetime and username
                        const leftFooterText = `${currentDateTime} | Usuario: ${username}`;
                        doc.text(leftFooterText, margin, pageHeight - 5, { align: 'left' });
                        
                        // Add right side page number
                        doc.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
                    }
                });
                
                // Handle merging rules if present
                if (options.data.rules && options.data.rules.merging) {
                    // Note: jsPDF autoTable doesn't support cell merging like Excel
                    // This would require custom implementation or a different approach
                    console.warn('Cell merging rules are not supported in PDF generation');
                }
                
                // Convert to base64
                const pdfOutput = doc.output('datauristring');
                const base64Data = pdfOutput.split(',')[1];
                resolve(base64Data);
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Generate a custom PDF with a callback function for advanced customization
     */
    public static generateCustomPdfFrom(callback: (doc: jsPDF) => void) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new jsPDF('landscape', 'mm', 'a4');
                callback(doc);
                
                const pdfOutput = doc.output('datauristring');
                const base64Data = pdfOutput.split(',')[1];
                resolve(base64Data);
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Calculate optimal font size based on content width and number of columns
     */
    private static calculateOptimalFontSize(contentWidth: number, maxColumns: number, baseFontSize: number = 12): number {
        const minFontSize = 6;
        const maxFontSize = 14;
        const minCellWidth = 15; // Minimum cell width in mm
        
        const estimatedCellWidth = contentWidth / maxColumns;
        let fontSize = baseFontSize;
        
        if (estimatedCellWidth < minCellWidth) {
            fontSize = Math.max(minFontSize, baseFontSize * (estimatedCellWidth / minCellWidth));
        }
        
        return Math.min(maxFontSize, fontSize);
    }
    
    /**
     * Calculate optimal column widths based on content
     */
    private static calculateColumnWidths(headers: string[], bodyData: any[][], contentWidth: number, fontSize: number): number[] {
        const columnCount = headers.length;
        const baseWidth = contentWidth / columnCount;
        const minWidth = 15; // Minimum column width in mm
        const maxWidth = contentWidth * 0.3; // Maximum column width (30% of content width)
        
        // Calculate content-based widths
        const columnWidths = headers.map((header, index) => {
            let maxContentLength = header.length;
            
            // Check body data for this column
            bodyData.forEach(row => {
                if (row[index] !== undefined) {
                    const contentLength = String(row[index]).length;
                    maxContentLength = Math.max(maxContentLength, contentLength);
                }
            });
            
            // Calculate width based on content length and font size
            const contentBasedWidth = Math.max(minWidth, (maxContentLength * fontSize * 0.6) + 10);
            return Math.min(maxWidth, contentBasedWidth);
        });
        
        // Normalize widths to fit content width
        const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
        const scaleFactor = contentWidth / totalWidth;
        
        return columnWidths.map(width => Math.max(minWidth, width * scaleFactor));
    }
    
    /**
     * Generate column styles for autoTable
     */
    private static generateColumnStyles(columnWidths: number[]): any {
        const styles: any = {};
        columnWidths.forEach((width, index) => {
            styles[index] = { cellWidth: width };
        });
        return styles;
    }
    
    /**
     * Format cell content for display in PDF
     */
    private static formatCellContent(content: any, fontSize: number): string {
        if (content === null || content === undefined) {
            return '';
        }
        
        // Convert to string and handle special cases
        let formatted = String(content);
        
        // Truncate very long content to prevent layout issues
        const maxLength = Math.floor(50 * (fontSize / 12)); // Scale with font size
        if (formatted.length > maxLength) {
            formatted = formatted.substring(0, maxLength - 3) + '...';
        }
        
        return formatted;
    }
    
    /**
     * Split long text into multiple lines to fit cell width
     */
    private static wrapText(text: string, maxWidth: number, fontSize: number): string[] {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';
        
        for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const testWidth = (testLine.length * fontSize * 0.6); // Approximate character width
            
            if (testWidth <= maxWidth) {
                currentLine = testLine;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    lines.push(word);
                }
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    }
}

export { PdfGenerator };
export type { IRecordFilter, IRecordData };
