import { EMoneyType } from "@/interfaces/ReportInterfaces";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import Numeral  from "numeral";

class Toolbox{
    public static generateId(): string{
        return Math.random().toString(36).substr(2, 9);
    }
    public static moneyPrefix(moneyType: EMoneyType): string{
        switch(moneyType){
            case EMoneyType.PEN:
                return "S/.";
            case EMoneyType.USD:
                return "$";
        }
    }
    public static moneyFormat(amount: number, withPrefix: EMoneyType|boolean = false): string{
        if (withPrefix){
            return this.moneyPrefix(withPrefix as EMoneyType) + " " + Numeral(amount).format('0,0.00');
        }
        return  Numeral(amount).format('0,0.00');
    }

    public static shareNative(fileName: string, base64Data: string){
        return Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Cache
        })
        .then(() => {
            return Filesystem.getUri({
                directory: Directory.Cache,
                path: fileName
            });
        })
        .then((uriResult) => {
            return Share.share({
                title: fileName,
                text: fileName,
                url: uriResult.uri,
            });
        });
    }

    public static share(fileNameWithExtention: string, base64Data: string){
        if (Capacitor.isNativePlatform()){
            this.shareNative(fileNameWithExtention, base64Data);
        }else{
            const byteString = atob(base64Data);
            const ab = new ArrayBuffer(byteString.length);
            const dw = new DataView(ab);
            for (let i = 0; i < byteString.length; i++) {
                dw.setUint8(i, byteString.charCodeAt(i));
            }
            const blob = new Blob([ab]);
            let link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = fileNameWithExtention;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

//https://api.apis.net.pe/v1/tipo-cambio-sunat?fecha=2023-12-01

export {Toolbox}