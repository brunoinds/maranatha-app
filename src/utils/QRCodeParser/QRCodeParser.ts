interface QRCodeParserResponse{
    isValid: boolean;
    content: any,
    qrCode: string  
}

interface QRCodeParserResponseBuy{
    isValid: boolean;
    content: {
        ruc: string;
        docCode: string;
        igv: string;
        price: string;
        date: string | null;
    } | null,
    qrCode: string,
    country: 'Peru' | 'Brazil' | 'Paraguay'
}
class QRCodeParser{
    private static parsePeruvianCode(qrCode: string): QRCodeParserResponseBuy{
        const containsTheSplitter = qrCode.split("|").length > 3;
        if (!containsTheSplitter) {
            return {
                content: null,
                isValid: false,
                qrCode: qrCode,
                country: 'Peru'
            };
        }

        const parts = qrCode.split("|");
        let predifinedParts = {
            ruc: [0],
            docCode: [2, 3],
            igv: [4],
            price: [5],
            date: [6]
        }
        const data = {
            ruc: parts[0].trim(),
            docCode: (() => {
                const code = parts[predifinedParts.docCode[0]].trim();
                const serie = parts[predifinedParts.docCode[1]].trim();
                if (code.includes("-")){
                    predifinedParts.igv = [predifinedParts.igv[0] - 1];
                    predifinedParts.price = [predifinedParts.price[0] - 1];
                    predifinedParts.date = [predifinedParts.date[0] - 1];
                    return code;
                }
                return `${code}-${serie}`;
            
            })(),
            igv: (parts[predifinedParts.igv[0]].trim()),
            price: (parts[predifinedParts.price[0]].trim()),
            date: (() => {
                try {
                    const data = parts[predifinedParts.date[0]].trim().split(" ")[0]
                    //Should check for dates in those formats, is is not available, return null.: dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy, yyyy-mm-dd, yyyy/mm/dd, yyyy.mm.dd
                    const dateRegex = /(\d{2}[-/.]\d{2}[-/.]\d{4})|(\d{4}[-/.]\d{2}[-/.]\d{2})/;
                    const dateMatch = data.match(dateRegex);
                    let datePreSanitizedValue = null
                    if (dateMatch) {
                        //Define witch type of format is: dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy, yyyy-mm-dd, yyyy/mm/dd, yyyy.mm.dd:
                        const isDotStyle = data.includes(".");
                        const isSlashStyle = data.includes("/");
                        const isDashStyle = data.includes("-");

                        if (isSlashStyle){
                            const whereIsTheYear = data.split("/").findIndex((value) => value.length === 4);
                            const whereIsTheDay = data.split("/").findIndex((value, i) => {
                                return value.length === 2 && value !== "00" && parseInt(value) <= 31 && i !== 1
                            });
                            const whereIsTheMonth = 1

                            datePreSanitizedValue = `${data.split("/")[whereIsTheYear]}-${data.split("/")[whereIsTheMonth]}-${data.split("/")[whereIsTheDay]}`;
                        }else if (isDotStyle){
                            const whereIsTheYear = data.split(".").findIndex((value) => value.length === 4);
                            const whereIsTheDay = data.split(".").findIndex((value, i) => {
                                return value.length === 2 && value !== "00" && parseInt(value) <= 31 && i !== 1
                            });
                            const whereIsTheMonth = 1

                            datePreSanitizedValue = `${data.split(".")[whereIsTheYear]}-${data.split(".")[whereIsTheMonth]}-${data.split(".")[whereIsTheDay]}`;
                        }else if (isDashStyle){
                            const whereIsTheYear = data.split("-").findIndex((value) => value.length === 4);
                            const whereIsTheDay = data.split("-").findIndex((value, i) => {
                                return value.length === 2 && value !== "00" && parseInt(value) <= 31  && i !== 1
                            });
                            const whereIsTheMonth = 1

                            datePreSanitizedValue = `${data.split("-")[whereIsTheYear]}-${data.split("-")[whereIsTheMonth]}-${data.split("-")[whereIsTheDay]}`;
                        }
                    }else{
                        return null;
                    }

                    if (datePreSanitizedValue){
                        //Check if has valid format: yyyy-mm-dd:
                        const dateRegex = /(\d{4}[-]\d{2}[-]\d{2})/;
                        const dateMatch = datePreSanitizedValue.match(dateRegex);
                        if (dateMatch){
                            return datePreSanitizedValue;
                        }
                        return null;
                    }
                    return null;
                } catch (error) {
                    return null;   
                }
            })()
        }
        return {
            content: data,
            isValid: true,
            qrCode: qrCode,
            country: 'Peru'
        };
    }
    private static parseBrazilianCode(qrCode: string): QRCodeParserResponseBuy{
        const url = qrCode;

        try {
            const parsedUrl = new URL(url);

            // Check if the URL is valid
            if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
                const dhEmiHex = parsedUrl.searchParams.get("dhEmi");
                const vNF = parsedUrl.searchParams.get("vNF");
                const vICMS = parsedUrl.searchParams.get("vICMS");
                const chNFe = parsedUrl.searchParams.get("chNFe");

                // Check if both dhEmi and vNF query parameters exist
                if (dhEmiHex && vNF && vICMS && chNFe) {
                    function hexToASCII(stringContent: string) {
                        let hex = stringContent.toString();
                        let str = '';
                        for (let n = 0; n < hex.length; n += 2) {
                            str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
                        }
                        return str;
                    }
                    const dhEmiIso = hexToASCII(dhEmiHex);

                    return {
                        content: {
                            price: vNF.toString().replace(',', '.'),
                            date: dhEmiIso.split('T')[0],
                            igv: vICMS.toString().replace(',', '.'),
                            ruc: '',
                            docCode: chNFe.toString(),
                        },
                        isValid: true,
                        qrCode: qrCode,
                        country: 'Brazil'
                    };
                } else {
                    return {
                        content: null,
                        isValid: false,
                        qrCode: qrCode,
                        country: 'Brazil'
                    };
                }
            } else {
                return {
                    content: null,
                    isValid: false,
                    qrCode: qrCode,
                    country: 'Brazil'
                };
            }
        } catch (err) {
            return {
                content: null,
                isValid: false,
                qrCode: qrCode,
                country: 'Brazil'
            };
        }
    }

    private static parseParaguayanCode(qrCode: string): QRCodeParserResponseBuy{
        const url = qrCode;

        if (!url.includes('https://ekuatia.set.gov.py')){
            return {
                content: null,
                isValid: false,
                qrCode: qrCode,
                country: 'Paraguay'
            };
        }

        try {
            const parsedUrl = new URL(url);

            const dRucRec = parsedUrl.searchParams.get("dRucRec")  || parsedUrl.searchParams.get('dNumIDRec');
            const dTotGralOpe = parsedUrl.searchParams.get("dTotGralOpe");
            const dTotIVA = parsedUrl.searchParams.get("dTotIVA");
            const dFeEmiDE = parsedUrl.searchParams.get("dFeEmiDE");
            let ident = parsedUrl.searchParams.get("Id");


            if (dRucRec && dTotGralOpe && dFeEmiDE && dTotIVA && ident) {
                function hexToASCII(stringContent: string) {
                    let hex = stringContent.toString();
                    let str = '';
                    for (let n = 0; n < hex.length; n += 2) {
                        str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
                    }
                    return str;
                }

                const dhEmiIso = hexToASCII(dFeEmiDE);

                if (ident.length >= 25){
                    //Get chars from position 11 to 23, including 12 and 24, beliving the chars starts from 0:
                    ident = ident.substring(11, 24);
                    //Now, add dashs in the following position: 000-000-0000000:
                    ident = `${ident.substring(0, 3)}-${ident.substring(3, 6)}-${ident.substring(6, 13)}`;
                }

                return {
                    content: {
                        price: parseInt(dTotGralOpe).toString(),
                        date: dhEmiIso.split('T')[0],
                        igv: parseInt(dTotIVA).toString(),
                        ruc: dRucRec,
                        docCode: ident,
                    },
                    isValid: true,
                    qrCode: qrCode,
                    country: 'Paraguay'
                };
            }else{
                return {
                    content: null,
                    isValid: false,
                    qrCode: qrCode,
                    country: 'Paraguay'
                };
            }
        } catch (error) {
            return {
                content: null,
                isValid: false,
                qrCode: qrCode,
                country: 'Paraguay'
            };
        }
    }


    public static parseBuyCode(qrCode: string): QRCodeParserResponseBuy{
        const peruvianResponse = QRCodeParser.parsePeruvianCode(qrCode)
        if (peruvianResponse.isValid){
            return peruvianResponse;
        }
        const paraguayanResponse = QRCodeParser.parseParaguayanCode(qrCode)
        if (paraguayanResponse.isValid){
            return paraguayanResponse;
        }
        const brazilianResponse = QRCodeParser.parseBrazilianCode(qrCode)
        return brazilianResponse
    }
}


export {QRCodeParser}
export type {QRCodeParserResponse, QRCodeParserResponseBuy}