import { PDFModifier } from "@/utils/PDFModifier/PDFModifier";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { FilePicker } from "@capawesome/capacitor-file-picker";
import { alertController } from "@ionic/vue";
import imageCompression from "browser-image-compression";



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
            let result;
            try {
                result = await FilePicker.pickFiles({
                    types: ['application/pdf'],
                    multiple: false,
                    readData: true
                });
            } catch (error) {
                return;
            }
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
                pdfBase64 = file.data as string;
                sourcePDF = {data: convertDataURIToBinary(file.data as string)}
            }else{
                const url = URL.createObjectURL(file.blob as Blob);
                sourcePDF = url;
                pdfBase64 = await base64FromBlob(file.blob as Blob);
                pdfBase64 = pdfBase64.split(',')[1];
            }
            const pdf = await PDFModifier.loadPDF(sourcePDF);
            const imageBase64 = await pdf.extractPagesIntoSingleImageAsBase64();
            resolve({
                base64: pdfBase64,
                details: {
                    name: file.name,
                    pages: pdf.pagesCount(),
                    size: file.size,
                    thumbnailBase64: imageBase64.split(',')[1]
                }
            })
        })
    }

    public static async pickPhoto(options: {
        isProcessingFile?: Function
    }) : Promise<{
        base64: string,
        details: {
            size: number,
        }
    }>{
        return new Promise(async (resolve, reject) => {
            try {
                const image = await Camera.getPhoto({
                    quality: 90,
                    allowEditing: true,
                    resultType: CameraResultType.Uri,
                    source: (() => {
                        return CameraSource.Prompt;
                    })()
                });

                if (options.isProcessingFile){
                    options.isProcessingFile();
                }

                const loadImageFrom = async () => {
                    const response = await fetch(image.webPath as unknown as string);
                    const blob = await response.blob();
                    const file = new File([blob], "image.jpg", {type: blob.type});
            
                    const compressedFileBase64 = await (async() => {
                        return new Promise((resolve, reject) => {
                            imageCompression(file, {
                                maxSizeMB: 1,
                            }).then((compressedFile) => {
                                new Promise((resolve, reject) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => resolve(reader.result);
                                    reader.onerror = reject;
                                    reader.readAsDataURL(compressedFile);
                                }).then((base64ImagePre) => {
                                    const base64Image = (base64ImagePre as string).split(";base64,")[1];
                                    const imageSize = (base64Image.length * (3/4)) / 1000000;
                                    if (imageSize >= 4){
                                        alertController.create({
                                            header: "Oops...",
                                            message: "La imagen es muy pesada, por favor, suba una imagen más ligera (límite de 4MB)",
                                            buttons: ["OK"]
                                        }).then((alert) => {
                                            alert.present();
                                        })
                                        return;
                                    }
                                    resolve(base64Image);
                                })
                            })
                        })
                        
                    })()

                    return compressedFileBase64;
                }

                const imageBase64 = await loadImageFrom();

                resolve({
                    base64: imageBase64 as string,
                    details: {
                        size: imageBase64.length
                    }
                });
            } catch (error) {
                
            }
            
        })
    }
}