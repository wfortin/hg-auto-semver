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
    const featureRegex = new RegExp('^feature\\-|[^a-z]feature\\-', 'gim');

    if (branch && featureRegex.test(branch)) {
        console.log('Branch name contains "feature-", bumping a MINOR version');
        bump(Version.MINOR);
    } else {
        console.log('Branch name doesn\'t contains "feature-", bumping a PATCH version');
        bump(Version.PATCH);
    }
} catch (err) {
    // We don't want our CI to have an error, just log it.
    console.log(err);
}
