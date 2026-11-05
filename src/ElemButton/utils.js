import { stringify } from 'qs';
import { omitBy, isNull } from 'lodash';
import { Url } from '@goodt-common/utils';

const isEmptyQueryValue = (value) =>
    value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);

/**
 * Converts a store / literal value into a query-string value.
 * Scalars → string, arrays → array of strings, objects → JSON.
 * Empty values (null, undefined, '', []) → undefined, i.e. the param is skipped.
 *
 * @param {*} value
 * @return {string|string[]|undefined}
 */
export const toQueryValue = (value) => {
    if (isEmptyQueryValue(value)) {
        return undefined;
    }
    if (Array.isArray(value)) {
        const items = value
            .filter((item) => isEmptyQueryValue(item) === false)
            .map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item)));
        return items.length > 0 ? items : undefined;
    }
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    return String(value);
};

/**
 * Serializes a query object; arrays become repeated keys (?a=1&a=2), undefined values are skipped.
 *
 * @param {Record<string, *>} query
 * @return {string}
 */
export const stringifyQuery = (query) => stringify(query, { arrayFormat: 'repeat' });

export const buildSerializedStoreUrl = (initialUrl, state, excludeKeys = []) => {
    const stateValues = Object.entries(state).reduce((acc, [key, { value }]) => ({ ...acc, [key]: value }), {});
    const filtered = excludeKeys.length
        ? Object.fromEntries(Object.entries(stateValues).filter(([k]) => !excludeKeys.includes(k)))
        : stateValues;
    const stateWithNonEmptyValues = omitBy(filtered, isNull);
    const serializedStateQuery = stringify(stateWithNonEmptyValues, { arrayFormat: 'repeat' });
    const [baseUrl, routeUrl] = initialUrl.split('#');
    const routeUrlParsed = Url.create(routeUrl.replace(/\/$/, ''));
    routeUrlParsed.search = serializedStateQuery;
    return Url.create({
        href: baseUrl,
        hash: routeUrlParsed
    }).toString();
};
