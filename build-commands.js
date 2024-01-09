import { Project } from 'ts-morph';
import { exec } from 'child_process';
import fs from 'fs';



function incrementBuildVersion(){
    const configContent = JSON.parse(fs.readFileSync('app.config.json', 'utf8'));

    configContent.versioning.build++;

    fs.writeFileSync('app.config.json', JSON.stringify(configContent, null, 4));
}


function updateVersionAndBuildOnProject(){
    const configContent = JSON.parse(fs.readFileSync('app.config.json', 'utf8'));
    const buildVersion = `${configContent.versioning.version}.${configContent.versioning.build}`
    const command = `npx capacitor-set-version -v ${configContent.versioning.version} -b ${buildVersion}`;

    console.log(command)
}

incrementBuildVersion();
updateVersionAndBuildOnProject();