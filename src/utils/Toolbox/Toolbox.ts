import { EMoneyType } from "@/interfaces/ReportInterfaces";

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
}

//https://api.apis.net.pe/v1/tipo-cambio-sunat?fecha=2023-12-01

export {Toolbox}