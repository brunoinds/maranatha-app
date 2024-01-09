import { Project } from 'ts-morph';
import { exec } from 'child_process';
import fs from 'fs';
import * as config from 'app.config.ts'; 



function incrementBuildVersion(){
    const project = new Project();
    const sourceFile = project.addSourceFileAtPath('app.config.ts'); 

    const configNode = sourceFile.getVariableDeclaration('config');
    console.log(configNode.__proto__)

    const buildProp = configNode.getProperty('build');

    // Increment last number
    const buildValue = buildProp.getStringLiteral();
    const parts = buildValue.text.split('.');
    parts[parts.length - 1] = (parseInt(parts[parts.length - 1]) + 1).toString();
    const newBuildValue = parts.join('.');

    buildProp.setStringLiteral(newBuildValue);

    sourceFile.print()
    //sourceFile.save();
}


function updateVersionAndBuildOnProject(){
    //Run a command to update the version and build on the project:
    //Get current version and build:
    //Import ts file and get the version and build from /app.config.ts:


    const response = fs.readFileSync('app.config.ts', 'utf8');
    console.log(config);

    const command = `npx capacitor-set-version -v 1.1.0 -b 1`
}

updateVersionAndBuildOnProject();