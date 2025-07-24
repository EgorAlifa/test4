#!/usr/bin/env node
const { resolve } = require('path');
const { unlinkSync, rmdirSync } = require('fs');
const { execSync } = require('child_process');

try {
    const packageLockPathname = resolve(__dirname, '../package-lock.json');
    unlinkSync(packageLockPathname);
} catch {
    /* void */
}

try {
    const nodeModulesPathname = resolve(__dirname, '../node_modules');
    rmdirSync(nodeModulesPathname, { recursive: true });
} catch {
    /* void */
}

execSync(`npm cache clean --force`, { stdio: 'inherit' });
execSync(`npm i --force`, { stdio: 'inherit' });
