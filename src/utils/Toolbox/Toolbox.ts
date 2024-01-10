import { EMoneyType } from "@/interfaces/ReportInterfaces";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import Numeral  from "numeral";
import sanitize from 'sanitize-filename';
import { FileOpener, FileOpenerOptions } from '@capacitor-community/file-opener';
import { Environment } from "@/utils/Environment/Environment";

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
        fileName = sanitize(fileName, {replacement: '_'})

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

    public static openNative(fileName: string, base64Data: string){
        fileName = sanitize(fileName, {replacement: '_'})

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
            return FileOpener.open({
                filePath: uriResult.uri,
            })
        });
    }

    public static share(fileNameWithExtention: string, base64Data: string){
        if (Capacitor.isNativePlatform()){
            this.openNative(fileNameWithExtention, base64Data);
            //this.shareNative(fileNameWithExtention, base64Data);
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

    public static getOneSignalUserId(userId: number): string{
        if (Environment.environment() == "dev"){
            return "dev-user-id-" + userId;
        }else{
            return "user-id-" + userId;
        }
    }
}

export {Toolbox}