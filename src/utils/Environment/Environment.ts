import { Capacitor } from "@capacitor/core";


import configuration from './../../../app.config';


class Environment{
    private static config = configuration.load();
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