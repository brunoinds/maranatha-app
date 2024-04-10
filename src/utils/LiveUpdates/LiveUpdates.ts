import { Environment } from '@/utils/Environment/Environment';
import { RequestAPI } from '@/utils/Requests/RequestAPI'
import { CapacitorUpdater } from '@capgo/capacitor-updater'
import { alertController, toastController } from '@ionic/vue';
import { SplashScreen } from '@capacitor/splash-screen'

interface DownloadableBundle{
    version: string,
    minimalVersion: string,
    size: number,
    url: string
}

export class LiveUpdates{
    private static downloadedUpdate: null | {
        bundle: DownloadableBundle,
        content: any
    } = null;
    private static hasFetchedUpdates = false;

    public static async fetchUpdates()
    {
        if (LiveUpdates.hasFetchedUpdates){
            return;
        }
        if (!navigator.onLine){
            return;
        }
        const response = (await RequestAPI.get('/app/native/bundles')) as unknown as {
            bundles: Array<DownloadableBundle>
        };

        LiveUpdates.hasFetchedUpdates = true;

        const bundle = response.bundles.length > 0 ? response.bundles[0] : null;

        //alert(`🛜 Found new available update version: ${bundle?.version}, the device has version ${Environment.version()}.`)
        if (!bundle){
            return;
        }

        const isUpdatableBundle = bundle.version > Environment.version();

        if (!isUpdatableBundle){
            return;
        }

        const compatibleWithTheMinimalNativeVersion = bundle.minimalVersion >= Environment.storeVersioning().version;
        
        if (!compatibleWithTheMinimalNativeVersion){
            console.log(`🛜❌ The bundle is not compatible with the current native version. Bundle version: ${bundle.minimalVersion}, Native version: ${Environment.storeVersioning().version}`)
            return;
        }

        console.log(`🛜 Found new available update version: ${bundle.version}, the device has version ${Environment.version()}.`)

        LiveUpdates.downloadUpdate(bundle)
    }

    public static async downloadUpdate(bundle: DownloadableBundle)
    {
        const content = await CapacitorUpdater.download({
            version: bundle.version,
            url: bundle.url,
        })
        
        LiveUpdates.downloadedUpdate = {
            bundle,
            content
        }
    }

    public static async installUpdate()
    {
        if (!LiveUpdates.downloadedUpdate){
            console.error('Tried to install an update that was not downloaded')
            return;
        }

        SplashScreen.show();
        try {
            console.log(`📲 Installing update on device (${LiveUpdates.downloadedUpdate?.bundle.version})...`)
            await CapacitorUpdater.set(LiveUpdates.downloadedUpdate.content);
            LiveUpdates.downloadedUpdate = null;
        } catch (err) {
            console.error(`📲❌ Error while installing update of version: ${LiveUpdates.downloadedUpdate?.bundle.version}`, err)
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