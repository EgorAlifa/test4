import { stringify } from 'qs';
import { omitBy, isNull } from 'lodash';
import { Url } from '@goodt-common/utils';

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
