import { Capacitor } from "@capacitor/core";

import AppConfig from '@/../app.config.json';

interface ApplicationConfig{
    version: string,
    build: number,
    environment: 'prod' | 'dev'
}

class Environment{
    private static config : ApplicationConfig = {
        version: AppConfig.versioning.version,
        build: AppConfig.versioning.build,
        environment: AppConfig.environment as 'prod' | 'dev'
    }
    public static variable(variable: string): any{
        const variableName = (`VITE_${Environment.environment()}_${variable.toUpperCase()}`).toUpperCase();
        const response = import.meta.env[variableName];
        return response
    }

    public static version(): string{
        return Environment.config.version;
    }
    public static build(): string{
        return Environment.config.build;
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
}


export { Environment }