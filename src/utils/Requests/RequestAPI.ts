import axios from 'axios';

import { TStorage } from '@/utils/Toolbox/TStorage';
import { Session } from '@/utils/Session/Session';

import { Capacitor } from '@capacitor/core';
import { useRouter } from 'vue-router';

class RequestAPI{
    private static domainUrl: string = (() => {
        if (Capacitor.isNativePlatform()) {
            //return 'https://2024-190-238-182-115.ngrok-free.app';
            return "https://maranatha.imedicineapp.com";
        }
        const currentUrl = new URL(window.location.href);
        if (currentUrl.port != ''){
            return "http://localhost:8000";
        }else{
            return "https://" + currentUrl.hostname;
        }
    })();
    public static variables = {
        domainUrl: (() => {
            return RequestAPI.domainUrl;
        })(),
        rootUrl: (() => {
            return RequestAPI.domainUrl + '/api';
        })(),
        rootStorageUrl: (() => {
            return RequestAPI.domainUrl + '/storage';
        })()
    }
    public static get(url: string, parameters: any = {}): Promise<any>{
        return new Promise(async (resolve, reject) => {
            RequestAPI.proxyResponse(axios.get(this.variables.rootUrl + url, { params: parameters, 
                headers: {
                    'Authorization': await RequestAPI.getAuthHeader(),
                    'ngrok-skip-browser-warning': true
                }
            }))
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                reject({
                    code: error.response.status,
                    response: error.response.data
                });
            })
        })
    }
    public static post(url: string, body: any = {}, options: {onUploadProgress: (percentage: number) => void} = {
        onUploadProgress: (percentage: number) => {}
    }): Promise<any>{
        return new Promise(async (resolve, reject) => {
            RequestAPI.proxyResponse(axios.post(this.variables.rootUrl + url, body, {
                headers: {
                    'Authorization': await RequestAPI.getAuthHeader(),
                    'ngrok-skip-browser-warning': true
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total !== undefined) {
                        options.onUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
                    }
                }
            }))
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                console.log(error)
                reject({
                    code: error.response.status,
                    response: error.response.data
                });
            })
        })
    }
    public static patch(url: string, body: any = {}): Promise<any>{
        return new Promise(async (resolve, reject) => {
            RequestAPI.proxyResponse(axios.patch(this.variables.rootUrl + url, body, {
                headers: {
                    'Authorization': await RequestAPI.getAuthHeader(),
                    'ngrok-skip-browser-warning': true
                }
            }))
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                reject({
                    code: error.response.status,
                    response: error.response.data
                });
            })
        })
    }
    public static put(url: string, parameters: any = {}): Promise<any>{
        return new Promise(async (resolve, reject) => {
            RequestAPI.proxyResponse(axios.put(this.variables.rootUrl + url, parameters, {
                headers: {
                    'Authorization': await RequestAPI.getAuthHeader(),
                    'ngrok-skip-browser-warning': true
                }
            }))
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                reject({
                    code: error.response.status,
                    response: error.response.data
                });
            })
        })
    }
    public static delete(url: string, parameters: any = {}): Promise<any>{
        return new Promise(async (resolve, reject) => {
            RequestAPI.proxyResponse(axios.delete(this.variables.rootUrl + url, { params: parameters,
                headers: {
                    'Authorization': await RequestAPI.getAuthHeader(),
                    'ngrok-skip-browser-warning': true
            }}))
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                reject({
                    code: error.response.status,
                    response: error.response.data
                });
            })
        })
    }


    public static getStorageInBase64(url: string, parameters: any = {}): Promise<any>{
        return new Promise((resolve, reject) => {
            fetch(this.variables.rootStorageUrl +  url).then((response) => {
                response.blob().then((blob) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(blob); 
                    reader.onloadend = function() {
                        const base64data = reader.result;     
                        resolve(base64data);
                    }
                })
            })
        })
    }

    public static fetchGet(url: string, parameters: any = {} = {}): Promise<any>{
        return new Promise(async (resolve, reject) => {
            RequestAPI.proxyResponse(axios.get(this.variables.rootUrl + url, { params: parameters, 
                headers: {
                    'Authorization': await RequestAPI.getAuthHeader(),
                    'ngrok-skip-browser-warning': true
                }
            }))
            .then((response) => {
                resolve(response)
            })
            .catch((error) => {
                reject({
                    code: error.response.status,
                    response: error.response.data
                });
            })
        })
    }

    private static async getAuthHeader(): Promise<any>{
        return new Promise(async (resolve, reject) => {
            if (await Session.isLogged()){
                resolve('Bearer ' + (await Session.getCurrentSession())?.token());
            }else{
                resolve(undefined);
            }
        })
    }


    private static async proxyResponse(response: Promise<any>): Promise<any>{
        const reactions = {
            onAunauthenticated: async () => {
                const session = await Session.getCurrentSession();
                if (session){
                    await session.logout();
                }
                Session.router?.replace('/login');
            }
        }

        return new Promise(async (resolve, reject) => {
            response
            .then((response) => {
                resolve(response)
            }).catch((error) => {
                if (error.response.data.message == 'Unauthenticated.'){
                    reactions.onAunauthenticated();
                }
                reject(error)
            })
        })
    }
}


export { RequestAPI };