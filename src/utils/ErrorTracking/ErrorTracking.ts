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
                dsn: Environment.variable('SENTRY_DSN'),
                release: 'maranathasender@' + Environment.version(),
                dist: Environment.version() + '.' + Environment.build(),
                environment: Environment.environment(),
            }
        );
        
        // Initialize Vue integration separately
        SentryVue.init(app, {
            router,
            dsn: Environment.variable('SENTRY_DSN'),
            release: 'maranathasender@' + Environment.version(),
            dist: Environment.version() + '.' + Environment.build(),
            environment: Environment.environment(),
        });
    }

    public static async linkToSession(){
        return new Promise((resolve, reject) => {
            Session.waitForLogin().then(async () => {
                const session = await Session.getCurrentSession();
                Sentry.setUser({
                    id: session?.id(),
                    username: session?.username(),
                    email: session?.email(),
                });
                resolve({})
            })
        })
        
    }
    public static async unlinkSession(){
        return new Promise((resolve, reject) => {
            Sentry.setUser(null);
            resolve({});
        })
    }
}


export { ErrorTracking }