import { Environment } from '@/utils/Environment/Environment';
import { ErrorTracking } from '@/utils/ErrorTracking/ErrorTracking';
import { RequestAPI } from '@/utils/Requests/RequestAPI';
import { TStorage } from '@/utils/Toolbox/TStorage';
import { Toolbox } from '@/utils/Toolbox/Toolbox';
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
    private static isInitializing: boolean = false;

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
        return this.sessionUserData.roles || [];
    }
    public permissions(){
        return this.sessionUserData.permissions || [];
    }
    public token(){
        return this.sessionUserData.token;
    }
    public id(){
        return this.sessionUserData.id;
    }

    public isAdmin(){
        return this.roles().includes("admin");
    }

    private async refreshUserInformation(){
        let response:any = null;
        try {
            response = await RequestAPI.get('/users/' + this.id());
        } catch (error) {
            //No internet connection
        }

        if (response == null){
            return;
        }

        this.sessionUserData.email = response.email;
        this.sessionUserData.name = response.name;
        this.sessionUserData.username = response.username;
        this.sessionUserData.roles = response.roles;
        this.sessionUserData.permissions = response.permissions;


        const sessionStorage = await TStorage.load("session", {
            token: null,
            userData: null
        });

        sessionStorage.data.userData = response;
        await sessionStorage.save();
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
                (window as any).plugins.OneSignal.initialize(Environment.variable('ONESIGNAL_APP_ID'));
                await (window as any).plugins.OneSignal.login(Toolbox.getOneSignalUserId(Session.session?.id()));
            }

            await ErrorTracking.linkToSession();

        } catch (error:any) {
            if (error.code == 401){
                throw new Error("Invalid credentials");
            }else{
                throw new Error(error.response.message);
            }
        }
    }
    public async logout(options: {force: boolean} = {force: false}){
        try {
            const response = await RequestAPI.post('/logout', {});
        } catch (error:any) {
            if (!options.force){
                if (error.code != 401){
                    throw new Error(error.response.message);
                }
            }
        }

        await TStorage.clearBucket("session");

        if (Capacitor.isNativePlatform()){
            await (window as any).plugins.OneSignal.logout();
        }

        await ErrorTracking.unlinkSession();

        Session.session = null;
    }
    public static async getCurrentSession(){
        await Session.init();
        return Session.session;
    }
    public static getCurrentSessionSync()
    {
        return Session.session;
    }
    public static async init(){
        if (this.isInitializing){
            return new Promise((resolve, reject) => {
                const interval = setInterval(() => {
                    if (this.isInitialized){
                        clearInterval(interval);
                        resolve({});
                    }
                }, 100);
            })
        }

        if (this.isInitialized){
            return;
        }

        this.isInitializing = true;
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
            ErrorTracking.linkToSession();

            Session.session.refreshUserInformation();

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
                    resolve(await Session.getCurrentSession());
                }
            }, 100);
        })
    }
}

export {Session}
export type {SessionUserData}