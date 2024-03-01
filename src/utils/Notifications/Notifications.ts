import { AppEvents } from "@/utils/AppEvents/AppEvents";
import { Environment } from "@/utils/Environment/Environment";
import { RequestAPI } from "@/utils/Requests/RequestAPI";
import { Session } from "@/utils/Session/Session";
import { Toolbox } from "@/utils/Toolbox/Toolbox";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { alertController } from "@ionic/vue";
import OneSignalVuePlugin from '@onesignal/onesignal-vue3'
import { OneSignalPlugin } from "onesignal-cordova-plugin";
import { register } from 'register-service-worker'


class NotificationsDeepLinks{
    public static openDeepLink(deepLink: string){
        const cleanLink = deepLink.split('/app/')[1];
        Session.waitForLogin().then((session:any) => {
            AppEvents.emit('all:reload');
            Session.router?.push('/' + cleanLink);
        })
    }
}

class Notifications{
    public static oneSignalAppId: string = Environment.variable('ONESIGNAL_APP_ID');
    private static oneSignal: any = null;
    public static checkForPermission(){
        return new Promise((resolve, reject) => {
            if (Capacitor.isNativePlatform()){
                PushNotifications.checkPermissions().then((response) => {
                    if (response.receive == 'granted'){
                        resolve('Allowed');
                    }else if (response.receive == 'denied'){
                        resolve('Denied');
                    }else{
                        resolve('NotAsked');
                    }
                })
            }else{
                Notifications.waitOneSignalLogin().then(async () => {
                    const isSupported = Notifications.oneSignal.Notifications.isPushSupported();
                    if (!isSupported){
                        resolve('Denied');
                        return;
                    }

                    const permission = await Notifications.oneSignal.Notifications.permission;
                    if (permission){
                        resolve('Allowed');
                        return;
                    }else{
                        if (Notification.permission == 'denied'){
                            resolve('Denied');
                            return;
                        }
                        resolve('NotAsked');
                        return;
                    }
                })
            }
        })
    }
    public static hardAskForPermission(){
        return new Promise((resolve, reject) => {
            if (Capacitor.isNativePlatform()){
                PushNotifications.requestPermissions().then((response) => {
                    if (response.receive == 'granted'){
                        resolve('Allowed');
                    }else if (response.receive == 'denied'){
                        resolve('Denied');
                    }else{
                        resolve('NotAsked');
                    }
                })
            }else{
                Notifications.waitOneSignalLogin().then(async () => {
                    const response = await Notifications.oneSignal.Notifications.requestPermission();
                })
            }
        })
    }
    public static softAskForPermission(){
        return new Promise(async (resolve, reject) => {
            if (Capacitor.isNativePlatform()){
                const wasBlocked = await Notifications.isBlocked();
                if (wasBlocked){
                    console.warn('The user already Denied the notification service');
                }
                alertController.create({
                    header: 'Notificaciones',
                    message: 'Receba notificaciones de reportes aprobados, rechazados y otras más...',
                    buttons: [
                        {
                            text: 'Aún no',
                            handler: () => {
                                resolve('Denied');
                            }
                        },
                        {
                            text: 'Activar notificationes',
                            handler: () => {
                                Notifications.hardAskForPermission().then((response) => {
                                    resolve(response);
                                })
                            }
                        }
                    ]
                }).then((alert) => {
                    alert.present();
                })
            }else{
                const wasBlocked = await Notifications.isBlocked();
                if (wasBlocked){
                    console.warn('The user already Denied the notification service');
                }
                const response = await Notifications.oneSignal.Slidedown.promptPush({force: true});
                resolve(null)
            }
        })
    }
    public static isAllowed(){
        return new Promise((resolve, reject) => {
            Notifications.checkForPermission().then((response) => {
                if (response == 'Allowed'){
                    resolve(true);
                }else{
                    resolve(false);
                }
            })
        })
    }
    public static isBlocked(){
        return new Promise((resolve, reject) => {
            Notifications.checkForPermission().then((response) => {
                if (response == 'Denied'){
                    resolve(true);
                }else{
                    resolve(false);
                }
            })
        })
    }
    public static initializeOneSignal(OneSignal:any){
        Session.waitForLogin().then((session:any) => {
            if (Capacitor.isNativePlatform()){
                OneSignal.initialize(Notifications.oneSignalAppId);
                OneSignal.Notifications.addEventListener('click', async (e:any) => {
                    let clickData = await e.notification;
                    if (clickData.additionalData.deepLink){
                        NotificationsDeepLinks.openDeepLink(clickData.additionalData.deepLink);
                    }
                })
                setTimeout(() => {
                    OneSignal.login(Toolbox.getOneSignalUserId(Session.session?.id()));
                    Notifications.oneSignal = OneSignal;
                }, 3000)
            }else{
                if (window.location.port != ''){
                    console.warn('OneSignal is not allowed in development mode');
                    return;
                }

                register(`/resources/service-workers/one-signal-sw.js`,{
                    registrationOptions: { scope: './' },
                    ready (registration) {
                        
                    },
                    registered (registration) {
                        
                    },
                    cached (registration) {
                        
                    },
                    updatefound (registration) {
                        
                    },
                    updated (registration) {
                        
                    },
                    offline () {
                        
                    },
                    error (error) {
                        
                    }
                })

                setTimeout(() => {
                    OneSignal.login(Toolbox.getOneSignalUserId(Session.session?.id()));
                    Notifications.oneSignal = OneSignal;
                }, 1000)
            }
        })
    }
    public static async waitOneSignalLogin(){
        return new Promise((resolve, reject) => {
            let interval = setInterval(() => {
                if (Notifications.oneSignal != null){
                    clearInterval(interval);
                    resolve(true);
                }
            }, 300)
        })
    }
}

export { Notifications }