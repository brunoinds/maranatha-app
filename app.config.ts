import configJson from './app.config.json';

interface ApplicationConfig{
    version: string,
    build: number,
    environment: 'prod' | 'dev'
}




const config: ApplicationConfig = {
    version: configJson.versioning.version,
    build: configJson.versioning.build,
    environment: configJson.environment as 'prod' | 'dev'
}









export default {load() {return {...config}}}