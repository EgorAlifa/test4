import { BaseViewModel } from '@goodt-common/layers';
import { DEFAULT_SOURCE_LIMIT } from '../constants';

class ViewModel extends BaseViewModel {
    data = [];

    requests = [];

    _widget;

    constructor({ widget }) {
        super();
        this._widget = widget;
    }

    /**
     * @return {boolean}
     */
    get isDremioPaginationLimit() {
        const { isDremioPaginationLimit } = this._widget.props;

        return isDremioPaginationLimit;
    }

    /**
     * @param {import('@goodt-common/data').Request[]} requests
     */
    setRequests(requests) {
        this.data = [];
        this.requests = requests;
    }

    /**
     * @param {import('@goodt-common/data').Request[]} requests
     * @param {boolean} forceUpdate
     * @return {object[][]}
     */
    async fetchData(requests = [], forceUpdate = false) {
        const { data, requests: fallbackRequests } = this;

        const mappedRequests = requests.map((request, index) => {
            const fallbackRequest = request ?? fallbackRequests[index];
            if ((request == null && data[index] != null && forceUpdate === false) || fallbackRequest == null) {
                return null;
            }

            // index === 0 корневой источник, остальные являются доп. источниками

            if (index === 0) {
                return this.fetchSourceData(fallbackRequest, null);
            }

            // При выключенной пагинации внутри dremio source.limit равен 0
            const forceLimit = this.isDremioPaginationLimit
                ? fallbackRequest.limit || DEFAULT_SOURCE_LIMIT
                : DEFAULT_SOURCE_LIMIT;

            return this.fetchSourceData(fallbackRequest, forceLimit);
        });

        const fetchedData = await Promise.all(mappedRequests);
        this.data = fetchedData.map((chunk, index) => (fallbackRequests[index] == null ? null : chunk ?? data[index]));
        return this.data;
    }

    /**
     * @param {import('@goodt-common/data').Request} request
     * @param {number} [forceLimit]
     * @return {Record<string, any>[]?}
     */
    async fetchSourceData(request, forceLimit = null) {
        if (forceLimit != null) {
            request.limit = forceLimit;
        }
        const { rows } = await request.send();
        return rows;
    }
}

export const createViewModel = (options) => new ViewModel(options);
