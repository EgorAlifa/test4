import { ApiClientMethod, BaseApiService, buildRequest } from '@goodt-common/api';
import { createTransport, HttpTransportSymbol } from '@goodt-common/net';
/**
 * GeoApiService class
 */
export class GeoApiService extends BaseApiService {
    /**
     *
     * @param {string} url geo file
     * @return {Promise<import('@goodt-common/utils').ISafeResult<*, Error>>} result
     */
    getGeoDataLayer(url) {
        const request = buildRequest({
            action: {
                url,
                options: { method: ApiClientMethod.GET }
            }
        });

        return this.request(request);
    }
}

/**
 * Service factory
 *
 * @param {import('@goodt-common/api').IApiServiceOptions} options service options
 * @param {import('@goodt-common/net').ITransport} [transport] transport
 * @return {GeoApiService} service instance
 */
export const createGeoApiService = (options, transport) => {
    if (transport == null) {
        // eslint-disable-next-line no-param-reassign, ban/ban
        transport = createTransport(HttpTransportSymbol);
    }

    return new GeoApiService({ transport, options });
};
