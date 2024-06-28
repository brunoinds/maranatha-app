import { PDFModifier } from "@/utils/PDFModifier/PDFModifier";
import { BarcodeScanner, IsSupportedResult } from "@capacitor-mlkit/barcode-scanning";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { FilePicker } from "@capawesome/capacitor-file-picker";
import { toastController, alertController, actionSheetController } from "@ionic/vue";
import imageCompression from "browser-image-compression";
import { DocumentScanner } from "capacitor-document-scanner";

export class ImagePicker{
    public static async loadInvoiceDocument(options: {
        forceFromGallery?: boolean
    } = {
        forceFromGallery: false
    }) : Promise<{image: string, barcode: string}>{
        const openCamera = (forceFromGallery: boolean = false) => {
            return new Promise(async (resolve, reject) => {
                const scanDocumentNative = () => {
                    return new Promise(async (resolve, reject) => {
                        let cameraPermission = await Camera.checkPermissions();
                        if (cameraPermission.camera == 'prompt' || cameraPermission.camera == 'prompt-with-rationale'){
                            const cameraPermissionRequest = await Camera.requestPermissions();
                            if (cameraPermissionRequest.camera == 'denied'){
                                toastController.create({
                                    message: "❌ El acceso a la cámara está bloqueado por su teléfono",
                                    duration: 2000
                                }).then((toast) => {
                                    toast.present();
                                })
                                return;
                            }
                        }else if (cameraPermission.camera == 'denied'){
                            toastController.create({
                                message: "❌ El acceso a la cámara está bloqueado por su teléfono",
                                duration: 2000
                            }).then((toast) => {
                                toast.present();
                            })
                            return;
                        }
            
                        cameraPermission = await Camera.checkPermissions();
            
                        if (cameraPermission.camera == 'granted' || cameraPermission.camera == 'limited'){
                            const { scannedImages } = await DocumentScanner.scanDocument() as unknown as {scannedImages: Array<string>};
                            if (scannedImages.length > 0) {
                                resolve({
                                    path: scannedImages[0],
                                    webPath: Capacitor.convertFileSrc(scannedImages[0]),
                                    details: {
            
                                    }
                                })
                            }
                        }
                    })
                    
                }
                const scanDocumentWeb = () => {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const image = await Camera.getPhoto({
                                quality: 90,
                                allowEditing: true,
                                resultType: CameraResultType.Uri,
                                source: (() => {
                                    if (forceFromGallery){
                                        return CameraSource.Photos;
                                    }else{
                                        return CameraSource.Prompt;
                                    }
                                })()
                            });
                            resolve({
                                path: image.path as unknown as string,
                                webPath: image.webPath as unknown as string,
                                details: {
                                }
                            });
                        } catch (error) {
                            
                        }
                        
                    })
                }
                const openPDFPicker = () => {
                    return new Promise(async (resolve, reject) => {
                        const result = await FilePicker.pickFiles({
                            types: ['application/pdf'],
                            multiple: false,
                            readData: true
                        });
            
                        if (result.files.length == 0){
                            return;
                        }
                        const file = result.files[0];
                        let sourcePDF = null;
            
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
            
                            sourcePDF = {data: convertDataURIToBinary(file.data as string)}
                        }else{
                            const url = URL.createObjectURL(file.blob as Blob);
                            sourcePDF = url;
                        }
                        const pdf = await PDFModifier.loadPDF(sourcePDF);
            
                        const imageBase64 = await pdf.extractPagesIntoSingleImageAsBase64();
                        
                        const blob = await fetch(`${imageBase64}`).then(res => res.blob());
                        const blobUrl = URL.createObjectURL(blob);
                        resolve({
                            path: blobUrl,
                            webPath: blobUrl,
                            details: {
                                pages: pdf.pagesCount()
                            }
                        })
                    })
                }

                const loadImageFrom = async (image: {path: string, webPath: string, details: {[key: string]:any}}, origin: "Web" | "Native" = "Native") => {
                    const response = await fetch(image.webPath as unknown as string);
                    const blob = await response.blob();
                    const file = new File([blob], "image.jpg", {type: blob.type});
            
                    console.log("Original Image size: ", (file.size / 1000000) + "MB");
            
                    if (file.size == 0){
                        alertController.create({
                            header: "Oops...",
                            message: "Este PDF contiene muchas páginas, no se pudo convertirlo en imagen. Por favor, elige un PDF más pequeño.",
                            buttons: ["OK"]
                        }).then((alert) => {
                            alert.present();
                        })
                        return;
                    }
            
                    const compressedFileBase64 = await (async() => {
                        return new Promise((resolve, reject) => {
                            imageCompression(file, {
                                maxSizeMB: 1,
                                maxWidthOrHeight: (image.details.pages) ? ((image.details.pages > 1) ? undefined : 1024)  : 1024
                            }).then((compressedFile) => {
                                new Promise((resolve, reject) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => resolve(reader.result);
                                    reader.onerror = reject;
                                    reader.readAsDataURL(compressedFile);
                                }).then((base64ImagePre) => {
                                    const base64Image = (base64ImagePre as string).split(";base64,")[1];
                                    const imageSize = (base64Image.length * (3/4)) / 1000000;
                    
                                    console.log("Compressed Image size: ", imageSize);
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
                        
                    })();
                    
                    
    
                    let isBarcodeSupported: boolean = false;


                    try {
                        isBarcodeSupported = (await BarcodeScanner.isSupported()).supported;
                    } catch (error) {
                        isBarcodeSupported = false;
                    }

    
                    if (!isBarcodeSupported){
                        return{
                            image: compressedFileBase64,
                            barcode: null
                        };
                    }else{
                        const barcodeResponse = await BarcodeScanner.readBarcodesFromImage({
                            path: image.path as unknown as string,
                        });
                        if (barcodeResponse.barcodes.length == 0){
                            return;
                        }
                        const barcode = barcodeResponse.barcodes[0];
                        return{
                            image: compressedFileBase64,
                            barcode: barcode.rawValue
                        };
                    }
                }
            
                if (forceFromGallery){
                    actionSheetController.create({
                        header: "Selecciona una opción",
                        buttons: [
                            {
                                text: "Subir PDF",
                                handler: () => {
                                    openPDFPicker().then(async (image) => {
                                        resolve(await loadImageFrom(image as unknown as any, "Web"));
                                    })
                                }
                            },
                            {
                                text: "Subir Foto",
                                handler: () => {
                                    scanDocumentWeb().then(async (image) => {
                                        resolve(await loadImageFrom(image as unknown as any));
                                    })
                                }
                            },
                            {
                                text: "Cancelar",
                                role: "cancel"
                            }
                        ]
                    }).then((actionSheet) => {
                        actionSheet.present();
                    })
                }else if (!Capacitor.isNativePlatform()){
                    scanDocumentWeb().then(async (image) => {
                        resolve(await loadImageFrom(image as unknown as {path: string, webPath: string} as any));
                    })
                }else if(Capacitor.isNativePlatform()){
                    scanDocumentNative().then(async (image) => {
                        resolve(await loadImageFrom(image as unknown as {path: string, webPath: string} as any));
                    })
                }
            })
        }

        const response = await openCamera(options.forceFromGallery) as unknown as {image: string, barcode: string};
        return response;
    }
}