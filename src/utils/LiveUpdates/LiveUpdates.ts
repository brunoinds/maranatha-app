import { Environment } from '@/utils/Environment/Environment';
import { RequestAPI } from '@/utils/Requests/RequestAPI'
import { CapacitorUpdater } from '@capgo/capacitor-updater'
import { alertController } from '@ionic/vue';
import { SplashScreen } from '@capacitor/splash-screen'

interface DownloadableBundle{
    version: string,
    size: number,
    url: string
}

export class LiveUpdates{
    private static downloadedUpdate: null | {
        bundle: DownloadableBundle,
        content: any
    } = null;

    public static async fetchUpdates(){
        const response = (await RequestAPI.get('/app/native/bundles')) as unknown as {
            bundles: Array<DownloadableBundle>
        };


        const bundle = response.bundles.length > 0 ? response.bundles[0] : null;


        if (!bundle){
            return;
        }

        const isUpdatableBundle = bundle.version > Environment.version();

        if (!isUpdatableBundle){
            return;
        }


        alertController.create({
            header: 'Update disponible',
            buttons: [
                {
                    text: 'Download',
                    handler: () => {
                        LiveUpdates.downloadUpdate(bundle)
                    }
                }
            ]
        })

    }

    public static async downloadUpdate(bundle: DownloadableBundle){
        const content = await CapacitorUpdater.download({
            version: bundle.version,
            url: bundle.url,
        })

        
        LiveUpdates.downloadedUpdate = {
            bundle,
            content
        }
    }

    public static async installUpdate(){
        if (!LiveUpdates.downloadedUpdate){
            console.error('Tried to install an update that was not downloaded')
            return;
        }

        alert('Instalando update');
        SplashScreen.show();
        try {
            await CapacitorUpdater.set(LiveUpdates.downloadedUpdate.content);
            LiveUpdates.downloadedUpdate = null;
        } catch (err) {
            SplashScreen.hide();
            throw err;
        }
    }

    public static async installUpdateIfAvailableAndReady()
    {
        if (LiveUpdates.hasUpdateReadyToInstall()){
            await LiveUpdates.installUpdate()
        }
    }

    public static hasUpdateReadyToInstall()
    {
        return (LiveUpdates.downloadedUpdate != null);
    }
}