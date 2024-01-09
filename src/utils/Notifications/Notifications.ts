import { Environment } from "@/utils/Environment/Environment";
import { RequestAPI } from "@/utils/Requests/RequestAPI";
import { Session } from "@/utils/Session/Session";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { alertController } from "@ionic/vue";
import OneSignalVuePlugin from '@onesignal/onesignal-vue3'
import { register } from 'register-service-worker'

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
                    const response = Notifications.oneSignal.Slidedown.promptPush({force: true});

                
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
                    const response = Notifications.oneSignal.Notifications.requestPermission();
                    console.log(response);
                })
            }
        })
    }
    public static softAskForPermission(){
        return new Promise((resolve, reject) => {
            if (Capacitor.isNativePlatform()){
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

            }
        })
    }
    public static isAllowed(){
        return new Promise((resolve, reject) => {
            PushNotifications.checkPermissions().then((response) => {
                if (response.receive == 'granted'){
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
                setTimeout(() => {
                    OneSignal.login("user-id-" + String(Session.session?.id()));
                    Notifications.oneSignal = OneSignal;
                }, 3000)
            }else{
                return;
                register(`/public/assets/service-workers/OneSignalSDKWorker.js`,{
                    registrationOptions: { scope: './' },
                    ready (registration) {
                        console.log('Service worker is active.')
                    },
                    registered (registration) {
                        console.log('Service worker has been registered.')
                    },
                    cached (registration) {
                        console.log('Content has been cached for offline use.')
                    },
                    updatefound (registration) {
                        console.log('New content is downloading.')
                    },
                    updated (registration) {
                        console.log('New content is available; please refresh.')
                    },
                    offline () {
                        console.log('No internet connection found. App is running in offline mode.')
                    },
                    error (error) {
                        console.error('Error during service worker registration:', error)
                    }
                })

                setTimeout(() => {
                    OneSignal.login("user-id-" + String(Session.session?.id()));
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