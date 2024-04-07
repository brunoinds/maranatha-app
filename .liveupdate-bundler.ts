import CapacitorConfig from './capacitor.config.ts';
import { exec, execSync, spawn } from 'child_process';
import fs from 'fs';

class Versioning{
    public static getVersioning(){
        return JSON.parse(fs.readFileSync('app.config.json', 'utf8')).versioning;
    }
}


class CapacitorLiveUpdates{
    public static appBundlePath = '.bundle';

    public static async bundle(){

        return new Promise(async (resolve, reject) => {
            const outputPath = `${CapacitorConfig.appId}_${Versioning.getVersioning().version}.zip` 

            const emptyBundleFolder = async () => {
                return new Promise((resolve, reject) => {
                    if (!fs.existsSync(CapacitorLiveUpdates.appBundlePath)){
                        fs.mkdirSync(CapacitorLiveUpdates.appBundlePath);
                    }
                    if (fs.existsSync(CapacitorLiveUpdates.appBundlePath)){
                        fs.rmSync(CapacitorLiveUpdates.appBundlePath, { recursive: true });
                    }
                    fs.mkdirSync(CapacitorLiveUpdates.appBundlePath);
                    resolve({});
                })
            }
            const bundle = async () => {
                return new Promise((resolve, reject) => {
                    const ls = spawn('npx', ['@capgo/cli', 'bundle', 'zip', '--bundle', Versioning.getVersioning().version, '--path', '../resources/ionic'], {
                        stdio: ['inherit', 'inherit', 'inherit']
                    });
                    ls.on('close', (code) => {
                        resolve(code);
                    })
                    ls.on('error', (err) => {
                        reject(err);
                    })
                })
            }
            const moveToBundle = async () => {
                //If .bundles folder does not exist, create it:
                if (!fs.existsSync(CapacitorLiveUpdates.appBundlePath)){
                    fs.mkdirSync(CapacitorLiveUpdates.appBundlePath);
                }

                //Move the generated bundle to the .bundles folder, if it already exists, overwrite it:
                fs.copyFileSync(outputPath, `${CapacitorLiveUpdates.appBundlePath}/${outputPath}`);
                fs.unlinkSync(outputPath);
            }
            try {
                await emptyBundleFolder();
                await bundle();
                await moveToBundle();
                resolve({});
            } catch (error) {
                reject(error);
            }
        })
    }
}
CapacitorLiveUpdates.bundle();

