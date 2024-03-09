
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';


export type FrankfurterResponse = {
    amount: number
    base: string
    date: string
    rates: { [key: string]: number };
}

export type ExchangeInfo = {
    date: string,
    from: string,
    to: string,
    value: number
}


export class CurrencyFly{
    public static async convert(amount: number, options: {
        from: string,
        to: string,
        date?: Date
    }): Promise<number>{
        const response = await this.fetch({
            amount: amount,
            from: options.from,
            to: options.to,
            date: options.date ? options.date.toISOString().split('T')[0] : 'latest'
        });
        return response.rates[options.to];
    }
    public static async getExchangeInfo(options: {
        from: string,
        to: string,
        date?: Date
    }): Promise<ExchangeInfo>{
        const response = await this.fetch({
            amount: 1,
            from: options.from,
            to: options.to,
            date: options.date ? options.date.toISOString().split('T')[0] : 'latest'
        });
        return {
            date: response.date,
            from: options.from,
            to: options.to,
            value: response.rates[options.to]
        }
    }


    private static fetch(options: {
        amount?: number,
        from?: string,
        to?: string,
        date?: string,
    }): Promise<FrankfurterResponse>{
        return new Promise((resolve, reject) => {
            const url = 'https://api.frankfurter.app/' + options.date;
            const parameters = {
                amount: options.amount,
                from: options.from,
                to: options.to
            }
            axios.get(url, { params: parameters }).then((response: AxiosResponse) => {
                const data = response.data;
                resolve(data as FrankfurterResponse)
            })
        })
        
    }
}