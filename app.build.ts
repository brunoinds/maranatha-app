import { exec, execSync, spawn } from 'child_process';
import fs from 'fs';
import AppConfigSecrets from './app.config.secrets.json';

enum Platforms{
    iOS = 'ios',
    Android = 'android'
}

class Versioning{
    public static async incrementBuildVersion(){
        return new Promise((resolve, reject) => {
            const configContent = JSON.parse(fs.readFileSync('app.config.json', 'utf8'));
            configContent.versioning.build++;
            fs.writeFileSync('app.config.json', JSON.stringify(configContent, null, 4));

            const ls = spawn('npx', ['capacitor-set-version', '-v', configContent.versioning.version, '-b', configContent.versioning.build], {
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
    public static async changeEnvironment(environment: 'prod' | 'dev'){
        return new Promise((resolve, reject) => {
            const configContent = JSON.parse(fs.readFileSync('app.config.json', 'utf8'));
            configContent.environment = environment;
            fs.writeFileSync('app.config.json', JSON.stringify(configContent, null, 4));
            resolve({});
        })
    }
}

class CapacitorCompiler{
    public static async build(platform: Platforms = Platforms.iOS){
        return new Promise((resolve, reject) => {
            const ls = spawn('ionic', ['capacitor', 'build', platform], {
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
    public static async open(platform: Platforms = Platforms.iOS){
        return new Promise((resolve, reject) => {
            const ls = spawn('ionic', ['capacitor', 'open', platform], {
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
    public static async sync(){
        return new Promise((resolve, reject) => {
            const ls = spawn('ionic', ['capacitor', 'sync'], {
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
    public static async run(platform: Platforms = Platforms.iOS){
        return new Promise((resolve, reject) => {
            const ls = spawn('ionic', ['capacitor', 'run', platform], {
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
    public static async live(platform: Platforms = Platforms.iOS){
        return new Promise((resolve, reject) => {
            const ls = spawn('ionic', ['capacitor', 'run', platform, '-l', '--external'], {
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
}

class AppDeployer{
    public static appBuildPath = '.build';

    public static async deploy(platform: Platforms = Platforms.iOS){
        if (platform === Platforms.iOS){
            return await AppDeployer.iOSDeploy();
        } else if (platform === Platforms.Android){
            return await AppDeployer.androidDeploy();
        }
    }

    private static async androidDeploy(){
        return new Promise (async (resolve, reject) => {
            const androidSigningStoreFilePathAbsolute = fs.realpathSync(AppConfigSecrets.publish.android.signing.signingStoreFilePath);
            const androidBuildPath = `${AppDeployer.appBuildPath}/android`;

            const emptyBuildFolder = async () => {
                return new Promise((resolve, reject) => {
                    if (!fs.existsSync(AppDeployer.appBuildPath)){
                        fs.mkdirSync(AppDeployer.appBuildPath);
                    }
                    if (fs.existsSync(androidBuildPath)){
                        fs.rmdirSync(androidBuildPath, { recursive: true });
                    }
                    fs.mkdirSync(androidBuildPath);
                    fs.writeFileSync(`${AppDeployer.appBuildPath}/.gitignore`, '');
                    resolve({});
                })
            }
            const checkIfSigningStoreExists = async () => {
                return new Promise((resolve, reject) => {
                    if (!fs.existsSync(androidSigningStoreFilePathAbsolute)){
                        reject(new Error('Signing store file does not exist'));
                    }
                    resolve({});
                })
            }
            const buildGraddle = async () => {
                return new Promise((resolve, reject) => {
                    // ./gradlew bundleRelease -Pandroid.injected.signing.store.file=./../keys/android-key-store-path -Pandroid.injected.signing.store.password=466862 -Pandroid.injected.signing.key.alias=key0 -Pandroid.injected.signing.key.password=466862

                    const ls = spawn('./gradlew', ['bundleRelease', 
                        `-Pandroid.injected.signing.store.file=${androidSigningStoreFilePathAbsolute}`,
                        `-Pandroid.injected.signing.store.password=${AppConfigSecrets.publish.android.signing.signingStorePassword}`,
                        `-Pandroid.injected.signing.key.alias=${AppConfigSecrets.publish.android.signing.signingKeyAlias}`,
                        `-Pandroid.injected.signing.key.password=${AppConfigSecrets.publish.android.signing.signingKeyPassword}`
                    ], {
                        cwd: 'android',
                        env: {
                            ...process.env,
                            JAVA_HOME: '/Applications/Android Studio.app/Contents/jbr/Contents/Home'
                        },
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
            const copyBuild = async () => {
                return new Promise((resolve, reject) => {
                    const buildPath = 'android/app/build/outputs/bundle/release/app-release.aab';
                    const destinationPath = `${androidBuildPath}/app-release.aab`;
                    if (fs.existsSync(destinationPath)){
                        fs.unlinkSync(destinationPath);
                    }
                    fs.copyFileSync(buildPath, destinationPath);
                    resolve({});
                })
            }

            try {
                await emptyBuildFolder();
                await checkIfSigningStoreExists();
                await buildGraddle();
                await copyBuild();
                resolve({});
            } catch (error) {
                reject(error);
            }
        })
    }
    private static async iOSDeploy(){
        return new Promise(async (resolve, reject) => {
            //xcodebuild -workspace ios/App/App.xcworkspace -scheme App -archivePath build/YourProject.xcarchive archive

            const iosBuildPath = `${AppDeployer.appBuildPath}/ios`;

            const archivePath = `${iosBuildPath}/App.xcarchive`;
            const exportOptionsPath = `${iosBuildPath}/exportOptions.plist`;
            const exportPath = `${iosBuildPath}/App.ipa`;
            const developmentId = AppConfigSecrets.publish.ios.teamId;


            const emptyBuildFolder = async () => {
                return new Promise((resolve, reject) => {
                    if (!fs.existsSync(AppDeployer.appBuildPath)){
                        fs.mkdirSync(AppDeployer.appBuildPath);
                    }
                    if (fs.existsSync(iosBuildPath)){
                        fs.rmdirSync(iosBuildPath, { recursive: true });
                    }
                    fs.mkdirSync(iosBuildPath);
                    fs.writeFileSync(`${AppDeployer.appBuildPath}/.gitignore`, '');
                    resolve({});
                })
            }

            const archiveProject = async () => {
                return new Promise((resolve, reject) => {
                    const ls = spawn('xcodebuild', ['-workspace', 'ios/App/App.xcworkspace', '-scheme', 'App', '-archivePath', archivePath, 'archive'], {
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

            const createTemporaryExportOptions = async () => {
                return new Promise((resolve, reject) => {
                    const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
                    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
                    <plist version="1.0">
                    <dict>
                        <key>method</key>
                        <string>app-store-connect</string>
                        <key>teamID</key>
                        <string>${developmentId}</string>
                    </dict>
                    </plist>`

                    fs.writeFileSync(exportOptionsPath, plistContent);
                    resolve({});
                })

                //<key>destination</key> <string>upload</string>
            }

            const exportProject = async () => {
                return new Promise((resolve, reject) => {
                    //xcodebuild -exportArchive -archivePath build/YourProject.xcarchive -exportPath build/YourProject.ipa -exportOptionsPlist exportOptions.plist

                    const ls = spawn('xcodebuild', ['-exportArchive', '-archivePath', archivePath, '-exportPath', exportPath, '-exportOptionsPlist', exportOptionsPath], {
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

            try {
                await emptyBuildFolder();
                await archiveProject();
                await createTemporaryExportOptions();
                await exportProject();
                resolve({});
            } catch (error) {
                reject(error);
            }
        })
    }
}

class CapacitorDeployer{
    public static async deploy(platform: Platforms = Platforms.iOS){
        await AppDeployer.deploy(platform);
    }
    public static publish(platform: Platforms = Platforms.iOS){
        return new Promise(async (resolve, reject) => {
            const openAppStoreConnect = async () => {
                return new Promise((resolve, reject) => {
                    const ls = spawn('open', [`https://appstoreconnect.apple.com/apps/${AppConfigSecrets.publish.ios.appStoreAppId}/distribution`]);
                    ls.on('close', (code) => {
                        resolve(code);
                    })
                    ls.on('error', (err) => {
                        reject(err);
                    })
                })
            }


            const openGooglePlayConsole = async () => {
                return new Promise((resolve, reject) => {
                    const ls = spawn('open', [`${AppConfigSecrets.publish.android.playStore.createReleaseUrl}`]);
                    ls.on('close', (code) => {
                        resolve(code);
                    })
                    ls.on('error', (err) => {
                        reject(err);
                    })
                })
            }

            const showAndroidReleaseInFinder = async () => {
                return new Promise((resolve, reject) => {
                    const ls = spawn('open', [`${AppDeployer.appBuildPath}/android`]);
                    ls.on('close', (code) => {
                        resolve(code);
                    })
                    ls.on('error', (err) => {
                        reject(err);
                    })
                })
            }

            if (platform === Platforms.iOS){
                await openAppStoreConnect();
            } else if (platform === Platforms.Android){
                await openGooglePlayConsole();
                await showAndroidReleaseInFinder();
            }
        })
    }
}



class CLI{
    public static commands = [
        'cap build',
        'cap open',
        'cap sync',
        'cap live',
        'cap run',
        'cap deploy',
        'cap publish',
        'ionic serve'
    ]

    public static async entryPoint(){
        const argumentsReceived = process.argv;
        let commandsReceived:any = [];

        argumentsReceived.forEach((arg, index) => {
            if (arg.endsWith('.ts')){
                commandsReceived = [...argumentsReceived.slice(index + 1)];
            }
        });

        if (commandsReceived.length === 0){
            console.log('No commands received');
            console.log('Available commands:');
            CLI.commands.forEach(command => {
                console.log(`- ${command}`);
            });
            return;
        }

        const commandSelected = CLI.commands.find(command => {
            return command == commandsReceived[0] + ' ' + commandsReceived[1];
        })

        if (!commandSelected){
            console.log('Command not found');
            console.log('Available commands:');
            CLI.commands.forEach(command => {
                console.log(`- ${command}`);
            });
            return;
        }

        const platform = commandsReceived[2];
        const args = commandsReceived.slice(3);

        if (commandSelected === 'cap build'){
            await CLI.capBuild(platform, args);
        } else if (commandSelected === 'cap open'){
            await CLI.capOpen(platform, args);
        } else if (commandSelected === 'cap sync'){
            await CLI.capSync(platform, args);
        } else if (commandSelected === 'cap live'){
            await CLI.capLive(platform, args);
        } else if (commandSelected === 'cap run'){
            await CLI.capRun(platform, args);
        } else if (commandSelected === 'cap deploy'){
            await CLI.capDeploy(platform, args);
        } else if (commandSelected === 'cap publish'){
            await CLI.capPublish(platform, args);
        } else {
            console.log('Command not found');
            console.log('Available commands:');
            CLI.commands.forEach(command => {
                console.log(`- ${command
                }`);
            })
        }
    }

    private static async capBuild(platform: Platforms = Platforms.iOS, args: []){
        return new Promise(async (resolve, reject) => {
            await Versioning.incrementBuildVersion();
            await CapacitorCompiler.build(platform);
        })
    }
    private static async capOpen(platform: Platforms = Platforms.iOS, args: []){
        return new Promise(async (resolve, reject) => {
            await CapacitorCompiler.open(platform);
        })
    }
    private static async capSync(platform: Platforms = Platforms.iOS, args: []){
        return new Promise(async (resolve, reject) => {
            await CapacitorCompiler.sync();
        })
    }
    private static async capLive(platform: Platforms = Platforms.iOS, args: []){
        return new Promise(async (resolve, reject) => {
            await CapacitorCompiler.live(platform);
        })
    }
    private static async capRun(platform: Platforms = Platforms.iOS, args: []){
        return new Promise(async (resolve, reject) => {
            await CapacitorCompiler.run(platform);
        })
    }
    private static async capDeploy(platform: Platforms = Platforms.iOS, args: []){
        return new Promise(async (resolve, reject) => {
            await CapacitorDeployer.deploy(platform);
        })
    }
    private static async capPublish(platform: Platforms = Platforms.iOS, args: []){
        return new Promise(async (resolve, reject) => {
            await CapacitorDeployer.publish(platform);
        })
    }
}

(async () => {
    await CLI.entryPoint();
})();