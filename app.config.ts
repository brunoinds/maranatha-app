interface ApplicationConfig{
    version: string,
    build: string,
    environment: 'prod' | 'dev'
}




const config: ApplicationConfig = {
    version: '1.0.0',
    build: '1.0.0.1',
    environment: 'prod'
}










export default {load() {return {...config}}}