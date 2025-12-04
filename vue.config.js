const { OUTPUT_DIR } = require('./.config/consts');
const { configureWebpack, chainWebpack } = require('./vue.config.webpack');

module.exports = {
    outputDir: OUTPUT_DIR,
    // Webpack Module Federation
    publicPath: 'auto',
    devServer: {
        port: process.env.DEV_SERVER_PORT || 3001
    },
    productionSourceMap: process.env.NODE_ENV !== 'production',
    filenameHashing: true,
    // @NOTE this should be false as we use shadowMode
    css: { extract: false },
    configureWebpack,
    chainWebpack,
    lintOnSave: undefined,
    // eslint-disable-next-line global-require
    transpileDependencies: require('@goodt/webpack/remote/config/transpileDependencies')
};
