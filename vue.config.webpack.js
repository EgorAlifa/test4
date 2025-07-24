// LIBS
const { resolve, join } = require('path');
const { remote: buildConfigs } = require('@goodt/webpack');
const { isProd } = require('@goodt/webpack/common/utils');

// CONFIGS
const { OUTPUT_DIR, PROJECT_DIR, PROCESS_DIR, APP_BUILD_ENTRY_PATH } = require('./.config/consts');

const packageJson = require(join(PROJECT_DIR, 'package.json'));
const packageLockJson = require(join(PROCESS_DIR, 'package-lock.json'));

const { configureWebpack, chainWebpack } = buildConfigs({
    // build-time params
    isEsm: true,
    isProd: isProd(),
    useShared: true,
    useExternals: false,
    
    baseDir: PROCESS_DIR,
    outputDir: OUTPUT_DIR,
    buildEntryFilePath: resolve(PROJECT_DIR, APP_BUILD_ENTRY_PATH),
    entry: packageJson.name,
    
    packageJson,
    packageLockJson,
    
    remoteConfig: {
        widgetName: 'resolver',
        entryFile: `./remoteEntry.js`,
        exposes: {
            './resolver': APP_BUILD_ENTRY_PATH
        }
    }
});

module.exports = {
    configureWebpack,
    chainWebpack
};
