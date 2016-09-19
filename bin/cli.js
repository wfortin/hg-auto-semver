#!/usr/bin/env node
'use strict';

const exec = require('child_process').exec;
const npm = require('npm');

const Version = {
    PATCH: 'patch',
    MINOR: 'minor',
    MAJOR: 'major'
};

function getParentBranch(callback) {
    exec('hg log --rev "p2(.)" --template "{branch}"', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }

        callback(stdout);
    });
}

function bump(type) {
    npm.load((error, npm) => {
        console.log(error);
        npm.commands.version([type], function(error) {
            if (error) {
                console.error(`npm version error: ${error}`);
                return;
            }
        });
    });
}

getParentBranch((branch) => {
    const fixRegex = new RegExp('^fix\\-|[^a-z]fix\\-', 'gim');
    const featureRegex = new RegExp('^feature\\-|[^a-z]feature\\-', 'gim');

    if (fixRegex.test(branch)) {
        console.log('Branch name contains "fix-", bumping a PATCH version');
        bump(Version.PATCH)
    } else if (featureRegex.test(branch)) {
        console.log('Branch name contains "feature-", bumping a MINOR version');
        bump(Version.MINOR)
    }
});