import { Environment } from '@/utils/Environment/Environment';
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
                dsn: Environment.variable('SENTRY_DSN'),
                integrations: [],
                release: 'maranathasender@' + Environment.version() + ':' + Environment.build(),
                dist: Environment.version() + ':' + Environment.build(),
                environment: Environment.environment()
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