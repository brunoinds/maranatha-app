import { exec, execSync } from 'child_process';
import fs from 'fs';
import { spawn } from 'child_process';
import open from 'open';
import path from 'path';


function incrementBuildVersion(){
    const configContent = JSON.parse(fs.readFileSync('app.config.json', 'utf8'));

    configContent.versioning.build++;
    console.log('⚙️  Incrementing build version...');
    fs.writeFileSync('app.config.json', JSON.stringify(configContent, null, 4));
}
function updateVersionAndBuildOnProject(){
    const configContent = JSON.parse(fs.readFileSync('app.config.json', 'utf8'));
    const command = `npx capacitor-set-version -v ${configContent.versioning.version} -b ${configContent.versioning.build}`;

    //Execute command on current directory and print output:
    console.log('⚙️  Updating version and build on project...');
    const response = execSync(command, {stdio: 'inherit'});
    console.log(response);
}
function build(){
    return new Promise((resolve, reject) => {
        const ls = spawn('ionic', ['build']);
        ls.stdout.on('data', (data) => {
            console.log(data.toString());
        });

        ls.stderr.on('data', (data) => {
            console.error(data.toString());
            reject()
        });

        ls.on('close', (code) => {
            resolve()
        });
    })
    
}
function buildAndroid(){
    return new Promise((resolve, reject) => {
        console.log('⚙️  Building Android...');
        const ls = spawn('ionic', ['capacitor', 'build', 'android']);
        ls.stdout.on('data', (data) => {
            console.log(data.toString());
        });

        ls.stderr.on('data', (data) => {
            console.error(data.toString());
            reject()
        });

        ls.on('close', (code) => {
            resolve()
        });
    })
}
function buildIOS(){
    return new Promise((resolve, reject) => {
        console.log('⚙️  Building iOS...');
        const ls = spawn('ionic', ['capacitor', 'build', 'ios']);
        ls.stdout.on('data', (data) => {
            console.log(data.toString());
        });

        ls.stderr.on('data', (data) => {
            console.error(data.toString());
            reject()
        });

        ls.on('close', (code) => {
            resolve()
        });
    })
}
function deployIOS(){
    const xcodeProjectPath ='ios/App/App.xcodeproj';

        // Path to the Xcode executable
        const xcodePath = '/Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild';

        // Command to open the Xcode project
        const openProjectCommand = `open "${xcodeProjectPath}"`;


        console.log(openProjectCommand)
        // Open the Xcode project
        const openProjectProcess = spawn('sh', ['-c', openProjectCommand]);

        openProjectProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Opening Xcode project failed with code ${code}`);
                return;
            }
            console.log('Xcode project opened successfully');
            // Command to archive the project
            const archiveCommand = `"${xcodePath}" -project "${xcodeProjectPath}" -scheme "App" archive`;

            // Execute the command to archive the project
            const archiveProcess = spawn('sh', ['-c', archiveCommand]);

            archiveProcess.stdout.on('data', (data) => {
                console.log(data.toString());
            })
            archiveProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error(`Archiving project failed with code ${code}`);
                    return;
                }
            

                console.log('Project archived successfully');
            
                return;
                // Command to upload the archive to App Store Connect
                const uploadCommand = `"${xcodePath}" -project "${xcodeProjectPath}" -scheme "Your Scheme" -archivePath "path/to/archive.xcarchive" -exportOptionsPlist "path/to/export.plist" -exportArchive -uploadSymbols`;
            
                // Execute the command to upload the archive to App Store Connect
                const uploadProcess = spawn('sh', ['-c', uploadCommand]);
            
                uploadProcess.on('close', (code) => {
                    if (code !== 0) {
                        console.error(`Uploading to App Store Connect failed with code ${code}`);
                        return;
                    }
                    console.log('Archive uploaded to App Store Connect successfully');
                });
            });
        });
}


function buildNative(){
    return new Promise(async (resolve, reject) => {
        await buildIOS();
        await buildAndroid();
        resolve()
    })
    
}

const commands = {
    'increment-version': async () => {
        incrementBuildVersion();
        updateVersionAndBuildOnProject();
    },
    '0': async () => {
        incrementBuildVersion();
        updateVersionAndBuildOnProject();
        await build();
    },
    'web': async () => {
        incrementBuildVersion();
        updateVersionAndBuildOnProject();
        await build();
    },
    'ios': async () => {
        incrementBuildVersion();
        updateVersionAndBuildOnProject();
        await buildIOS();
    },
    'android': async () => {
        incrementBuildVersion();
        updateVersionAndBuildOnProject();
        await buildAndroid();
    },
    'native': async () => {
        incrementBuildVersion();
        updateVersionAndBuildOnProject();
        await buildNative();
    },
    'deploy': async () => {
        deployIOS();
    }
}

function main(){
    const args = process.argv.slice(3);//Slice 3 because the arguments is comming with the first 3 arguments of node.js npm run script
    return new Promise(async (resolve, reject) => {
        try {
            if (args.length === 0){
                await commands['0']();
                return;
            }else{
                for (let i = 0; i < args.length; i++) {
                    const arg = args[i];
                    if (commands[arg]){
                        await commands[arg]();
                    }else{
                        console.log(`⚠️  Command ${arg} not found.`);
                    }
                }
            }
        } catch (error) {
            if (error != undefined){
                console.error(error)
            }
        }
    })
}

main();

//How to run? npm run builder ios