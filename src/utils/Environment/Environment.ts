import { Capacitor } from "@capacitor/core";

import AppConfig from '@/../app.config.json';
import { App } from '@capacitor/app';

interface ApplicationConfig{
    version: string,
    build: number,
    environment: 'prod' | 'dev',
    storeVersioning: {
        version: string,
        build: number
    }
}

class Environment{
    private static config : ApplicationConfig = {
        version: AppConfig.versioning.version,
        build: AppConfig.versioning.build,
        environment: AppConfig.environment as 'prod' | 'dev',
        storeVersioning: {
            version: AppConfig.versioning.version,
            build: AppConfig.versioning.build
        },
    }
    public static variable(variable: string): any{
        const variableName = (`VITE_${Environment.environment()}_${variable.toUpperCase()}`).toUpperCase();
        const response = import.meta.env[variableName];
        return response
    }

    public static version(): string{
        return Environment.config.version;
    }

    public static build(): number{
        return Environment.config.build;
    }

    public static storeVersioning(): {version: string, build: number}{
        return Environment.config.storeVersioning;
    }

    public static environment(): 'prod' | 'dev'{
        return Environment.config.environment;
    }

    public static platform(): 'Native' | 'Web'{
        if (Capacitor.isNativePlatform()) {
            return 'Native';
        }else{
            return 'Web';
        }
    }

    public static _initialize(){
        if (Environment.platform() === 'Native'){
            App.getInfo().then((info) => {
                Environment.config.storeVersioning = {
                    version: info.version,
                    build: parseInt(info.build)
                }
            })
        }
    }
}

Environment._initialize();


export { Environment }