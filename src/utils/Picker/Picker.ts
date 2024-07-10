import { PDFModifier } from "@/utils/PDFModifier/PDFModifier";
import { Capacitor } from "@capacitor/core";
import { FilePicker } from "@capawesome/capacitor-file-picker";



export class Picker{
    public static async pickPdfDocument(options: {
        isProcessingFile?: Function
    }) : Promise<{
        base64: string,
        details: {
            name: string,
            pages: number,
            size: number,
            thumbnailBase64: string
        }
    }>{
        return new Promise(async (resolve, reject) => {
            const result = await FilePicker.pickFiles({
                types: ['application/pdf'],
                multiple: false,
                readData: true
            });

            if (result.files.length == 0){
                return;
            }

            if (options.isProcessingFile){
                options.isProcessingFile();
            }

            const file = result.files[0];
            const base64FromBlob = (blob: Blob) => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        resolve(reader.result as string);
                    }
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                })
            }  

            let sourcePDF = null;

            let pdfBase64:string|null = null;
            if (Capacitor.isNativePlatform()){
                function convertDataURIToBinary(base64:string) {
                    const raw = window.atob(base64);
                    const rawLength = raw.length;
                    const array = new Uint8Array(new ArrayBuffer(rawLength));
                    for(let i = 0; i < rawLength; i++) {
                        array[i] = raw.charCodeAt(i);
                    }
                    return array;
                }
                console.log(file, file.data, file.blob);
                pdfBase64 = file.data as string;
                sourcePDF = {data: convertDataURIToBinary(file.data as string)}
            }else{
                const url = URL.createObjectURL(file.blob as Blob);
                sourcePDF = url;
                pdfBase64 = await base64FromBlob(file.blob as Blob);
            }
            const pdf = await PDFModifier.loadPDF(sourcePDF);
            const imageBase64 = await pdf.extractPagesIntoSingleImageAsBase64();
            resolve({
                base64: pdfBase64.split(',')[1],
                details: {
                    name: file.name,
                    pages: pdf.pagesCount(),
                    size: file.size,
                    thumbnailBase64: imageBase64.split(',')[1]
                }
            })
        })
    }
}