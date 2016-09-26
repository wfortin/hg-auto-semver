#!/usr/bin/env node
'use strict';

const execSync = require('child_process').execSync;

const Version = {
    PATCH: 'patch',
    MINOR: 'minor',
    MAJOR: 'major'
};

function getParentBranch() {
    return execSync('hg log --rev "p2(.)" --template "{branch}"');
}

function bump(type) {
    return execSync(`npm version ${type}`);
}

function publish(version) {
    execSync(`hg commit --config ui.username=jenkins@coveo.com -m 'Release ${version}'`);
    execSync(`hg tag --config ui.username=jenkins@coveo.com ${version}`);

    execSync(`echo 'strict-ssl=false' > .npmrc`);
    execSync(`echo '//npm.corp.coveo.com/:_authToken=${process.env.NPM_TOKEN}' >> .npmrc`);
    execSync(`echo '@coveo:registry=https://npm.corp.coveo.com/' >> .npmrc`);

    execSync(`npm publish`);

    execSync(`hg --config auth.jenkins.prefix=* --config auth.jenkins.username=${process.env.HG_USR} --config auth.jenkins.password=${process.env.HG_PWD} --config 'auth.jenkins.schemes=http https' push`);
}

try {
    const branch = getParentBranch();
    if (branch) {
        const releaseRegex = new RegExp('^release\\-', 'gim');
        const fixRegex = new RegExp('^fix\\-|[^a-z]fix\\-', 'gim');
        const featureRegex = new RegExp('^feature\\-|[^a-z]feature\\-', 'gim');

        if (releaseRegex.test(branch) || fixRegex.test(branch)) {
            console.log('Branch name contains "release-" or "fix-", bumping a PATCH version');
            const version = bump(Version.PATCH);
            publish(version);
        } else if (featureRegex.test(branch)) {
            console.log('Branch name contains "feature-", bumping a MINOR version');
            const version = bump(Version.MINOR);
            publish(version);
        }
    } else {
        console.log('No parent branch, exiting');
    }
} catch (err) {
    // We don't want our CI to have an error, just log it.
    console.log(err);
}
