import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { TStorage } from '@/utils/Toolbox/TStorage';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import {
    ActionPerformed,
    PushNotificationSchema,
    Token,
} from '@capacitor/push-notifications';
import { useRouter, Router } from 'vue-router';
interface SessionUserData{
    id: number;
    username: string;
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
    token: string;
}
class Session{
    private static session: Session|null = null;
    private static isInitialized: boolean = false;

    public static router: Router|null = null;
    private sessionUserData: SessionUserData;

    constructor(sessionUserData: SessionUserData){
        this.sessionUserData = sessionUserData;
    }

    public name(){
        return this.sessionUserData.name;
    }
    public username(){
        return this.sessionUserData.username;
    }
    public email(){
        return this.sessionUserData.email;
    }
    public roles(){
        return this.sessionUserData.roles;
    }
    public permissions(){
        return this.sessionUserData.permissions;
    }
    public token(){
        return this.sessionUserData.token;
    }
    public id(){
        return this.sessionUserData.id;
    }

    
    public static async login(username:string, password:string){
        if (await Session.isLogged()){
            throw new Error("Already logged");
        }

        try {
            const response = await RequestAPI.post('/login', {
                username: username,
                password: password
            });
            const sessionData: SessionUserData = {
                id: response.user.id,
                username: response.user.username,
                name: response.user.name,
                email: response.user.email,
                roles: response.user.roles,
                permissions: response.user.permissions,
                token: response.token
            }
            Session.session = new Session(sessionData);
            await TStorage.clearBucket("session");
            await TStorage.load("session", {
                token: response.token,
                userData: response.user
            });

            if (Capacitor.isNativePlatform()){
                (window as any).plugins.OneSignal.initialize("5b414480-2440-4456-b7e1-a6b2564d82d6");
                await (window as any).plugins.OneSignal.login("user-id-" + String(response.user.id));
            }

        } catch (error:any) {
            if (error.code == 401){
                throw new Error("Invalid credentials");
            }else{
                throw new Error(error.response.message);
            }
        }
    }
    public async logout(){
        const response = await RequestAPI.post('/logout', {});
        await TStorage.clearBucket("session");

        if (Capacitor.isNativePlatform()){
            await (window as any).plugins.OneSignal.logout();
        }

        Session.session = null;
    }
    public static async getCurrentSession(){
        await Session.init();
        return Session.session;
    }
    public static notifications(){
        return {
            checkForPermission: () => {
                return new Promise((resolve, reject) => {



                    
                    PushNotifications.checkPermissions().then((response) => {
                        if (response.receive == 'granted'){
                            resolve('Allowed');
                        }else if (response.receive == 'denied'){
                            resolve('Denied');
                        }else{
                            resolve('NotAsked');
                        }
                    })
                })
            },
            hardAskForPermission: () => {
                return new Promise((resolve, reject) => {
                    PushNotifications.requestPermissions().then((response) => {
                        if (response.receive == 'granted'){
                            resolve('Allowed');
                        }else if (response.receive == 'denied'){
                            resolve('Denied');
                        }else{
                            resolve('NotAsked');
                        }
                    })
                })
            },
            isAllowed: () => {
                return new Promise((resolve, reject) => {
                    PushNotifications.checkPermissions().then((response) => {
                        if (response.receive == 'granted'){
                            resolve(true);
                        }else{
                            resolve(false);
                        }
                    })
                })
            },
            initializeOneSignal: (OneSignal:any) => {
                Session.waitForLogin().then((session:any) => {
                    OneSignal.initialize("5b414480-2440-4456-b7e1-a6b2564d82d6");
                    setTimeout(() => {
                        OneSignal.login("user-id-" + String(Session.session?.id()))
                    }, 3000)



                    OneSignal.isPushNotificationsEnabled().then((response:any) => {
                        if (response){
                            console.log(response)
                        }else{
                            OneSignal.getNotificationPermission().then((response:any) => {
                                console.log(response)
                                if (response == 'default'){
                                    
                                }else if (response == 'denied'){
                                    
                                }else if (response == 'granted'){
                                    
                                }
                            })
                        }
                    })

                })

                PushNotifications.addListener('registration', (token: Token) => {
                    //alert('Push registration success, token: ' + token.value);
                });
                PushNotifications.addListener('registrationError', (error: any) => {
                    //alert('Error on registration: ' + JSON.stringify(error));
                });
            
                PushNotifications.addListener('pushNotificationReceived',
                    (notification: PushNotificationSchema) => {
                        //alert('Push received: ' + JSON.stringify(notification));
                    },
                );
            
                PushNotifications.addListener('pushNotificationActionPerformed',
                    (notification: ActionPerformed) => {
                        //alert('Push action performed: ' + JSON.stringify(notification));
                    },
                );

            }
        }
    }
    public static async init(){
        if (this.isInitialized){
            return;
        }
        const sessionStorage = await TStorage.load("session", {
            token: null,
            userData: null
        });

        if (sessionStorage.data.token != null){
            const sessionData: SessionUserData = {
                id: sessionStorage.data.userData.id,
                name: sessionStorage.data.userData.name,
                username: sessionStorage.data.userData.username,
                email: sessionStorage.data.userData.email,
                roles: sessionStorage.data.userData.roles,
                permissions: sessionStorage.data.userData.permissions,
                token: sessionStorage.data.token
            }
            Session.session = new Session(sessionData);
        }else{
            Session.session = null;
        }
        this.isInitialized = true;
    }
    public static async isLogged(){
        await Session.init();
        return Session.session != null;
    }
    public static async waitForLogin(){
        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                if (await Session.isLogged()){
                    clearInterval(interval);
                    resolve(Session.getCurrentSession());
                }
            }, 100);
        })
    }
}

export {Session}
export type {SessionUserData}