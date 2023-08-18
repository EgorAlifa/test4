/**
 * @module
 * Used by `@goodt/package-loader` to provide `resolve` function to webpack
 * for dynamic modules (widgets) `import`.
 *
 * This entry is used to encapsulate package repo structure from external widget consumer.
 */

import packageJson from './package.json';

const { vendorOptions: { widgetsDir = './src' } = {} } = packageJson;
/**
 * Resolve widget `type` to dynamic module Promise.
 *
 * @param {string} type
 * @returns {import('vue').AsyncComponent}
 */
export const resolve = ({ type }) => {
    return import(
        /* webpackInclude: /\bElem[a-zA-Z0-9]+\.vue/ */
        `${widgetsDir}/${type}.vue`
        );
}