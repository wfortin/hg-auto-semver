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

try {
    const branch = getParentBranch();
    if (branch) {
        const releaseRegex = new RegExp('^release\\-', 'gim');
        const fixRegex = new RegExp('^fix\\-|[^a-z]fix\\-', 'gim');
        const featureRegex = new RegExp('^feature\\-|[^a-z]feature\\-', 'gim');

        if (releaseRegex.test(branch) || fixRegex.test(branch)) {
            console.log('Branch name contains "release-" or "fix-", bumping a PATCH version');
            bump(Version.PATCH);
        } else if (featureRegex.test(branch)) {
            console.log('Branch name contains "feature-", bumping a MINOR version');
            bump(Version.MINOR);
        }
    } else {
        console.log('No parent branch, exiting');
    }
} catch (err) {
    // We don't want our CI to have an error, just log it.
    console.log(err);
}
