import CapacitorConfig from './capacitor.config.ts';
import { exec, execSync, spawn } from 'child_process';
import fs from 'fs';



class Versioning{
    public static getVersioning(){
        return JSON.parse(fs.readFileSync('app.config.json', 'utf8')).versioning;
    }
    public static getLiveUpdates(){
        return JSON.parse(fs.readFileSync('app.config.json', 'utf8')).liveUpdates;
    }
}


class CapacitorLiveUpdates{
    public static appBundlePath = '.bundle';

    public static async bundle(){

        return new Promise(async (resolve, reject) => {
            const args = process.argv.slice(2);
            const originPath = args[0];
            const fileName = `${CapacitorConfig.appId}_${Versioning.getVersioning().version}.zip`;
            const outputPath = `${originPath}/${fileName}` 

            const bundle = async () => {
                return new Promise((resolve, reject) => {
                    const ls = spawn('npx', ['@capgo/cli', 'bundle', 'zip', '--bundle', Versioning.getVersioning().version, '--path', originPath], {
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

            const emptyBundlesPath = async () => {
                return new Promise((resolve, reject) => {
                    fs.rmSync(originPath, { recursive: true });
                    fs.mkdirSync(originPath);
                    resolve({})
                })
            }

            const moveBundle = async () => {
                return new Promise((resolve, reject) => {
                    const finalOutputPath = outputPath.replace('.zip', `(m${Versioning.getLiveUpdates().minimalNativeVersion}).zip`)
                    fs.rename(`${fileName}`, finalOutputPath, (err) => {
                        if (err){
                            reject(err);
                        }
                        resolve({});
                    })
                })
            }
            try {
                await bundle();
                await emptyBundlesPath();
                await moveBundle();
                resolve({});
            } catch (error) {
                reject(error);
            }
        })
    }
}
CapacitorLiveUpdates.bundle();

