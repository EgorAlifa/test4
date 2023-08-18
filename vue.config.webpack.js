// LIBS
const { remote: buildConfigs } = require('@goodt/webpack');

// CONFIGS

const { configureWebpack, chainWebpack } = buildConfigs({
    // build-time params
    projectDir: __dirname,
});

module.exports = {
    configureWebpack,
    chainWebpack
};
