import { Session } from '@/utils/Session/Session';
import { Capacitor } from '@capacitor/core';
import * as Sentry from '@sentry/capacitor';
import * as SentryVue from '@sentry/vue';

class ErrorTracking{
    public static sentry: any = null;


    public static initialize(app:any, router:any){
        ErrorTracking.sentry = Sentry;
        Sentry.init(
            {
                app,
                dsn: "https://8f4fa12843c8c5cf1d27227e91d0cf0d@o4506538720100352.ingest.sentry.io/4506538726326272",
                integrations: [],
            },
            SentryVue.init
        );
    }

    public static async linkToSession(){
        return new Promise((resolve, reject) => {
            Session.waitForLogin().then(async () => {
                const session = await Session.getCurrentSession();
                Sentry.configureScope((scope) => {
                    scope.setUser({
                        id: session?.id(),
                        username: session?.username(),
                        email: session?.email(),
                    })
                    resolve({})
                })
            })
        })
        
    }
    public static async unlinkSession(){
        return new Promise((resolve, reject) => {
            Sentry.configureScope((scope) => {
                scope.setUser(null);
                resolve({});
            })
        })
    }
}


export { ErrorTracking }