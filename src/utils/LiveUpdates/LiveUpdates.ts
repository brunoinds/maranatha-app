import { Environment } from '@/utils/Environment/Environment';
import { RequestAPI } from '@/utils/Requests/RequestAPI'
import { CapacitorUpdater } from '@capgo/capacitor-updater'
import { alertController, toastController } from '@ionic/vue';
import { SplashScreen } from '@capacitor/splash-screen'
import { ref } from 'vue';

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


    private static compareVersions(version1: string, comparison: '=' | '>' | '<' | '>=' | '<=', version2: string){
        function compareVersions(v1:string, v2: string) {
            const parts1 = v1.split('.').map(Number);
            const parts2 = v2.split('.').map(Number);
            
            for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
                const part1 = parts1[i] || 0;
                const part2 = parts2[i] || 0;
                
                if (part1 > part2) return 1;
                if (part1 < part2) return -1;
            }
            
            return 0;
        }

        const preResult = compareVersions(version1, version2);
        if (comparison === '=') return preResult === 0;
        if (comparison === '>') return preResult === 1;
        if (comparison === '<') return preResult === -1;
        if (comparison === '>=') return preResult >= 0;
        if (comparison === '<=') return preResult <= 0;
        return false;
    }

    public static externalLabels = ref<{
        state: 'Searching' | 'Downloading' | 'ReadyToInstall' | 'Installing' | 'NoUpdateAvailable',
        availableUpdate: DownloadableBundle | null
    }>({
        state: 'NoUpdateAvailable',
        availableUpdate: null
    });

    public static async fetchUpdates(forceToFetch = false)
    {
        if (LiveUpdates.hasFetchedUpdates && !forceToFetch){
            return;
        }
        if (!navigator.onLine){
            return;
        }
        LiveUpdates.externalLabels.value.state = 'Searching';   
        const response = (await RequestAPI.get('/app/native/bundles')) as unknown as {
            bundles: Array<DownloadableBundle>
        };

        LiveUpdates.hasFetchedUpdates = true;
        
        //'1.2.9' > '1.2.100000000'
        const bundle = response.bundles.length > 0 ? response.bundles[0] : null;

        //alert(`🛜 Found new available update version: ${bundle?.version}, the device has version ${Environment.version()}.`)
        if (!bundle){
            LiveUpdates.externalLabels.value.state = 'NoUpdateAvailable';
            return;
        }

        const isUpdatableBundle = LiveUpdates.compareVersions(bundle.version, '>', Environment.version());

        if (!isUpdatableBundle){
            LiveUpdates.externalLabels.value.state = 'NoUpdateAvailable';
            return;
        }

        const compatibleWithTheMinimalNativeVersion = LiveUpdates.compareVersions(Environment.storeVersioning().version, '>=', bundle.minimalVersion);
        
        if (!compatibleWithTheMinimalNativeVersion){
            console.log(`🛜❌ The bundle is not compatible with the current native version. Bundle version: ${bundle.minimalVersion}, Native version: ${Environment.storeVersioning().version}`)
            LiveUpdates.externalLabels.value.state = 'NoUpdateAvailable';
            return;
        }

        LiveUpdates.externalLabels.value.availableUpdate = bundle;
        console.log(`🛜 Found new available update version: ${bundle.version}, the device has version ${Environment.version()}.`)
        LiveUpdates.externalLabels.value.state = 'Downloading';
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
        LiveUpdates.externalLabels.value.state = 'ReadyToInstall';
    }

    public static async installUpdate()
    {
        if (!LiveUpdates.downloadedUpdate){
            console.error('Tried to install an update that was not downloaded')
            return;
        }

        SplashScreen.show();
        try {
            LiveUpdates.externalLabels.value.state = 'Installing';
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


//Buscando nuevas actualizaciones
//Descargando actualización
//Instalando actualización