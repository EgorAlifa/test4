#!/usr/bin/env node
/**
 * Standalone launcher for the widgets package dev server.
 *
 * Designed to be compiled with `pkg` into a single .exe that a developer
 * (or an AI coding agent) can drop into the project root and double-click.
 * It needs no pre-installed Node.js / npm on the target machine: when
 * running as a pkg binary it re-invokes its own embedded Node runtime
 * (via the PKG_EXECPATH trick) to execute vue-cli-service straight off
 * disk, after unpacking the pre-resolved `node_modules.zip` bundle that
 * ships alongside it (this sidesteps the legacy peer-deps npm install).
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const isPkg = typeof process.pkg !== 'undefined';
const projectRoot = process.env.WIDGETS_PROJECT_ROOT
    ? path.resolve(process.env.WIDGETS_PROJECT_ROOT)
    : process.cwd();

function log(msg) {
    process.stdout.write(`[widgets-launcher] ${msg}\n`);
}

function fail(msg) {
    process.stderr.write(`[widgets-launcher] ERROR: ${msg}\n`);
    process.exitCode = 1;
}

function commandExists(cmd) {
    const probe = process.platform === 'win32' ? 'where' : 'which';
    const result = spawnSync(probe, [cmd], { stdio: 'ignore' });
    return result.status === 0;
}

function extractZip(zipPath, destDir) {
    fs.mkdirSync(destDir, { recursive: true });

    const attempts =
        process.platform === 'win32'
            ? [
                  { cmd: 'tar', args: ['-xf', zipPath, '-C', destDir] },
                  {
                      cmd: 'powershell',
                      args: [
                          '-NoProfile',
                          '-Command',
                          `Expand-Archive -Path '${zipPath}' -DestinationPath '${destDir}' -Force`
                      ]
                  }
              ]
            : [
                  { cmd: 'unzip', args: ['-q', zipPath, '-d', destDir] },
                  { cmd: 'tar', args: ['-xf', zipPath, '-C', destDir] }
              ];

    for (const attempt of attempts) {
        if (!commandExists(attempt.cmd)) continue;
        log(`Extracting node_modules.zip via "${attempt.cmd}"...`);
        const result = spawnSync(attempt.cmd, attempt.args, { stdio: 'inherit' });
        if (result.status === 0) return true;
        log(`"${attempt.cmd}" failed (exit ${result.status}), trying next method...`);
    }
    return false;
}

function ensureNodeModules() {
    const nodeModulesDir = path.join(projectRoot, 'node_modules');
    const marker = path.join(nodeModulesDir, '.bin');
    if (fs.existsSync(marker)) {
        log('node_modules already present, skipping extraction.');
        return true;
    }

    const zipPath = path.join(projectRoot, 'node_modules.zip');
    if (!fs.existsSync(zipPath)) {
        fail(
            `node_modules not found and node_modules.zip is missing next to the launcher.\n` +
                `Place node_modules.zip in: ${projectRoot}`
        );
        return false;
    }

    return extractZip(zipPath, projectRoot);
}

function resolveVueCliService() {
    const bin = path.join(
        projectRoot,
        'node_modules',
        '@vue',
        'cli-service',
        'bin',
        'vue-cli-service.js'
    );
    return fs.existsSync(bin) ? bin : null;
}

function readPackageJson() {
    try {
        const raw = fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        return {};
    }
}

function printElemSnippet(port, pkgJson) {
    const platformUrl = pkgJson?.vendorOptions?.platformUrl || '<url редактора>';
    const sample = pkgJson?.vendorOptions?.widgetsDir ? 'ElemHelloWorldDemo' : 'ElemYourWidget';
    log('');
    log('Dev server запущен. Дальше:');
    log(`  1. Откройте редактор платформы: ${platformUrl}`);
    log('  2. Откройте консоль браузера (F12) и выполните:');
    log('');
    log(
        `     $elem.add({ types: ['${sample}'], url: 'http://localhost:${port}' })`
    );
    log('');
    log('  3. Виджет появится в редакторе и будет тянуться с вашего локального сервера.');
    log('     Чтобы отключить: $elem.remove() (и обновить страницу).');
    log('');
}

function run() {
    log(`Project root: ${projectRoot}`);

    if (!fs.existsSync(path.join(projectRoot, 'package.json'))) {
        fail('package.json not found in project root. Place the launcher in the project root folder.');
        return;
    }

    if (!ensureNodeModules()) return;

    const vueCliService = resolveVueCliService();
    if (!vueCliService) {
        fail('node_modules/@vue/cli-service is missing after extraction — check node_modules.zip contents.');
        return;
    }

    const port = process.env.DEV_SERVER_PORT || '3001';
    const pkgJson = readPackageJson();

    const env = Object.assign({}, process.env, { DEV_SERVER_PORT: port });
    let nodeBinary = process.execPath;
    if (isPkg) {
        // Re-invoke the Node runtime embedded in this binary as a plain
        // `node <script>` process instead of running the pkg snapshot.
        env.PKG_EXECPATH = 'PKG_INVOKE_NODEJS';
    }

    log(`Starting dev server on port ${port}...`);
    const child = spawn(nodeBinary, [vueCliService, 'serve'], {
        cwd: projectRoot,
        env,
        stdio: 'inherit'
    });

    child.on('error', (err) => fail(`Failed to start dev server: ${err.message}`));
    child.on('spawn', () => printElemSnippet(port, pkgJson));
    child.on('exit', (code) => {
        process.exitCode = code === null ? 1 : code;
    });

    process.on('SIGINT', () => child.kill('SIGINT'));
    process.on('SIGTERM', () => child.kill('SIGTERM'));
}

run();
