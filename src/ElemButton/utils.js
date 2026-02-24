import { stringify } from 'qs';
import { omitBy, isNull } from 'lodash';
import { Url } from '@goodt-common/utils';

export const buildSerializedStoreUrl = (initialUrl, state) => {
    const stateValues = Object.entries(state).reduce((acc, [key, { value }]) => ({ ...acc, [key]: value }), {});
    const stateWithNonEmptyValues = omitBy(stateValues, isNull);
    const serializedStateQuery = stringify(stateWithNonEmptyValues, { arrayFormat: 'repeat' });
    const [baseUrl, routeUrl] = initialUrl.split('#');
    const routeUrlParsed = Url.create(routeUrl.replace(/\/$/, ''));
    routeUrlParsed.search = serializedStateQuery;
    return Url.create({
        href: baseUrl,
        hash: routeUrlParsed
    }).toString();
};
