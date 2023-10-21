import { modalController } from "@ionic/vue";
import QRCodeScannerModal from "@/dialogs/QRCodeScanner/QRCodeScannerModal.vue";
import { EventEmitter } from "@billjs/event-emitter";
import {
    BarcodeScanner,
    BarcodeFormat,
    LensFacing,
  } from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from "@capacitor/core";



class QRCodeScanner{
    private modal:any = null;
    private emitter:any = null;
    constructor(){
        const emitter = new EventEmitter();
        this.emitter = emitter;

        
        if (Capacitor.isNativePlatform()){
            this.loadNativeScanner();
        }else{
            this.loadBrowserScanner();
        }
    }

    public show(){
        this.modal.present();
    }
    public close(){
        this.modal.dismiss();
    }
    public onScan():Promise<string>{
        const emitter = this.emitter;
        return new Promise((resolve, reject) => {
            emitter.on("scan", (result:any) => {
                resolve(result.data)
            })
        })
    }


    private loadBrowserScanner(){
        modalController.create({
            component: QRCodeScannerModal,
            componentProps: {
                emitter: this.emitter
            }
        }).then((modal) => {
            this.modal = modal;
            this.show();
            this.emitter.on("close", () => {
                this.modal.dismiss();
            })
        })
    }
    private async loadNativeScanner(){
        const $this = this;
        const scanSingleBarcode = async () => {
            return new Promise(async resolve => {
                document.querySelector('body')?.classList.add('barcode-scanner-active');
            
                const terminate = (listener:any) => {
                    return new Promise(async resolve => {
                        await listener.remove();
                        document
                            .querySelector('body')
                            ?.classList.remove('barcode-scanner-active');
                        await BarcodeScanner.stopScan();
                        resolve("");
                    })
                }

                let listener:any = null;
                const autoRefuse = setTimeout(async () => {
                    await terminate(listener);
                    resolve("");
                }, 6000);

                listener = await BarcodeScanner.addListener(
                    'barcodeScanned',
                    async (result:any) => {
                        clearTimeout(autoRefuse);
                        await terminate(listener);
                        resolve(result.barcode.rawValue);
                    },
                );
                await BarcodeScanner.startScan();
            });
        };


        scanSingleBarcode().then((result) => {
            $this.emitter.fire("scan", result);
            $this.emitter.fire("close", null);
        })



    }

    public static open(): QRCodeScanner{
        return new QRCodeScanner();
    }
}


export { QRCodeScanner };