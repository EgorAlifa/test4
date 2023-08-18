const { isProd } = require('@goodt-webpack/common/utils');
const { purge, ...restConfig } = require('@goodt/postcss-config/tailwind.config.js');

module.exports = {
    ...restConfig,
    ...isProd()
        ? { purge }
        : { purge: false }
};
