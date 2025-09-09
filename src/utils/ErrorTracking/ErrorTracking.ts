import { Environment } from '@/utils/Environment/Environment';
import { Session } from '@/utils/Session/Session';
import { Capacitor } from '@capacitor/core';
import * as Sentry from '@sentry/capacitor';
import * as SentryVue from '@sentry/vue';
import { replayIntegration } from '@sentry/replay';

class ErrorTracking{
    public static sentry: any = null;


    public static initialize(app:any, router:any){
        ErrorTracking.sentry = Sentry;
        let integrations = [];

        if (Environment.environment() == 'prod'){
            integrations.push(replayIntegration({
                maskAllText: false,
                maskAllInputs: false,
            }));
        }
        
        Sentry.init(
            {
                dsn: Environment.variable('SENTRY_DSN'),
                integrations: integrations,
                release: 'maranathasender@' + Environment.version(),
                dist: Environment.version() + '.' + Environment.build(),
                environment: Environment.environment(),
                // Session Replay
                replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
                replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
            }
        );
        
        // Initialize Vue integration separately
        SentryVue.init(app, {
            router,
            dsn: Environment.variable('SENTRY_DSN'),
            integrations: integrations,
            release: 'maranathasender@' + Environment.version(),
            dist: Environment.version() + '.' + Environment.build(),
            environment: Environment.environment(),
            replaysSessionSampleRate: 0.1,
            replaysOnErrorSampleRate: 1.0,
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